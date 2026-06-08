import { db } from "./localDb";
import type { DBProfile, DBTargets, DBFood, DBFoodLog, DBWaterLog, DBBodyMetric, DBWorkout, DBHabit, DBHabitLog } from "./localDb";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

// Profile
export async function getProfile(): Promise<DBProfile | undefined> {
  return db.profiles.orderBy("createdAt").last();
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
    createdAt: existing?.createdAt ?? nowStr,
    updatedAt: nowStr,
    syncStatus: "local",
  };
  await db.profiles.put(data);
  return data;
}

// Targets
export async function getTargets(profileId: string): Promise<DBTargets | undefined> {
  return db.targets.where("profileId").equals(profileId).first();
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
  await db.targets.put(data);
  return data;
}

// Foods
export async function searchLocalFoods(query: string): Promise<DBFood[]> {
  const q = query.toLowerCase();
  return db.foods.filter((f) => f.name.toLowerCase().includes(q) || (f.brand ?? "").toLowerCase().includes(q) || (f.barcode ?? "").includes(q)).limit(50).toArray();
}

export async function getFoodById(id: string): Promise<DBFood | undefined> {
  return db.foods.get(id);
}

export async function getFoodByBarcode(barcode: string): Promise<DBFood | undefined> {
  return db.foods.where("barcode").equals(barcode).first();
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
    servingSizeG: food.servingSizeG,
    caloriesPer100g: food.caloriesPer100g,
    proteinPer100g: food.proteinPer100g,
    carbsPer100g: food.carbsPer100g,
    fatPer100g: food.fatPer100g,
    fiberPer100g: food.fiberPer100g,
    sugarPer100g: food.sugarPer100g,
    sodiumPer100g: food.sodiumPer100g,
    confidenceScore: food.confidenceScore,
    verified: food.verified,
    rawJson: food.rawJson,
    createdAt: nowStr,
    updatedAt: nowStr,
    syncStatus: "local",
  };
  await db.foods.put(data);
  return data;
}

// Food logs
export async function getFoodLogsForDate(dateStr: string): Promise<DBFoodLog[]> {
  return db.foodLogs.filter((l) => l.loggedAt >= `${dateStr}T00:00:00.000Z` && l.loggedAt <= `${dateStr}T23:59:59.999Z` && !l.deletedAt).toArray();
}

export async function getFoodLogsForRange(startDate: string, endDate: string): Promise<DBFoodLog[]> {
  return db.foodLogs.filter((l) => l.loggedAt >= startDate && l.loggedAt <= endDate && !l.deletedAt).toArray();
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
  await db.foodLogs.put(data);
  return data;
}

export async function updateFoodLog(id: string, updates: Partial<DBFoodLog>): Promise<void> {
  await db.foodLogs.update(id, { ...updates, updatedAt: now() });
}

export async function softDeleteFoodLog(id: string): Promise<void> {
  await db.foodLogs.update(id, { deletedAt: now(), updatedAt: now(), syncStatus: "pending" });
}

// Water logs
export async function getWaterLogsForDate(dateStr: string): Promise<DBWaterLog[]> {
  return db.waterLogs.filter((l) => l.loggedAt >= `${dateStr}T00:00:00.000Z` && l.loggedAt <= `${dateStr}T23:59:59.999Z` && !l.deletedAt).toArray();
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
  await db.waterLogs.put(data);
  return data;
}

export async function deleteWaterLog(id: string): Promise<void> {
  await db.waterLogs.update(id, { deletedAt: now(), updatedAt: now() });
}

// Body metrics
export async function getBodyMetrics(limit = 90): Promise<DBBodyMetric[]> {
  return db.bodyMetrics.filter((m) => !m.deletedAt).reverse().limit(limit).toArray();
}

export async function getLatestBodyMetric(): Promise<DBBodyMetric | undefined> {
  return db.bodyMetrics.filter((m) => !m.deletedAt).reverse().first();
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
  await db.bodyMetrics.put(data);
  return data;
}

// Workouts
export async function getWorkouts(limit = 30): Promise<DBWorkout[]> {
  return db.workouts.filter((w) => !w.deletedAt).reverse().limit(limit).toArray();
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
  await db.workouts.put(data);
  return data;
}

// Habits
export async function getHabits(): Promise<DBHabit[]> {
  return db.habits.filter((h) => !h.deletedAt).toArray();
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
  await db.habits.put(data);
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
  await db.habitLogs.put(data);
  return data;
}

// Bulk clear
export async function clearAllData(): Promise<void> {
  await db.profiles.clear();
  await db.targets.clear();
  await db.foods.clear();
  await db.foodLogs.clear();
  await db.waterLogs.clear();
  await db.bodyMetrics.clear();
  await db.workouts.clear();
  await db.habits.clear();
  await db.habitLogs.clear();
}
