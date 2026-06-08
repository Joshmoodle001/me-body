export const APP_NAME = "Me Body";
export const APP_VERSION = "0.1.0";

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

export const FOOD_API_TIMEOUT_MS = 10000;
export const DEBOUNCE_SCAN_MS = 2000;
export const INSIGHT_GENERATION_INTERVAL_MS = 1000 * 60 * 5;
