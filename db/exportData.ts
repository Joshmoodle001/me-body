import { getDb } from "./localDb";
import { getDeviceIdentity } from "@/lib/identity";

export async function exportAllData(): Promise<Record<string, unknown>> {
  const [profiles, targets, foods, foodLogs, waterLogs, bodyMetrics, workouts, workoutSets, habits, habitLogs, dayCompletions] = await Promise.all([
    (await getDb()).profiles.toArray(),
    (await getDb()).targets.toArray(),
    (await getDb()).foods.toArray(),
    (await getDb()).foodLogs.filter((l) => !l.deletedAt).toArray(),
    (await getDb()).waterLogs.filter((l) => !l.deletedAt).toArray(),
    (await getDb()).bodyMetrics.filter((m) => !m.deletedAt).toArray(),
    (await getDb()).workouts.filter((w) => !w.deletedAt).toArray(),
    (await getDb()).workoutSets.filter((s) => !s.deletedAt).toArray(),
    (await getDb()).habits.filter((h) => !h.deletedAt).toArray(),
    (await getDb()).habitLogs.filter((l) => !l.deletedAt).toArray(),
    (await getDb()).dayCompletions.toArray(),
  ]);

  let sourceDevice: { deviceId: string; displayName: string } | undefined;
  try { sourceDevice = getDeviceIdentity(); } catch {}

  return {
    appName: "Me Body",
    exportedAt: new Date().toISOString(),
    version: "0.2.0",
    sourceDevice,
    data: {
      profiles,
      targets,
      foods,
      foodLogs,
      waterLogs,
      bodyMetrics,
      workouts,
      workoutSets,
      habits,
      habitLogs,
      dayCompletions,
    },
  };
}

export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importJSONData(json: string): Promise<{ success: boolean; message: string }> {
  try {
    const parsed = JSON.parse(json);
    if (!parsed.data) return { success: false, message: "Invalid export format: missing data object." };

    const { data } = parsed;

    if (data.profiles?.length) await (await getDb()).profiles.bulkPut(data.profiles);
    if (data.targets?.length) await (await getDb()).targets.bulkPut(data.targets);
    if (data.foods?.length) await (await getDb()).foods.bulkPut(data.foods);
    if (data.foodLogs?.length) await (await getDb()).foodLogs.bulkPut(data.foodLogs);
    if (data.waterLogs?.length) await (await getDb()).waterLogs.bulkPut(data.waterLogs);
    if (data.bodyMetrics?.length) await (await getDb()).bodyMetrics.bulkPut(data.bodyMetrics);
    if (data.workouts?.length) await (await getDb()).workouts.bulkPut(data.workouts);
    if (data.habits?.length) await (await getDb()).habits.bulkPut(data.habits);
    if (data.habitLogs?.length) await (await getDb()).habitLogs.bulkPut(data.habitLogs);
    if (data.workoutSets?.length) await (await getDb()).workoutSets.bulkPut(data.workoutSets);
    if (data.dayCompletions?.length) await (await getDb()).dayCompletions.bulkPut(data.dayCompletions);

    return { success: true, message: "Data imported successfully." };
  } catch {
    return { success: false, message: "Could not parse the JSON file. Make sure it is a valid Me Body export." };
  }
}
