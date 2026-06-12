export interface ConfidenceResult {
  score: number;
  label: string;
  level: "high" | "medium" | "low";
}

export function calculateFoodConfidence(params: {
  source: string;
  hasBarcode?: boolean;
  hasCompleteNutrition?: boolean;
  hasServingSize?: boolean;
  isVerified?: boolean;
}): ConfidenceResult {
  let score = 50;

  if (params.source === "usda") {
    score = 85;
    if (params.hasCompleteNutrition) score = Math.min(95, score + 5);
  } else if (params.source === "usda_branded") {
    score = 75;
    if (params.hasCompleteNutrition) score = Math.min(90, score + 10);
  } else if (params.source === "open_food_facts") {
    score = 65;
    if (params.hasBarcode) score += 10;
    if (params.hasCompleteNutrition) score += 10;
    if (params.hasServingSize) score += 5;
  } else if (params.source === "manual") {
    score = params.isVerified ? 80 : 50;
  }

  if (!params.hasCompleteNutrition) score = Math.min(score, 64);

  score = Math.max(0, Math.min(100, Math.round(score)));

  let level: "high" | "medium" | "low";
  let label: string;
  if (score >= 85) { level = "high"; label = "High confidence"; }
  else if (score >= 65) { level = "medium"; label = "Medium confidence"; }
  else { level = "low"; label = "Check this food"; }

  return { score, label, level };
}

export function hasCompleteMacros(food: { caloriesPer100g?: number | null; proteinPer100g?: number | null; carbsPer100g?: number | null; fatPer100g?: number | null }): boolean {
  return (
    (food.caloriesPer100g ?? 0) > 0 &&
    (food.proteinPer100g ?? 0) >= 0 &&
    (food.carbsPer100g ?? 0) >= 0 &&
    (food.fatPer100g ?? 0) >= 0
  );
}
