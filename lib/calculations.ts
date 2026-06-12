import type { Profile, Targets } from "./validation";
import {
  ACTIVITY_MULTIPLIERS,
  GOAL_MULTIPLIERS,
  PROTEIN_PER_KG,
  MIN_FAT_G_PER_KG,
  FIBER_LOW_CAL,
  FIBER_HIGH_CAL,
  FIBER_CAL_THRESHOLD,
  DEFAULT_WATER_ML_PER_KG,
  CALORIES_PER_GRAM,
} from "./constants";

export function calculateAgeFromBirthYear(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

export function calculateBmrMifflin(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: "male" | "female"
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function calculateTdee(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel as keyof typeof ACTIVITY_MULTIPLIERS] ?? 1.2;
  return Math.round(bmr * multiplier);
}

export function calculateMacroTargets(profile: Profile): Targets {
  const age = calculateAgeFromBirthYear(profile.birthYear);
  const bmr = calculateBmrMifflin(profile.currentWeightKg, profile.heightCm, age, profile.sex);
  const tdee = calculateTdee(bmr, profile.activityLevel);
  const goalMultiplier = GOAL_MULTIPLIERS[profile.goalType] ?? 1.0;
  const calories = Math.round(tdee * goalMultiplier);

  const proteinPerKg = PROTEIN_PER_KG[profile.goalType] ?? 1.6;
  const proteinG = Math.round(profile.currentWeightKg * proteinPerKg);
  const proteinCal = proteinG * CALORIES_PER_GRAM.protein;

  const fatG = Math.round((profile.currentWeightKg * MIN_FAT_G_PER_KG * 9) / CALORIES_PER_GRAM.fat);
  const fatCal = fatG * CALORIES_PER_GRAM.fat;

  const remainingCal = calories - proteinCal - fatCal;
  const carbsG = Math.max(0, Math.round(remainingCal / CALORIES_PER_GRAM.carbs));

  const fiberG = calories < FIBER_CAL_THRESHOLD ? FIBER_LOW_CAL : FIBER_HIGH_CAL;
  const waterMl = Math.round(profile.currentWeightKg * DEFAULT_WATER_ML_PER_KG);

  return {
    calories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    waterMl,
    calculationMethod: "mifflin_st_jeor",
  };
}

export function nutritionForQuantity(
  per100g: { calories?: number; protein?: number; carbs?: number; fat?: number; fiber?: number },
  quantityG: number
) {
  const factor = (quantityG && quantityG > 0) ? quantityG / 100 : 0;
  return {
    calories: Math.round((per100g.calories ?? 0) * factor),
    proteinG: +(per100g.protein ?? 0) * factor,
    carbsG: +(per100g.carbs ?? 0) * factor,
    fatG: +(per100g.fat ?? 0) * factor,
    fiberG: +(per100g.fiber ?? 0) * factor,
  };
}

export function calculateDailyNutrition(
  logs: { calories?: number; proteinG?: number; carbsG?: number; fatG?: number; fiberG?: number }[]
): { calories: number; proteinG: number; carbsG: number; fatG: number; fiberG: number } {
  let calories = 0, proteinG = 0, carbsG = 0, fatG = 0, fiberG = 0;
  for (const log of logs) {
    calories += log.calories ?? 0;
    proteinG += log.proteinG ?? 0;
    carbsG += log.carbsG ?? 0;
    fatG += log.fatG ?? 0;
    fiberG += log.fiberG ?? 0;
  }
  return { calories, proteinG, carbsG, fatG, fiberG };
}

export function calculateWeeklyAverages(
  dailyValues: { calories?: number; proteinG?: number; weightKg?: number }[]
) {
  if (dailyValues.length === 0) return { avgCalories: 0, avgProtein: 0, avgWeight: 0 };
  const n = dailyValues.length;
  return {
    avgCalories: Math.round(dailyValues.reduce((s, d) => s + (d.calories ?? 0), 0) / n),
    avgProtein: +(dailyValues.reduce((s, d) => s + (d.proteinG ?? 0), 0) / n).toFixed(1),
    avgWeight: +(dailyValues.reduce((s, d) => s + (d.weightKg ?? 0), 0) / n).toFixed(1),
  };
}

export function calculateWeightTrend(weights: { weightKg: number; recordedAt: string }[]): { direction: string; changeKg: number; days: number } {
  if (weights.length < 2) return { direction: "not_enough_data", changeKg: 0, days: 0 };
  const sorted = [...weights].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const changeKg = +(last.weightKg - first.weightKg).toFixed(1);
  const days = Math.max(1, Math.round((new Date(last.recordedAt).getTime() - new Date(first.recordedAt).getTime()) / 86400000));
  let direction = "stable";
  if (changeKg < -0.5) direction = "decreasing";
  else if (changeKg > 0.5) direction = "increasing";
  return { direction, changeKg, days };
}

export function calculateProteinConsistency(logs: { proteinG: number; loggedAt: string }[], target: number): number {
  if (logs.length === 0) return 0;
  const daysHit = logs.filter((l) => l.proteinG >= target).length;
  return Math.round((daysHit / logs.length) * 100);
}

export function calculateWorkoutConsistency(workouts: { startedAt: string }[], days: number): number {
  if (days === 0) return 0;
  return Math.round((workouts.length / days) * 100);
}
