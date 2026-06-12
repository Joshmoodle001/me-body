export interface NormalizedFood {
  source: "open_food_facts" | "usda" | "manual" | "usda_branded";
  sourceId?: string;
  barcode?: string;
  name: string;
  brand?: string;
  servingSizeG?: number;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  fiberPer100g?: number;
  sugarPer100g?: number;
  sodiumPer100g?: number;
  confidenceScore: number;
  raw: unknown;
}

export function normalizeOpenFoodFactsProduct(product: any): NormalizedFood | null {
  if (!product || !product.product) return null;
  const p = product.product;

  const nutriments = p.nutriments ?? {};
  const name = p.product_name ?? p.generic_name ?? "Unknown product";
  const brand = p.brands ?? "";

  const calories = nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"] ?? undefined;
  const protein = nutriments.proteins_100g ?? nutriments.proteins ?? undefined;
  const carbs = nutriments.carbohydrates_100g ?? nutriments.carbohydrates ?? undefined;
  const fat = nutriments.fat_100g ?? nutriments.fat ?? undefined;
  const fiber = nutriments.fiber_100g ?? nutriments.fiber ?? undefined;
  const sugar = nutriments.sugars_100g ?? nutriments.sugars ?? undefined;
  const sodium = nutriments.sodium_100g ?? nutriments.sodium ?? undefined;

  const servingQuantity = p.serving_quantity ? Number(p.serving_quantity) : undefined;
  const hasCompleteMacros = calories !== undefined && protein !== undefined && carbs !== undefined && fat !== undefined;

  let confidenceScore = 65;
  if (p.code) confidenceScore += 10;
  if (hasCompleteMacros) confidenceScore += 10;
  if (servingQuantity) confidenceScore += 5;
  confidenceScore = Math.min(100, confidenceScore);

  if (!calories && !protein && !carbs && !fat) return null;

  return {
    source: "open_food_facts",
    sourceId: p.code ?? undefined,
    barcode: p.code ?? undefined,
    name,
    brand,
    servingSizeG: servingQuantity ? Math.round(servingQuantity) : undefined,
    caloriesPer100g: calories !== undefined ? Number(calories) : undefined,
    proteinPer100g: protein !== undefined ? Number(protein) : undefined,
    carbsPer100g: carbs !== undefined ? Number(carbs) : undefined,
    fatPer100g: fat !== undefined ? Number(fat) : undefined,
    fiberPer100g: fiber !== undefined ? Number(fiber) : undefined,
    sugarPer100g: sugar !== undefined ? Number(sugar) : undefined,
    sodiumPer100g: sodium !== undefined ? Number(sodium) : undefined,
    confidenceScore,
    raw: p,
  };
}

export function normalizeUsdaFood(food: any): NormalizedFood | null {
  if (!food) return null;

  const nutrients = food.foodNutrients ?? [];
  const getNutrient = (id: number) => {
    const n = nutrients.find((fn: any) => fn.nutrientId === id || fn.nutrient?.id === id);
    return n ? Number(n.amount ?? n.value ?? 0) : undefined;
  };

  const calories = getNutrient(1008) ?? getNutrient(2047);
  const protein = getNutrient(1003);
  const carbs = getNutrient(1005);
  const fat = getNutrient(1004);
  const fiber = getNutrient(1079);
  const sugar = getNutrient(2000);
  const sodium = getNutrient(1093);

  const name = food.description ?? food.foodDescription ?? "Unknown food";
  const brand = food.brandName ?? food.brandOwner ?? "";
  const servingSize = food.servingSize ?? food.householdServingFullText;

  let confidenceScore = 85;
  if (food.dataType === "Foundation" || food.dataType === "SR Legacy") confidenceScore = 95;
  else if (food.dataType === "Branded") confidenceScore = 80;

  return {
    source: food.dataType === "Branded" ? "usda_branded" : "usda",
    sourceId: String(food.fdcId ?? ""),
    name,
    brand,
    servingSizeG: servingSize ? (typeof servingSize === "number" ? servingSize : 100) : 100,
    caloriesPer100g: calories ? Math.round(calories) : undefined,
    proteinPer100g: protein ? +protein.toFixed(1) : undefined,
    carbsPer100g: carbs ? +carbs.toFixed(1) : undefined,
    fatPer100g: fat ? +fat.toFixed(1) : undefined,
    fiberPer100g: fiber ? +fiber.toFixed(1) : undefined,
    sugarPer100g: sugar ? +sugar.toFixed(1) : undefined,
    sodiumPer100g: sodium ? +sodium.toFixed(1) : undefined,
    confidenceScore,
    raw: food,
  };
}
