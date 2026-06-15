import { createClient } from "@/lib/supabase/client";
import { getDb } from "@/db/localDb";
import { saveProfile, saveTargets, clearAllData } from "@/db/queries";
import type { DBProfile, DBTargets } from "@/db/localDb";

const TABLE_PREFIX = "mebody_";

const TABLES = [
  "profiles", "targets", "foods", "food_logs", "water_logs",
  "body_metrics", "workouts", "workout_sets", "habits", "habit_logs",
  "safety_flags", "content_items", "provenance", "day_completions",
] as const;

const TABLE_MAP: Record<string, string> = {
  profiles: "profiles",
  targets: "targets",
  foods: "foods",
  food_logs: "foodLogs",
  water_logs: "waterLogs",
  body_metrics: "bodyMetrics",
  workouts: "workouts",
  workout_sets: "workoutSets",
  habits: "habits",
  habit_logs: "habitLogs",
  safety_flags: "safetyFlags",
  content_items: "contentItems",
  provenance: "provenance",
  day_completions: "dayCompletions",
};

interface SyncResult {
  pushed: number;
  pulled: number;
  error?: string;
}

function remote(name: string): string {
  return `${TABLE_PREFIX}${name}`;
}

export async function pushProfileToCloud(): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in" };

  try {
    const db = await getDb();
    const profile = await db.profiles.orderBy("createdAt").last();
    if (!profile) return { success: false, error: "No local profile" };

    const targets = await db.targets.where("profileId").equals(profile.id).first();
    const userId = user.id;

    const profileRow: Record<string, unknown> = {
      local_id: profile.id,
      user_id: userId,
      name: profile.name,
      sex: profile.sex,
      birth_year: profile.birthYear,
      height_cm: profile.heightCm,
      current_weight_kg: profile.currentWeightKg,
      goal_weight_kg: profile.goalWeightKg,
      activity_level: profile.activityLevel,
      goal_type: profile.goalType,
      training_days_per_week: profile.trainingDaysPerWeek || 3,
      diet_preference: profile.dietPreference || "any",
      units: profile.units || "metric",
      calorie_visibility: profile.calorieVisibility || "visible",
      day_type: profile.dayType || "training",
      onboarding_complete: profile.onboardingComplete ?? true,
      cycle_tracking: profile.cycleTracking ?? false,
      pregnancy_status: profile.pregnancyStatus || "none",
      chronic_conditions: profile.chronicConditions || [],
      medications: profile.medications || [],
      sync_status: "synced",
    };

    const { data: existing } = await supabase
      .from(remote("profiles"))
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase.from(remote("profiles")).update(profileRow).eq("user_id", userId);
    } else {
      await supabase.from(remote("profiles")).insert(profileRow);
    }

    if (targets) {
      const targetRow = {
        local_id: targets.id,
        user_id: userId,
        profile_id: targets.profileId,
        calories: targets.calories,
        protein_g: targets.proteinG,
        carbs_g: targets.carbsG,
        fat_g: targets.fatG,
        fiber_g: targets.fiberG,
        water_ml: targets.waterMl,
        calculation_method: targets.calculationMethod,
        sync_status: "synced",
      };

      const { data: existingTarget } = await supabase
        .from(remote("targets"))
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingTarget) {
        await supabase.from(remote("targets")).update(targetRow).eq("user_id", userId);
      } else {
        await supabase.from(remote("targets")).insert(targetRow);
      }
    }

    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}

