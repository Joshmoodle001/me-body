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
  calorieVisibility: "visible" | "hidden";
  cycleTracking: boolean;
  pregnancyStatus: "none" | "pregnant" | "postpartum" | "not_applicable";
  chronicConditions: string[];
  medications: string[];
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
  locale?: string;
  servingSizeG?: number;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  fiberPer100g?: number;
  sugarPer100g?: number;
  sodiumPer100g?: number;
  confidenceScore: number;
  nutrientCompleteness: number;
  localeMatch: number;
  portionCertainty: number;
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
  notes?: string;
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

export interface DBWorkoutSet {
  id: string;
  workoutId: string;
  exerciseName: string;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  distanceKm?: number;
  durationSeconds?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  syncStatus: string;
}

export interface DBSafetyFlag {
  id: string;
  profileId: string;
  flagType: string;
  severity: "info" | "warning" | "danger" | "emergency";
  condition: string;
  action: "pause" | "modify" | "refer" | "emergency";
  message: string;
  sourceRefs: string[];
  active: boolean;
  triggeredAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBContentItem {
  id: string;
  kind: string;
  slug: string;
  locale: string;
  title: string;
  summary: string;
  body: string;
  topicTags: string[];
  audienceTags: string[];
  evidenceLevel: string;
  confidenceScore: number;
  sourceRefs: string[];
  reviewStatus: string;
  version: number;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBProvenance {
  id: string;
  sourceId: string;
  citationText: string;
  sourceType: string;
  licence: string;
  url: string;
  jurisdiction: string;
  version: string;
  retrievedAt: string;
  createdAt: string;
  updatedAt: string;
}

class MeBodyDB extends Dexie {
  profiles!: Table<DBProfile, string>;
  targets!: Table<DBTargets, string>;
  foods!: Table<DBFood, string>;
  foodLogs!: Table<DBFoodLog, string>;
  waterLogs!: Table<DBWaterLog, string>;
  bodyMetrics!: Table<DBBodyMetric, string>;
  workouts!: Table<DBWorkout, string>;
  workoutSets!: Table<DBWorkoutSet, string>;
  habits!: Table<DBHabit, string>;
  habitLogs!: Table<DBHabitLog, string>;
  safetyFlags!: Table<DBSafetyFlag, string>;
  contentItems!: Table<DBContentItem, string>;
  provenance!: Table<DBProvenance, string>;

  constructor() {
    super("MeBodyDB");

    this.version(4).stores({
      profiles: "&id, syncStatus",
      targets: "&id, profileId, syncStatus",
      foods: "&id, name, barcode, source, locale, syncStatus",
      foodLogs: "&id, foodId, mealType, loggedAt, syncStatus",
      waterLogs: "&id, loggedAt, syncStatus",
      bodyMetrics: "&id, recordedAt, syncStatus",
      workouts: "&id, startedAt, syncStatus",
      workoutSets: "&id, workoutId",
      habits: "&id, syncStatus",
      habitLogs: "&id, habitId, completedAt, syncStatus",
      safetyFlags: "&id, profileId",
      contentItems: "&id, kind, slug, locale",
      provenance: "&id, sourceId",
    });
  }
}

const DB_NAME = "MeBodyDB";
const INIT_FLAG = "me_body_v5";

let _db: MeBodyDB | null = null;
let _initPromise: Promise<MeBodyDB> | null = null;

async function initDatabase(): Promise<MeBodyDB> {
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    // Nuke old corrupted database - must complete before Dexie opens
    if (typeof window !== "undefined" && !window.sessionStorage.getItem(INIT_FLAG)) {
      await new Promise<void>((resolve) => {
        const req = window.indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => { window.sessionStorage.setItem(INIT_FLAG, "1"); resolve(); };
        req.onerror = () => { window.sessionStorage.setItem(INIT_FLAG, "1"); resolve(); };
        req.onblocked = () => {
          req.onblocked = () => {};
          window.sessionStorage.setItem(INIT_FLAG, "1");
          resolve();
        };
      });
    }
    _db = new MeBodyDB();
    return _db;
  })();

  return _initPromise;
}

export async function getDb(): Promise<MeBodyDB> {
  return initDatabase();
}
