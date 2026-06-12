import { getProfile, getTargets, saveTargets, getBodyMetrics, getFoodLogsForRange } from "@/db/queries";
import { calculateMacroTargets } from "./calculations";
import type { DBTargets } from "@/db/localDb";

interface WeeklyAdjustmentResult {
  adjusted: boolean;
  reason: string;
  previousTargets: DBTargets | null;
  newTargets: DBTargets | null;
}

export async function runWeeklyAutoAdjust(): Promise<WeeklyAdjustmentResult> {
  const profile = await getProfile();
  if (!profile) return { adjusted: false, reason: "No profile found", previousTargets: null, newTargets: null };

  const targets = await getTargets(profile.id);
  if (!targets) return { adjusted: false, reason: "No targets found", previousTargets: null, newTargets: null };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const now = new Date();

  const metrics = await getBodyMetrics(7);
  const weightMetrics = metrics.filter((m) => m.weightKg != null);

  // Recalculate targets with updated weight
  const latestWeight = weightMetrics.length > 0 ? weightMetrics[0].weightKg! : profile.currentWeightKg;

  const updatedProfile = {
    name: profile.name,
    sex: profile.sex,
    birthYear: profile.birthYear,
    heightCm: profile.heightCm,
    currentWeightKg: latestWeight,
    goalWeightKg: profile.goalWeightKg ?? profile.currentWeightKg,
    activityLevel: profile.activityLevel as any,
    goalType: profile.goalType as any,
    trainingDaysPerWeek: profile.trainingDaysPerWeek ?? 3,
    dietPreference: profile.dietPreference as any,
    units: profile.units as any,
    calorieVisibility: profile.calorieVisibility,
    cycleTracking: profile.cycleTracking ?? false,
    pregnancyStatus: profile.pregnancyStatus ?? "none",
    chronicConditions: profile.chronicConditions ?? [],
    medications: profile.medications ?? [],
  };

  const newCalc = calculateMacroTargets(updatedProfile);

  // Check if adjustment is meaningful (≥5% change in calories or ≥5g protein)
  const calChange = Math.abs(newCalc.calories - targets.calories);
  const proChange = Math.abs(newCalc.proteinG - targets.proteinG);
  const calPct = targets.calories > 0 ? calChange / targets.calories : 0;

  if (calPct < 0.05 && proChange < 5 && targets.calculationMethod !== "adaptive_weekly") {
    // First auto-adjust run - always save to set calculationMethod
    await saveTargets({
      ...targets,
      calories: newCalc.calories,
      proteinG: newCalc.proteinG,
      carbsG: newCalc.carbsG,
      fatG: newCalc.fatG,
      fiberG: newCalc.fiberG,
      waterMl: newCalc.waterMl,
      calculationMethod: "adaptive_weekly",
    });
    return {
      adjusted: true,
      reason: `Weekly auto-check: targets validated. Weight: ${latestWeight}kg.`,
      previousTargets: targets,
      newTargets: { ...targets, ...newCalc, calculationMethod: "adaptive_weekly" },
    };
  }

  if (calPct >= 0.05 || proChange >= 5) {
    const direction = newCalc.calories > targets.calories ? "increased" : "decreased";
    await saveTargets({
      ...targets,
      calories: newCalc.calories,
      proteinG: newCalc.proteinG,
      carbsG: newCalc.carbsG,
      fatG: newCalc.fatG,
      fiberG: newCalc.fiberG,
      waterMl: newCalc.waterMl,
      calculationMethod: "adaptive_weekly",
    });

    return {
      adjusted: true,
      reason: `Targets ${direction} based on weight change from ${profile.currentWeightKg}kg → ${latestWeight}kg (cal: ${targets.calories}→${newCalc.calories}, pro: ${targets.proteinG}g→${newCalc.proteinG}g)`,
      previousTargets: targets,
      newTargets: { ...targets, ...newCalc, calculationMethod: "adaptive_weekly" },
    };
  }

  return {
    adjusted: false,
    reason: "No significant weight change — targets unchanged.",
    previousTargets: targets,
    newTargets: targets,
  };
}