export async function pullProfileFromCloud(): Promise<{ hasProfile: boolean; needsOnboarding: boolean }> {
  const supabase = createClient();
  if (!supabase) return { hasProfile: false, needsOnboarding: true };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hasProfile: false, needsOnboarding: true };

  try {
    const { data: profileRow } = await supabase
      .from(remote("profiles"))
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profileRow) return { hasProfile: false, needsOnboarding: true };

    const db = await getDb();
    const existingProfiles = await db.profiles.toArray();
    const profile: DBProfile = {
      id: profileRow.local_id || profileRow.id?.toString() || `supabase-${user.id}`,
      name: String(profileRow.name || ""),
      sex: profileRow.sex || "male",
      birthYear: Number(profileRow.birth_year) || 1990,
      heightCm: Number(profileRow.height_cm) || 170,
      currentWeightKg: Number(profileRow.current_weight_kg) || 70,
      goalWeightKg: profileRow.goal_weight_kg ? Number(profileRow.goal_weight_kg) : undefined,
      activityLevel: String(profileRow.activity_level || "moderate"),
      goalType: String(profileRow.goal_type || "fat_loss"),
      trainingDaysPerWeek: profileRow.training_days_per_week ? Number(profileRow.training_days_per_week) : undefined,
      dietPreference: String(profileRow.diet_preference || "any"),
      units: String(profileRow.units || "metric"),
      onboardingComplete: Boolean(profileRow.onboarding_complete),
      calorieVisibility: (profileRow.calorie_visibility || "visible") as "visible" | "hidden",
      dayType: (profileRow.day_type || "training") as "training" | "rest",
      cycleTracking: Boolean(profileRow.cycle_tracking ?? false),
      pregnancyStatus: (profileRow.pregnancy_status || "none") as "none" | "pregnant" | "postpartum" | "not_applicable",
      chronicConditions: Array.isArray(profileRow.chronic_conditions) ? profileRow.chronic_conditions as string[] : [],
      medications: Array.isArray(profileRow.medications) ? profileRow.medications as string[] : [],
      createdAt: profileRow.created_at || new Date().toISOString(),
      updatedAt: profileRow.updated_at || new Date().toISOString(),
      syncStatus: "synced",
    };

    await db.profiles.put(profile);

    const { data: targetRow } = await supabase
      .from(remote("targets"))
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (targetRow) {
      const targets: DBTargets = {
        id: targetRow.local_id || targetRow.id?.toString() || `targets-${user.id}`,
        profileId: profile.id,
        calories: Number(targetRow.calories) || 2000,
        proteinG: Number(targetRow.protein_g) || 120,
        carbsG: Number(targetRow.carbs_g) || 200,
        fatG: Number(targetRow.fat_g) || 65,
        fiberG: Number(targetRow.fiber_g) || 25,
        waterMl: Number(targetRow.water_ml) || 2500,
        calculationMethod: String(targetRow.calculation_method || "mifflin_st_jeor"),
        createdAt: targetRow.created_at || new Date().toISOString(),
        updatedAt: targetRow.updated_at || new Date().toISOString(),
        syncStatus: "synced",
      };
      await db.targets.put(targets);
    }

    await supabase
      .from(remote("sync_state"))
      .upsert({ user_id: user.id, last_pulled_at: new Date().toISOString() }, { onConflict: "user_id" });

    return {
      hasProfile: true,
      needsOnboarding: !profile.onboardingComplete,
    };
  } catch (e) {
    console.error("[Sync] pullProfileFromCloud failed:", e);
    return { hasProfile: false, needsOnboarding: true };
  }
}

export async function pushToCloud(): Promise<SyncResult> {
  const supabase = createClient();
  if (!supabase) return { pushed: 0, pulled: 0, error: "Supabase not configured" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { pushed: 0, pulled: 0, error: "Not signed in" };

  let pushed = 0;
  const db = await getDb();
  const userId = user.id;

  try {
    for (const remoteTable of TABLES) {
      const localTable = TABLE_MAP[remoteTable];
      if (!localTable) continue;

      const rows = await (db as unknown as Record<string, { toArray: () => Promise<Record<string, unknown>[]> }>)[localTable];
      const allRows = await rows.toArray();
      if (allRows.length === 0) continue;

      const serverRows = allRows.map((row: Record<string, unknown>) => {
        const clean = { ...row } as Record<string, unknown>;
        clean.local_id = row.id;
        clean.user_id = userId;
        delete clean.id;
        delete clean.createdAt;
        delete clean.updatedAt;
        delete clean.syncStatus;
        return clean;
      });

      await supabase.from(remote(remoteTable)).delete().eq("user_id", userId);
      const chunkSize = 50;
      for (let i = 0; i < serverRows.length; i += chunkSize) {
        const chunk = serverRows.slice(i, i + chunkSize);
        const { error } = await supabase.from(remote(remoteTable)).insert(chunk);
        if (error) console.warn(`[Sync] Push error on ${remoteTable}:`, error.message);
        else pushed += chunk.length;
      }
    }

    return { pushed, pulled: 0 };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { pushed, pulled: 0, error: msg };
  }
}

export async function fullSync(): Promise<SyncResult> {
  const { pushed, error } = await pushToCloud();
  return { pushed, pulled: 0, error };
}

export async function pullFromCloud(): Promise<SyncResult> {
  // Full cloud pull is heavyweight — use pullProfileFromCloud for login
  return { pushed: 0, pulled: 0, error: "Use pullProfileFromCloud for login sync. Full pull only pushes for now." };
}

export async function getSyncStatus(): Promise<{ lastPushedAt: string | null; lastPulledAt: string | null }> {
  const supabase = createClient();
  if (!supabase) return { lastPushedAt: null, lastPulledAt: null };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { lastPushedAt: null, lastPulledAt: null };

  const { data } = await supabase
    .from(remote("sync_state"))
    .select("last_pushed_at, last_pulled_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    lastPushedAt: data?.last_pushed_at as string | null ?? null,
    lastPulledAt: data?.last_pulled_at as string | null ?? null,
  };
}
