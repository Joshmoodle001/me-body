import { createClient } from "@/lib/supabase/client";
import { getDb } from "@/db/localDb";
import type { DBProfile, DBTargets, DBFood, DBFoodLog, DBWaterLog, DBBodyMetric, DBWorkout, DBWorkoutSet, DBHabit, DBHabitLog, DBSafetyFlag, DBContentItem, DBProvenance } from "@/db/localDb";

interface SyncResult {
  pushed: number;
  pulled: number;
  error?: string;
}

// Supabase table <-> local table mapping
const TABLES = [
  "profiles", "targets", "foods", "food_logs", "water_logs",
  "body_metrics", "workouts", "workout_sets", "habits", "habit_logs",
  "safety_flags", "content_items", "provenance",
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
};

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

      const rows = await (db as any)[localTable].toArray();
      if (rows.length === 0) continue;

      const serverRows = rows.map((row: any) => {
        const clean = { ...row };
        delete clean.id; // Supabase auto-generates UUIDs if needed
        clean.local_id = row.id; // Store local ID for sync
        clean.user_id = userId;
        return clean;
      });

      // Delete existing user data for this table, then insert fresh
      await supabase.from(remoteTable).delete().eq("user_id", userId);
      const chunkSize = 50;
      for (let i = 0; i < serverRows.length; i += chunkSize) {
        const chunk = serverRows.slice(i, i + chunkSize);
        const { error } = await supabase.from(remoteTable).insert(chunk);
        if (error) console.warn(`[Sync] Push error on ${remoteTable}:`, error.message);
        else pushed += chunk.length;
      }
    }

    // Save sync timestamp
    const { data: profile } = await supabase
      .from("sync_state")
      .upsert({ user_id: userId, last_pushed_at: new Date().toISOString() }, { onConflict: "user_id" });

    return { pushed, pulled: 0 };
  } catch (e: any) {
    console.error("[Sync] Push failed:", e);
    return { pushed, pulled: 0, error: e?.message ?? "Sync failed" };
  }
}

export async function pullFromCloud(): Promise<SyncResult> {
  const supabase = createClient();
  if (!supabase) return { pushed: 0, pulled: 0, error: "Supabase not configured" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { pushed: 0, pulled: 0, error: "Not signed in" };

  let pulled = 0;
  const db = await getDb();
  const userId = user.id;

  try {
    for (const remoteTable of TABLES) {
      const localTable = TABLE_MAP[remoteTable];
      if (!localTable) continue;

      const { data: rows, error } = await supabase
        .from(remoteTable)
        .select("*")
        .eq("user_id", userId);

      if (error || !rows || rows.length === 0) continue;

      for (const row of rows as any[]) {
        // Map remote row to local schema
        const localRow = { ...row };
        if (row.local_id) {
          localRow.id = row.local_id;
        }
        delete localRow.local_id;
        delete localRow.user_id;
        delete localRow.created_at; // Supabase snake_case → remove, use local camelCase

        try {
          await (db as any)[localTable].put(localRow);
          pulled++;
        } catch (e: any) {
          console.warn(`[Sync] Pull error on ${remoteTable}:`, e?.message);
        }
      }
    }

    return { pushed: 0, pulled };
  } catch (e: any) {
    console.error("[Sync] Pull failed:", e);
    return { pushed: 0, pulled: 0, error: e?.message ?? "Sync failed" };
  }
}

export async function fullSync(): Promise<SyncResult> {
  const { pushed } = await pushToCloud();
  const { pulled, error } = await pullFromCloud();
  return { pushed, pulled, error };
}

export async function getSyncStatus(): Promise<{ lastPushedAt: string | null; lastPulledAt: string | null }> {
  const supabase = createClient();
  if (!supabase) return { lastPushedAt: null, lastPulledAt: null };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { lastPushedAt: null, lastPulledAt: null };

  const { data } = await supabase
    .from("sync_state")
    .select("last_pushed_at, last_pulled_at")
    .eq("user_id", user.id)
    .single();

  return {
    lastPushedAt: data?.last_pushed_at ?? null,
    lastPulledAt: data?.last_pulled_at ?? null,
  };
}
