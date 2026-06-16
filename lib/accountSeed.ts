import { getDb } from "@/db/localDb";
import type { DBFood } from "@/db/localDb";
import { importMealPlan } from "./mealPlanImporter";
import { CUT65_PLAN } from "./mealPlanTemplate";

const VERIFIED_FOODS: Omit<DBFood, "id" | "createdAt" | "updatedAt" | "syncStatus">[] = [
  { source: "verified", name: "Cooked chicken breast", brand: "Verified", servingSizeG: 100, caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, confidenceScore: 95, nutrientCompleteness: 0.95, localeMatch: 0.9, portionCertainty: 0.95, verified: true },
  { source: "verified", name: "Whole egg", brand: "Verified", servingSizeG: 50, caloriesPer100g: 144, proteinPer100g: 12.6, carbsPer100g: 0.8, fatPer100g: 10, confidenceScore: 95, nutrientCompleteness: 0.95, localeMatch: 0.9, portionCertainty: 0.95, verified: true },
  { source: "verified", name: "Cooked white rice", brand: "Verified", servingSizeG: 100, caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, confidenceScore: 90, nutrientCompleteness: 0.9, localeMatch: 0.85, portionCertainty: 0.9, verified: true },
  { source: "verified", name: "Vegetables / salad mix", brand: "Verified", servingSizeG: 100, caloriesPer100g: 25, proteinPer100g: 1.2, carbsPer100g: 5, fatPer100g: 0.2, confidenceScore: 85, nutrientCompleteness: 0.8, localeMatch: 0.8, portionCertainty: 0.85, verified: true },
  { source: "verified", name: "White bread", brand: "Local", servingSizeG: 35, caloriesPer100g: 229, proteinPer100g: 7.7, carbsPer100g: 43, fatPer100g: 2.9, confidenceScore: 90, nutrientCompleteness: 0.85, localeMatch: 0.85, portionCertainty: 0.9, verified: true },
  { source: "verified", name: "Butter", brand: "Generic", servingSizeG: 10, caloriesPer100g: 720, proteinPer100g: 1, carbsPer100g: 0, fatPer100g: 81, confidenceScore: 90, nutrientCompleteness: 0.9, localeMatch: 0.85, portionCertainty: 0.9, verified: true },
  { source: "verified", name: "Pepsi Max", brand: "Pepsi", servingSizeG: 200, caloriesPer100g: 1, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, confidenceScore: 95, nutrientCompleteness: 0.9, localeMatch: 0.9, portionCertainty: 0.95, verified: true },
  { source: "verified", name: "Crumbed chicken patty", brand: "Estimate", servingSizeG: 100, caloriesPer100g: 270, proteinPer100g: 16, carbsPer100g: 18, fatPer100g: 15, confidenceScore: 75, nutrientCompleteness: 0.7, localeMatch: 0.75, portionCertainty: 0.75, verified: true },
  { source: "verified", name: "Tuna in brine", brand: "Generic", servingSizeG: 100, caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 1, confidenceScore: 95, nutrientCompleteness: 0.9, localeMatch: 0.9, portionCertainty: 0.95, verified: true },
  { source: "verified", name: "Oats, dry", brand: "Generic", servingSizeG: 100, caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66.3, fatPer100g: 6.9, confidenceScore: 95, nutrientCompleteness: 0.9, localeMatch: 0.9, portionCertainty: 0.95, verified: true },
];

const CUT65_SEEDED_KEY = "me_body_cut65_seeded_v1";

export async function seedAccountFoods(): Promise<void> {
  const db = await getDb();
  const existing = await db.foods.count();
  if (existing >= VERIFIED_FOODS.length) return;

  const now = new Date().toISOString();
  for (const food of VERIFIED_FOODS) {
    const id = `seed_${food.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    const existingFood = await db.foods.get(id);
    if (!existingFood) {
      await db.foods.put({ ...food, id, createdAt: now, updatedAt: now, syncStatus: "local" });
    }
  }
}

export async function seedCut65PlanIfNeeded(supabaseEmail?: string): Promise<void> {
  if (typeof window === "undefined") return;

  // Only seed for joshmoodley01
  if (supabaseEmail && supabaseEmail.toLowerCase().includes("joshmoodley01")) {
    const alreadySeeded = window.localStorage.getItem(CUT65_SEEDED_KEY);
    if (alreadySeeded) return;

    try {
      const result = await importMealPlan(CUT65_PLAN);
      if (!result.error) {
        window.localStorage.setItem(CUT65_SEEDED_KEY, new Date().toISOString());
        console.log(`[MeBody] Seeded Cut65 plan for ${supabaseEmail}: ${result.foods} foods, ${result.meals} meals`);
      }
    } catch (e) {
      console.error("[MeBody] Cut65 seed failed:", e);
    }
  }
}
