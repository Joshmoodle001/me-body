export const APP_NAME = "Me Body";
export const APP_VERSION = "0.2.0";

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const GOAL_TYPES = ["fat_loss", "muscle_gain", "maintenance", "performance", "habit_reset"] as const;
export type GoalType = (typeof GOAL_TYPES)[number];

export const ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "active", "very_active"] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export const DIET_PREFERENCES = ["any", "omnivore", "vegetarian", "vegan", "pescatarian", "keto", "paleo"] as const;
export type DietPreference = (typeof DIET_PREFERENCES)[number];

export const WORKOUT_TYPES = ["strength", "cardio", "hiit", "mobility", "sport", "other"] as const;
export type WorkoutType = (typeof WORKOUT_TYPES)[number];

export const CALORIE_VISIBILITY = ["visible", "hidden"] as const;
export type CalorieVisibility = (typeof CALORIE_VISIBILITY)[number];

export const PREGNANCY_STATUSES = ["none", "pregnant", "postpartum", "not_applicable"] as const;
export type PregnancyStatus = (typeof PREGNANCY_STATUSES)[number];

export const CHRONIC_CONDITIONS = [
  "none",
  "diabetes_type1",
  "diabetes_type2",
  "prediabetes",
  "hypertension",
  "ckd",
  "heart_disease",
  "thyroid_disorder",
  "pcos",
  "ibs",
  "coeliac",
  "lactose_intolerance",
  "gout",
  "anaemia",
  "other",
] as const;
export type ChronicCondition = (typeof CHRONIC_CONDITIONS)[number];

export const MEDICATION_CLASSES = [
  "none",
  "insulin",
  "sulfonylurea",
  "metformin",
  "blood_pressure_meds",
  "cholesterol_meds",
  "antidepressant",
  "antipsychotic",
  "thyroid_meds",
  "corticosteroid",
  "beta_blocker",
  "other",
] as const;
export type MedicationClass = (typeof MEDICATION_CLASSES)[number];

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const GOAL_MULTIPLIERS: Record<GoalType, number> = {
  fat_loss: 0.85,
  muscle_gain: 1.07,
  maintenance: 1.0,
  performance: 1.03,
  habit_reset: 1.0,
};

export const PROTEIN_PER_KG: Record<GoalType, number> = {
  fat_loss: 2.0,
  muscle_gain: 1.8,
  maintenance: 1.6,
  performance: 1.7,
  habit_reset: 1.6,
};

export const MIN_FAT_G_PER_KG = 0.7;
export const FIBER_LOW_CAL = 25;
export const FIBER_HIGH_CAL = 35;
export const FIBER_CAL_THRESHOLD = 2500;
export const DEFAULT_WATER_ML_PER_KG = 35;

export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

export const SYNC_STATUSES = ["local", "pending", "synced", "error"] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const DAY_TYPES = ["training", "rest"] as const;
export type DayType = (typeof DAY_TYPES)[number];

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  training: "Training Day",
  rest: "Rest Day",
};

export const DAY_TYPE_MACRO_OFFSET: Record<DayType, number> = {
  training: 1.0,
  rest: 0.9,
};

export const FOOD_API_TIMEOUT_MS = 10000;
export const DEBOUNCE_SCAN_MS = 2000;
export const INSIGHT_GENERATION_INTERVAL_MS = 1000 * 60 * 5;
