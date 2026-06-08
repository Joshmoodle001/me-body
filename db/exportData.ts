import { db } from "./localDb";

export async function exportAllData(): Promise<Record<string, unknown>> {
  const [profiles, targets, foods, foodLogs, waterLogs, bodyMetrics, workouts, habits, habitLogs] = await Promise.all([
    db.profiles.toArray(),
    db.targets.toArray(),
    db.foods.toArray(),
    db.foodLogs.filter((l) => !l.deletedAt).toArray(),
    db.waterLogs.filter((l) => !l.deletedAt).toArray(),
    db.bodyMetrics.filter((m) => !m.deletedAt).toArray(),
    db.workouts.filter((w) => !w.deletedAt).toArray(),
    db.habits.filter((h) => !h.deletedAt).toArray(),
    db.habitLogs.filter((l) => !l.deletedAt).toArray(),
  ]);

  return {
    appName: "Me Body",
    exportedAt: new Date().toISOString(),
    version: "0.1.0",
    data: {
      profiles,
      targets,
      foods,
      foodLogs,
      waterLogs,
      bodyMetrics,
      workouts,
      habits,
      habitLogs,
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

    if (data.profiles?.length) await db.profiles.bulkPut(data.profiles);
    if (data.targets?.length) await db.targets.bulkPut(data.targets);
    if (data.foods?.length) await db.foods.bulkPut(data.foods);
    if (data.foodLogs?.length) await db.foodLogs.bulkPut(data.foodLogs);
    if (data.waterLogs?.length) await db.waterLogs.bulkPut(data.waterLogs);
    if (data.bodyMetrics?.length) await db.bodyMetrics.bulkPut(data.bodyMetrics);
    if (data.workouts?.length) await db.workouts.bulkPut(data.workouts);
    if (data.habits?.length) await db.habits.bulkPut(data.habits);
    if (data.habitLogs?.length) await db.habitLogs.bulkPut(data.habitLogs);

    return { success: true, message: "Data imported successfully." };
  } catch {
    return { success: false, message: "Could not parse the JSON file. Make sure it is a valid Me Body export." };
  }
}
