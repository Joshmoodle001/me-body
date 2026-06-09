// Pre-cached common foods for instant local search
// USDA-sourced nutrition per 100g

export interface CachedFood {
  name: string;
  brand?: string;
  source: "usda" | "usda_branded";
  sourceId: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  sugarPer100g?: number;
  sodiumPer100g?: number;
  confidenceScore: number;
  locale: "en-ZA" | "en-US" | "global";
  tags: string[];
}

export const COMMON_FOODS: CachedFood[] = [
  // Proteins
  { name: "Chicken breast, skinless, raw", source: "usda", sourceId: "cached-001", caloriesPer100g: 120, proteinPer100g: 23, carbsPer100g: 0, fatPer100g: 2.6, fiberPer100g: 0, sodiumPer100g: 45, confidenceScore: 95, locale: "global", tags: ["protein", "poultry", "lean"] },
  { name: "Chicken thigh, skinless, raw", source: "usda", sourceId: "cached-002", caloriesPer100g: 177, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 12, fiberPer100g: 0, sodiumPer100g: 80, confidenceScore: 95, locale: "global", tags: ["protein", "poultry"] },
  { name: "Beef mince, lean, raw", source: "usda", sourceId: "cached-003", caloriesPer100g: 176, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 10, fiberPer100g: 0, sodiumPer100g: 66, confidenceScore: 95, locale: "global", tags: ["protein", "beef", "red meat"] },
  { name: "Salmon, Atlantic, raw", source: "usda", sourceId: "cached-004", caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, fiberPer100g: 0, sodiumPer100g: 59, confidenceScore: 95, locale: "global", tags: ["protein", "fish", "omega3"] },
  { name: "Tuna, canned in water", source: "usda", sourceId: "cached-005", caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 0.8, fiberPer100g: 0, sodiumPer100g: 338, confidenceScore: 95, locale: "global", tags: ["protein", "fish", "canned"] },
  { name: "Eggs, whole, raw", source: "usda", sourceId: "cached-006", caloriesPer100g: 143, proteinPer100g: 13, carbsPer100g: 0.7, fatPer100g: 9.5, fiberPer100g: 0, sodiumPer100g: 142, confidenceScore: 95, locale: "global", tags: ["protein", "eggs", "breakfast"] },
  { name: "Whey protein isolate", source: "usda_branded", sourceId: "cached-007", caloriesPer100g: 380, proteinPer100g: 80, carbsPer100g: 5, fatPer100g: 3, fiberPer100g: 0, sodiumPer100g: 200, confidenceScore: 80, locale: "global", tags: ["protein", "supplement", "whey"] },
  { name: "Greek yogurt, plain, nonfat", source: "usda", sourceId: "cached-008", caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 0, sodiumPer100g: 36, confidenceScore: 95, locale: "global", tags: ["protein", "dairy", "breakfast"] },
  { name: "Cottage cheese, lowfat", source: "usda", sourceId: "cached-009", caloriesPer100g: 81, proteinPer100g: 12, carbsPer100g: 3.4, fatPer100g: 2.3, fiberPer100g: 0, sodiumPer100g: 364, confidenceScore: 95, locale: "global", tags: ["protein", "dairy"] },

  // Carbs
  { name: "White rice, cooked", source: "usda", sourceId: "cached-010", caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, fiberPer100g: 0.4, sodiumPer100g: 1, confidenceScore: 95, locale: "global", tags: ["carbs", "rice", "staple"] },
  { name: "Brown rice, cooked", source: "usda", sourceId: "cached-011", caloriesPer100g: 123, proteinPer100g: 2.7, carbsPer100g: 26, fatPer100g: 1.0, fiberPer100g: 1.6, sodiumPer100g: 4, confidenceScore: 95, locale: "global", tags: ["carbs", "rice", "whole grain"] },
  { name: "Sweet potato, baked", source: "usda", sourceId: "cached-012", caloriesPer100g: 90, proteinPer100g: 2.0, carbsPer100g: 21, fatPer100g: 0.1, fiberPer100g: 3.3, sodiumPer100g: 36, confidenceScore: 95, locale: "global", tags: ["carbs", "vegetable", "complex carb"] },
  { name: "Potato, boiled", source: "usda", sourceId: "cached-013", caloriesPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20, fatPer100g: 0.1, fiberPer100g: 1.8, sodiumPer100g: 5, confidenceScore: 95, locale: "global", tags: ["carbs", "vegetable", "staple"] },
  { name: "Oats, rolled, raw", source: "usda", sourceId: "cached-014", caloriesPer100g: 379, proteinPer100g: 13, carbsPer100g: 68, fatPer100g: 6.5, fiberPer100g: 10, sodiumPer100g: 6, confidenceScore: 95, locale: "global", tags: ["carbs", "breakfast", "whole grain"] },
  { name: "Whole wheat bread", source: "usda", sourceId: "cached-015", caloriesPer100g: 254, proteinPer100g: 12, carbsPer100g: 44, fatPer100g: 3.5, fiberPer100g: 6, sodiumPer100g: 455, confidenceScore: 95, locale: "global", tags: ["carbs", "bread", "whole grain"] },
  { name: "Pasta, cooked", source: "usda", sourceId: "cached-016", caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1, fiberPer100g: 1.8, sodiumPer100g: 1, confidenceScore: 95, locale: "global", tags: ["carbs", "pasta", "staple"] },
  { name: "Quinoa, cooked", source: "usda", sourceId: "cached-017", caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatPer100g: 1.9, fiberPer100g: 2.8, sodiumPer100g: 7, confidenceScore: 95, locale: "global", tags: ["carbs", "grain", "complete protein"] },

  // Vegetables
  { name: "Broccoli, raw", source: "usda", sourceId: "cached-018", caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4, fiberPer100g: 2.6, sodiumPer100g: 33, confidenceScore: 95, locale: "global", tags: ["vegetable", "green", "low cal"] },
  { name: "Spinach, raw", source: "usda", sourceId: "cached-019", caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 2.2, sodiumPer100g: 79, confidenceScore: 95, locale: "global", tags: ["vegetable", "green", "low cal"] },
  { name: "Kale, raw", source: "usda", sourceId: "cached-020", caloriesPer100g: 49, proteinPer100g: 4.3, carbsPer100g: 8.8, fatPer100g: 0.9, fiberPer100g: 3.6, sodiumPer100g: 38, confidenceScore: 95, locale: "global", tags: ["vegetable", "green"] },
  { name: "Avocado", source: "usda", sourceId: "cached-021", caloriesPer100g: 160, proteinPer100g: 2.0, carbsPer100g: 8.5, fatPer100g: 15, fiberPer100g: 6.7, sodiumPer100g: 7, confidenceScore: 95, locale: "global", tags: ["fruit", "healthy fat", "vegan"] },

  // Fruits
  { name: "Banana", source: "usda", sourceId: "cached-022", caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, fiberPer100g: 2.6, sugarPer100g: 12, sodiumPer100g: 1, confidenceScore: 95, locale: "global", tags: ["fruit", "quick energy"] },
  { name: "Apple", source: "usda", sourceId: "cached-023", caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, fiberPer100g: 2.4, sugarPer100g: 10, sodiumPer100g: 1, confidenceScore: 95, locale: "global", tags: ["fruit", "snack"] },
  { name: "Blueberries, raw", source: "usda", sourceId: "cached-024", caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.3, fiberPer100g: 2.4, sugarPer100g: 10, sodiumPer100g: 1, confidenceScore: 95, locale: "global", tags: ["fruit", "antioxidant"] },

  // Fats
  { name: "Olive oil, extra virgin", source: "usda", sourceId: "cached-025", caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0, sodiumPer100g: 2, confidenceScore: 95, locale: "global", tags: ["fat", "oil", "cooking"] },
  { name: "Peanut butter, smooth", source: "usda", sourceId: "cached-026", caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, fiberPer100g: 6, sodiumPer100g: 17, confidenceScore: 95, locale: "global", tags: ["fat", "protein", "spread"] },
  { name: "Almonds, raw", source: "usda", sourceId: "cached-027", caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, fiberPer100g: 13, sodiumPer100g: 1, confidenceScore: 95, locale: "global", tags: ["fat", "nuts", "snack"] },

  // South African staples
  { name: "Maize meal (pap), cooked", source: "usda", sourceId: "cached-028", caloriesPer100g: 96, proteinPer100g: 2.1, carbsPer100g: 21, fatPer100g: 0.3, fiberPer100g: 0.8, sodiumPer100g: 2, confidenceScore: 85, locale: "en-ZA", tags: ["carbs", "staple", "ZA"] },
  { name: "Boerewors, grilled", source: "usda", sourceId: "cached-029", caloriesPer100g: 297, proteinPer100g: 15, carbsPer100g: 1, fatPer100g: 26, fiberPer100g: 0, sodiumPer100g: 680, confidenceScore: 75, locale: "en-ZA", tags: ["protein", "meat", "ZA"] },
  { name: "Biltong, beef", source: "usda", sourceId: "cached-030", caloriesPer100g: 274, proteinPer100g: 57, carbsPer100g: 1, fatPer100g: 4.5, fiberPer100g: 0, sodiumPer100g: 2000, confidenceScore: 80, locale: "en-ZA", tags: ["protein", "snack", "ZA"] },
];

