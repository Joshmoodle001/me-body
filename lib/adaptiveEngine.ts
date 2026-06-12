import type { DBProfile, DBTargets } from "@/db/localDb";

export type GoalMode = "recomposition" | "fat_loss" | "muscle_gain" | "maintenance" | "pregnancy_safe" | "medical_review" | "strength_function_priority";

export interface AdaptivePlan {
  mode: GoalMode;
  proteinPriority: "high" | "moderate";
  sleepPriority: "high" | "moderate";
  energyStrategy: string;
  trainingStrategy: string;
  adjustment: string;
  nudgeOrder?: string[];
  reasonCodes: string[];
}

interface TrendData {
  foodConfidenceScore: number;
  sleepHoursAvg7d?: number;
  recoveryReadinessScore?: string;
  waistTrend28d?: string;
  strengthTrend28d?: string;
  weightTrend?: { direction: string; changeKg: number };
  stepsDown?: boolean;
  hungerHigh?: boolean;
  fatigueHigh?: boolean;
  plateau21d?: boolean;
  loggingDays14d?: number;
}

export function chooseGoalMode(profile: DBProfile, trainingAgeMonths: number, detrainedFlag: boolean, waistRiskFlag: boolean): GoalMode {
  if (profile.pregnancyStatus === "pregnant") return "pregnancy_safe";

  const hasHighRisk = profile.chronicConditions.some((c) => ["diabetes_type1", "ckd"].includes(c))
    || profile.medications.some((m) => ["insulin", "sulfonylurea"].includes(m));
  if (hasHighRisk) return "medical_review";

  const age = new Date().getFullYear() - profile.birthYear;
  if (age >= 60) return "strength_function_priority";

  const recompEligible = trainingAgeMonths <= 12 || detrainedFlag || waistRiskFlag;
  if (recompEligible && profile.goalType !== "performance") return "recomposition";

  switch (profile.goalType) {
    case "fat_loss": return "fat_loss";
    case "muscle_gain": return "muscle_gain";
    case "maintenance": return "maintenance";
    default: return "recomposition";
  }
}

export function adaptiveTargets(
  profile: DBProfile,
  targets: DBTargets,
  trainingAgeMonths: number,
  detrainedFlag: boolean,
  waistRiskFlag: boolean,
  trends: TrendData
): AdaptivePlan {
  const mode = chooseGoalMode(profile, trainingAgeMonths, detrainedFlag, waistRiskFlag);

  const plan: AdaptivePlan = {
    mode,
    proteinPriority: "high",
    sleepPriority: "high",
    energyStrategy: "",
    trainingStrategy: "",
    adjustment: "",
    reasonCodes: [mode],
  };

  switch (mode) {
    case "pregnancy_safe":
      plan.energyStrategy = "no_aggressive_deficit";
      plan.trainingStrategy = "maintain_or_safe_progress";
      plan.adjustment = "pregnancy_mode_active";
      plan.reasonCodes.push("pregnancy_override");
      return plan;

    case "medical_review":
      plan.energyStrategy = "hold";
      plan.trainingStrategy = "conservative";
      plan.adjustment = "medical_review_required";
      plan.reasonCodes.push("medical_override");
      return plan;

    case "strength_function_priority":
      plan.energyStrategy = "maintenance_or_small_deficit";
      plan.trainingStrategy = "strength_balance_function";
      plan.adjustment = "age_priority_active";
      plan.reasonCodes.push("age_60_plus");
      return plan;

    case "recomposition":
      plan.energyStrategy = "maintenance_to_small_deficit";
      plan.trainingStrategy = "progressive_resistance_2plus_sessions";
      plan.reasonCodes.push("recomp_eligible");
      break;

    case "fat_loss":
      plan.energyStrategy = "moderate_deficit";
      plan.trainingStrategy = "progressive_resistance_plus_activity";
      break;

    case "muscle_gain":
      plan.energyStrategy = "small_surplus_or_high_end_maintenance";
      plan.trainingStrategy = "hypertrophy_volume_progression";
      break;

    default:
      plan.energyStrategy = "maintenance";
      plan.trainingStrategy = "maintain_consistency";
  }

  // Trend-based adjustments
  if (trends.foodConfidenceScore < 0.60) {
    plan.adjustment = "improve_logging_quality_first";
    plan.reasonCodes.push("low_food_confidence");
    return plan;
  }

  if (trends.sleepHoursAvg7d !== undefined && trends.sleepHoursAvg7d < 7) {
    plan.adjustment = "protect_recovery_before_escalation";
    plan.reasonCodes.push("low_sleep");
    return plan;
  }

  if (trends.waistTrend28d === "down" && trends.strengthTrend28d === "up_or_stable") {
    plan.adjustment = "stay_the_course";
    plan.reasonCodes.push("recomp_success");
    return plan;
  }

  if (trends.weightTrend && trends.weightTrend.changeKg < -0.5 && trends.strengthTrend28d === "down") {
    plan.adjustment = "raise_calories_or_reduce_fatigue";
    plan.reasonCodes.push("weight_down_strength_down");
    return plan;
  }

  if (trends.stepsDown && trends.hungerHigh && trends.fatigueHigh) {
    plan.adjustment = "consider_maintenance_week";
    plan.reasonCodes.push("fatigue_hunger_steps");
    return plan;
  }

  if (trends.plateau21d && (trends.loggingDays14d ?? 0) >= 10) {
    plan.adjustment = "small_nudge_only";
    plan.nudgeOrder = ["increase_steps_slightly", "tighten_low_confidence_foods", "reduce_calories_small_if_needed"];
    plan.reasonCodes.push("verified_plateau");
    return plan;
  }

  plan.adjustment = "monitor";
  return plan;
}

export function getGoalModeLabel(mode: GoalMode): string {
  const labels: Record<GoalMode, string> = {
    recomposition: "Body Recomposition",
    fat_loss: "Fat Loss",
    muscle_gain: "Muscle Gain",
    maintenance: "Maintenance",
    pregnancy_safe: "Pregnancy-Safe",
    medical_review: "Clinician Review",
    strength_function_priority: "Strength & Function",
  };
  return labels[mode];
}

export function getGoalModeDescription(mode: GoalMode): string {
  const descriptions: Record<GoalMode, string> = {
    recomposition: "Build strength, protect muscle, and reduce waist size before using aggressive cut or bulk targets.",
    fat_loss: "Moderate deficit with progressive resistance to preserve lean mass while reducing body fat.",
    muscle_gain: "Small surplus with hypertrophy-focused training for lean mass gain.",
    maintenance: "Stay where you are and build consistency with balanced nutrition.",
    pregnancy_safe: "Prioritize safe movement and nutrient adequacy. No aggressive deficits.",
    medical_review: "Conservative coaching while you coordinate with your healthcare team.",
    strength_function_priority: "Protect muscle and function with resistance training and protein, with conservative fat loss.",
  };
  return descriptions[mode];
}
