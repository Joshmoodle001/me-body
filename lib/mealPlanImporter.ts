import { getDb } from "@/db/localDb";
import { saveFood, saveWaterLog } from "@/db/queries";
import type { MealPlanTemplate } from "./mealPlanTemplate";

export async function importMealPlan(plan: MealPlanTemplate): Promise<{ foods: number; meals: number; error?: string }> {
  const db = await getDb();
  const now = new Date().toISOString();
  let foodsCreated = 0;
  let mealsCreated = 0;

  try {
    // Import foods
    const foodIdMap = new Map<string, string>();
    for (const f of plan.foods) {
      const slug = `plan_${f.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const existing = await db.foods.get(slug);
      if (existing) {
        foodIdMap.set(f.name, existing.id);
        continue;
      }
      const id = slug;
      await db.foods.put({
        id,
        source: f.source || "Meal Plan",
        name: f.name,
        brand: f.brand,
        servingSizeG: f.servingSizeG || 100,
        caloriesPer100g: f.caloriesPer100g,
        proteinPer100g: f.proteinPer100g,
        carbsPer100g: f.carbsPer100g,
        fatPer100g: f.fatPer100g,
        confidenceScore: 85,
        nutrientCompleteness: 0.8,
        localeMatch: 0.8,
        portionCertainty: 0.85,
        verified: true,
        createdAt: now,
        updatedAt: now,
        syncStatus: "local",
      });
      foodIdMap.set(f.name, id);
      foodsCreated++;
    }

    // Import meals as food log entries for today
    const today = new Date().toISOString();
    for (const meal of plan.meals) {
      const mealType = meal.name.toLowerCase().includes("breakfast") ? "breakfast"
        : meal.name.toLowerCase().includes("lunch") ? "lunch"
        : meal.name.toLowerCase().includes("dinner") ? "dinner"
        : "snack";

      for (const item of meal.foods) {
        const foodId = foodIdMap.get(item.foodName);
        if (!foodId) continue;

        await db.foodLogs.put({
          id: `planlog_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          foodId,
          mealType,
          quantityG: item.quantityG,
          servingLabel: item.notes || `${item.quantityG}g`,
          loggedAt: today,
          notes: `${plan.name} — ${meal.name}`,
          createdAt: now,
          updatedAt: now,
          syncStatus: "local",
        });
        mealsCreated++;
      }
    }

    // Add water goal
    if (plan.waterTargetMl) {
      await db.waterLogs.put({
        id: `planwater_${Date.now()}`,
        amountMl: plan.waterTargetMl,
        loggedAt: today,
        createdAt: now,
        updatedAt: now,
        syncStatus: "local",
      });
    }

    // Save plan metadata so we know it's imported
    window.localStorage.setItem("me_body_meal_plan", JSON.stringify({
      name: plan.name,
      importedAt: now,
      startDate: plan.startDate,
      totalDays: plan.totalDays,
    }));

    return { foods: foodsCreated, meals: mealsCreated };
  } catch (e: unknown) {
    return { foods: foodsCreated, meals: mealsCreated, error: e instanceof Error ? e.message : String(e) };
  }
}

export function getActiveMealPlan(): { name: string; importedAt: string; startDate: string; totalDays: number } | null {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("me_body_meal_plan") : null;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearMealPlan(): Promise<void> {
  const db = await getDb();
  // Clear only plan-imported food log entries (those with plan notes)
  const logs = await db.foodLogs.filter((l) => l.notes?.includes("Meal Plan")).toArray();
  for (const log of logs) {
    await db.foodLogs.delete(log.id);
  }
  window.localStorage.removeItem("me_body_meal_plan");
}