export function searchCachedFoods(query: string): CachedFood[] {
  const q = query.toLowerCase().trim();
  if (!q) return COMMON_FOODS.slice(0, 20);
  return COMMON_FOODS.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.tags.some((t) => t.includes(q)) ||
      (f.brand && f.brand.toLowerCase().includes(q))
  );
}

export async function seedCachedFoodsToDb() {
  const { getDb } = await import("@/db/localDb");
  const db = await getDb();

  for (const food of COMMON_FOODS) {
    const existing = await db.foods.where("sourceId").equals(food.sourceId).first();
    if (existing) continue;

    await db.foods.put({
      id: `cached-${food.sourceId}-${Date.now()}`,
      name: food.name,
      brand: food.brand ?? "",
      barcode: undefined,
      source: food.source,
      sourceId: food.sourceId,
      servingSizeG: 100,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatPer100g: food.fatPer100g,
      fiberPer100g: food.fiberPer100g ?? 0,
      sugarPer100g: food.sugarPer100g ?? 0,
      sodiumPer100g: food.sodiumPer100g ?? 0,
      confidenceScore: food.confidenceScore,
      nutrientCompleteness: 0.9,
      localeMatch: food.locale === "en-ZA" ? 0.9 : 0.5,
      portionCertainty: 0.8,
      verified: food.confidenceScore >= 90,
      rawJson: undefined,
      locale: food.locale,
      syncStatus: "local",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}
