import Dexie, { type Table } from "dexie";

export interface DBProfile {
  id: string;
  name: string;
  sex: "male" | "female";
  birthYear: number;
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg?: number;
  activityLevel: string;
  goalType: string;
  trainingDaysPerWeek?: number;
  dietPreference?: string;
  units: string;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: string;
}

export interface DBTargets {
  id: string;
  profileId: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  waterMl: number;
  calculationMethod: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: string;
}

export interface DBFood {
  id: string;
  source: string;
  sourceId?: string;
  barcode?: string;
  name: string;
  brand?: string;
  servingSizeG?: number;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  fiberPer100g?: number;
  sugarPer100g?: number;
  sodiumPer100g?: number;
  confidenceScore: number;
  verified: boolean;
  rawJson?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  syncStatus: string;
}

export interface DBFoodLog {
  id: string;
  foodId: string;
  mealType: string;
  quantityG: number;
  servingLabel: string;
  loggedAt: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  syncStatus: string;
}

export interface DBWaterLog {
  id: string;
  amountMl: number;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  syncStatus: string;
}

export interface DBBodyMetric {
  id: string;
  weightKg?: number;
  waistCm?: number;
  hipCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  bodyFatPercent?: number;
  mood1To5?: number;
  sleepHours?: number;
  steps?: number;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  syncStatus: string;
}

export interface DBWorkout {
  id: string;
  name: string;
  type: string;
  startedAt: string;
  durationMinutes?: number;
  perceivedEffort1To10?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  syncStatus: string;
}

export interface DBHabit {
  id: string;
  name: string;
  targetFrequency: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  syncStatus: string;
}

export interface DBHabitLog {
  id: string;
  habitId: string;
  completedAt: string;
  value?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  syncStatus: string;
}

class MeBodyDB extends Dexie {
  profiles!: Table<DBProfile, string>;
  targets!: Table<DBTargets, string>;
  foods!: Table<DBFood, string>;
  foodLogs!: Table<DBFoodLog, string>;
  waterLogs!: Table<DBWaterLog, string>;
  bodyMetrics!: Table<DBBodyMetric, string>;
  workouts!: Table<DBWorkout, string>;
  habits!: Table<DBHabit, string>;
  habitLogs!: Table<DBHabitLog, string>;

  constructor() {
    super("MeBodyDB");
    this.version(1).stores({
      profiles: "&id, syncStatus",
      targets: "&id, profileId, syncStatus",
      foods: "&id, name, barcode, source, syncStatus",
      foodLogs: "&id, foodId, mealType, loggedAt, syncStatus",
      waterLogs: "&id, loggedAt, syncStatus",
      bodyMetrics: "&id, recordedAt, syncStatus",
      workouts: "&id, startedAt, syncStatus",
      habits: "&id, syncStatus",
      habitLogs: "&id, habitId, completedAt, syncStatus",
    });
  }
}

export const db = new MeBodyDB();
