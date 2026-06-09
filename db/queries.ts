import { getDb } from "./localDb";
import type { DBProfile, DBTargets, DBFood, DBFoodLog, DBWaterLog, DBBodyMetric, DBWorkout, DBWorkoutSet, DBHabit, DBHabitLog, DBSafetyFlag, DBContentItem, DBProvenance } from "./localDb";

let _db: Awaited<ReturnType<typeof getDb>> | null = null;
async function db(): Promise<Awaited<ReturnType<typeof getDb>>> {
  if (_db) return _db;
  _db = await getDb();
  return _db;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

// Profile
export async function getProfile(): Promise<DBProfile | undefined> {
  return (await db()).profiles.orderBy("createdAt").last();
}

export async function saveProfile(profile: Partial<DBProfile> & { name: string; sex: "male" | "female"; birthYear: number; heightCm: number; currentWeightKg: number; activityLevel: string; goalType: string }): Promise<DBProfile> {
  const existing = await getProfile();
  const nowStr = now();
  const data: DBProfile = {
    id: existing?.id ?? generateId(),
    name: profile.name,
    sex: profile.sex,
    birthYear: profile.birthYear,
    heightCm: profile.heightCm,
    currentWeightKg: profile.currentWeightKg,
    goalWeightKg: profile.goalWeightKg,
    activityLevel: profile.activityLevel,
    goalType: profile.goalType,
    trainingDaysPerWeek: profile.trainingDaysPerWeek,
    dietPreference: profile.dietPreference,
    units: profile.units ?? "metric",
    onboardingComplete: profile.onboardingComplete ?? true,
    calorieVisibility: profile.calorieVisibility ?? "visible",
    cycleTracking: profile.cycleTracking ?? false,
    pregnancyStatus: profile.pregnancyStatus ?? "none",
    chronicConditions: profile.chronicConditions ?? [],
    medications: profile.medications ?? [],
    createdAt: existing?.createdAt ?? nowStr,
    updatedAt: nowStr,
    syncStatus: "local",
  };
  (await db()).profiles.put(data);
  return data;
}

// Targets
export async function getTargets(profileId: string): Promise<DBTargets | undefined> {
  return (await db()).targets.where("profileId").equals(profileId).first();
}

export async function saveTargets(targets: Omit<DBTargets, "id" | "createdAt" | "updatedAt" | "syncStatus"> & { id?: string }): Promise<DBTargets> {
  const nowStr = now();
  const data: DBTargets = {
    id: targets.id ?? generateId(),
    profileId: targets.profileId,
    calories: targets.calories,
    proteinG: targets.proteinG,
    carbsG: targets.carbsG,
    fatG: targets.fatG,
    fiberG: targets.fiberG,
    waterMl: targets.waterMl,
    calculationMethod: targets.calculationMethod,
    createdAt: nowStr,
    updatedAt: nowStr,
    syncStatus: "local",
  };
  (await db()).targets.put(data);
  return data;
}

// Foods
export async function searchLocalFoods(query: string): Promise<DBFood[]> {
  const q = query.toLowerCase();
  return (await db()).foods.filter((f) => f.name.toLowerCase().includes(q) || (f.brand ?? "").toLowerCase().includes(q) || (f.barcode ?? "").includes(q)).limit(50).toArray();
}

export async function getFoodById(id: string): Promise<DBFood | undefined> {
  return (await db()).foods.get(id);
}

export async function getFoodByBarcode(barcode: string): Promise<DBFood | undefined> {
  return (await db()).foods.where("barcode").equals(barcode).first();
}

export async function saveFood(food: Omit<DBFood, "id" | "createdAt" | "updatedAt" | "syncStatus"> & { id?: string }): Promise<DBFood> {
  const nowStr = now();
  const data: DBFood = {
    id: food.id ?? generateId(),
    source: food.source,
    sourceId: food.sourceId,
    barcode: food.barcode,
    name: food.name,
    brand: food.brand,
    locale: food.locale,
    servingSizeG: food.servingSizeG,
    caloriesPer100g: food.caloriesPer100g,
    proteinPer100g: food.proteinPer100g,
    carbsPer100g: food.carbsPer100g,
    fatPer100g: food.fatPer100g,
    fiberPer100g: food.fiberPer100g,
    sugarPer100g: food.sugarPer100g,
    sodiumPer100g: food.sodiumPer100g,
    confidenceScore: food.confidenceScore,
    nutrientCompleteness: food.nutrientCompleteness ?? 0,
    localeMatch: food.localeMatch ?? 0,
    portionCertainty: food.portionCertainty ?? 0,
    verified: food.verified,
    rawJson: food.rawJson,
    createdAt: nowStr,
    updatedAt: nowStr,
    syncStatus: "local",
  };
  (await db()).foods.put(data);
  return data;
}

// Food logs
export async function getFoodLogsForDate(dateStr: string): Promise<DBFoodLog[]> {
  return (await db()).foodLogs.filter((l) => l.loggedAt >= `${dateStr}T00:00:00.000Z` && l.loggedAt <= `${dateStr}T23:59:59.999Z` && !l.deletedAt).toArray();
}

export async function getFoodLogsForRange(startDate: string, endDate: string): Promise<DBFoodLog[]> {
  return (await db()).foodLogs.filter((l) => l.loggedAt >= startDate && l.loggedAt <= endDate && !l.deletedAt).toArray();
}

export async function saveFoodLog(log: Omit<DBFoodLog, "id" | "createdAt" | "updatedAt" | "syncStatus"> & { id?: string }): Promise<DBFoodLog> {
  const nowStr = now();
  const data: DBFoodLog = {
    id: log.id ?? generateId(),
    foodId: log.foodId,
    mealType: log.mealType,
    quantityG: log.quantityG,
    servingLabel: log.servingLabel,
    loggedAt: log.loggedAt,
    notes: log.notes,
    createdAt: nowStr,
    updatedAt: nowStr,
    syncStatus: "local",
  };
  (await db()).foodLogs.put(data);
  return data;
}

export async function updateFoodLog(id: string, updates: Partial<DBFoodLog>): Promise<void> {
  (await db()).foodLogs.update(id, { ...updates, updatedAt: now() });
}

export async function softDeleteFoodLog(id: string): Promise<void> {
  (await db()).foodLogs.update(id, { deletedAt: now(), updatedAt: now(), syncStatus: "pending" });
}

// Water logs
export async function getWaterLogsForDate(dateStr: string): Promise<DBWaterLog[]> {
  return (await db()).waterLogs.filter((l) => l.loggedAt >= `${dateStr}T00:00:00.000Z` && l.loggedAt <= `${dateStr}T23:59:59.999Z` && !l.deletedAt).toArray();
}

export async function saveWaterLog(log: Omit<DBWaterLog, "id" | "createdAt" | "updatedAt" | "syncStatus">): Promise<DBWaterLog> {
  const nowStr = now();
  const data: DBWaterLog = {
    id: generateId(),
    ...log,
    createdAt: nowStr,
    updatedAt: nowStr,
    syncStatus: "local",
  };
  (await db()).waterLogs.put(data);
  return data;
}

export async function deleteWaterLog(id: string): Promise<void> {
  (await db()).waterLogs.update(id, { deletedAt: now(), updatedAt: now() });
}

// Body metrics
export async function getBodyMetrics(limit = 90): Promise<DBBodyMetric[]> {
  return (await db()).bodyMetrics.filter((m) => !m.deletedAt).reverse().limit(limit).toArray();
}

export async function getLatestBodyMetric(): Promise<DBBodyMetric | undefined> {
  return (await db()).bodyMetrics.filter((m) => !m.deletedAt).reverse().first();
}

export async function saveBodyMetric(metric: Omit<DBBodyMetric, "id" | "createdAt" | "updatedAt" | "syncStatus">): Promise<DBBodyMetric> {
  const nowStr = now();
  const data: DBBodyMetric = {
    id: generateId(),
    ...metric,
    createdAt: nowStr,
    updatedAt: nowStr,
    syncStatus: "local",
  };
  (await db()).bodyMetrics.put(data);
  return data;
}

// Workouts
export async function getWorkouts(limit = 30): Promise<DBWorkout[]> {
  return (await db()).workouts.filter((w) => !w.deletedAt).reverse().limit(limit).toArray();
}

export async function saveWorkout(workout: Omit<DBWorkout, "id" | "createdAt" | "updatedAt" | "syncStatus">): Promise<DBWorkout> {
  const nowStr = now();
  const data: DBWorkout = {
    id: generateId(),
    ...workout,
    createdAt: nowStr,
    updatedAt: nowStr,
    syncStatus: "local",
  };
  (await db()).workouts.put(data);
  return data;
}

// Workout Sets
export async function getWorkoutSets(workoutId: string): Promise<DBWorkoutSet[]> {
  return (await db()).workoutSets.where("workoutId").equals(workoutId).filter((s) => !s.deletedAt).toArray();
}

export async function saveWorkoutSet(set: Omit<DBWorkoutSet, "id" | "createdAt" | "updatedAt" | "syncStatus"> & { id?: string }): Promise<DBWorkoutSet> {
  const nowStr = now();
  const data: DBWorkoutSet = {
    id: set.id ?? generateId(),
    ...set,
    createdAt: nowStr,
    updatedAt: nowStr,
    syncStatus: "local",
  };
  (await db()).workoutSets.put(data);
  return data;
}

export async function deleteWorkoutSet(id: string): Promise<void> {
  (await db()).workoutSets.update(id, { deletedAt: now(), updatedAt: now() });
}

// Habits
export async function getHabits(): Promise<DBHabit[]> {
  return (await db()).habits.filter((h) => !h.deletedAt).toArray();
}

export async function saveHabit(habit: Omit<DBHabit, "id" | "createdAt" | "updatedAt" | "syncStatus">): Promise<DBHabit> {
  const nowStr = now();
  const data: DBHabit = {
    id: generateId(),
    ...habit,
    createdAt: nowStr,
    updatedAt: nowStr,
    syncStatus: "local",
  };
  (await db()).habits.put(data);
  return data;
}

export async function saveHabitLog(log: Omit<DBHabitLog, "id" | "createdAt" | "updatedAt" | "syncStatus">): Promise<DBHabitLog> {
  const nowStr = now();
  const data: DBHabitLog = {
    id: generateId(),
    ...log,
    createdAt: nowStr,
    updatedAt: nowStr,
    syncStatus: "local",
  };
  (await db()).habitLogs.put(data);
  return data;
}

// Safety Flags
export async function getActiveSafetyFlags(profileId: string): Promise<DBSafetyFlag[]> {
  return (await db()).safetyFlags.where("profileId").equals(profileId).filter((f) => f.active).toArray();
}

export async function getSafetyFlag(id: string): Promise<DBSafetyFlag | undefined> {
  return (await db()).safetyFlags.get(id);
}

export async function saveSafetyFlag(flag: Omit<DBSafetyFlag, "id" | "createdAt" | "updatedAt">): Promise<DBSafetyFlag> {
  const nowStr = now();
  const data: DBSafetyFlag = { id: generateId(), ...flag, createdAt: nowStr, updatedAt: nowStr };
  (await db()).safetyFlags.put(data);
  return data;
}

export async function resolveSafetyFlag(id: string): Promise<void> {
  (await db()).safetyFlags.update(id, { active: false, resolvedAt: now(), updatedAt: now() });
}

// Content Items
export async function getContentItems(kind?: string, locale?: string): Promise<DBContentItem[]> {
  let query = (await db()).contentItems.toCollection();
  if (kind) query = query.filter((c) => c.kind === kind);
  if (locale) query = query.filter((c) => c.locale === locale);
  return query.toArray();
}

export async function getContentBySlug(slug: string): Promise<DBContentItem | undefined> {
  return (await db()).contentItems.where("slug").equals(slug).first();
}

export async function seedContentItems(items: Omit<DBContentItem, "createdAt" | "updatedAt">[]): Promise<void> {
  const nowStr = now();
  for (const item of items) {
    const exists = (await db()).contentItems.get(item.id);
    if (!exists) {
      (await db()).contentItems.put({ ...item, createdAt: nowStr, updatedAt: nowStr });
    }
  }
}

// Provenance
export async function getProvenanceBySource(sourceId: string): Promise<DBProvenance | undefined> {
  return (await db()).provenance.where("sourceId").equals(sourceId).first();
}

export async function seedProvenance(items: Omit<DBProvenance, "createdAt" | "updatedAt">[]): Promise<void> {
  const nowStr = now();
  for (const item of items) {
    const exists = (await db()).provenance.get(item.id);
    if (!exists) {
      (await db()).provenance.put({ ...item, createdAt: nowStr, updatedAt: nowStr });
    }
  }
}

// Bulk clear
export async function clearAllData(): Promise<void> {
  (await db()).profiles.clear();
  (await db()).targets.clear();
  (await db()).foods.clear();
  (await db()).foodLogs.clear();
  (await db()).waterLogs.clear();
  (await db()).bodyMetrics.clear();
  (await db()).workouts.clear();
  (await db()).workoutSets.clear();
  (await db()).habits.clear();
  (await db()).habitLogs.clear();
  (await db()).safetyFlags.clear();
  (await db()).contentItems.clear();
  (await db()).provenance.clear();
}
