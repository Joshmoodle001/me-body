import type { DBFood } from "@/db/localDb";

export interface ConfidenceBreakdown {
  score: number;
  label: "highly-trusted" | "usable" | "estimate" | "unreliable";
  components: {
    sourceWeight: number;
    nutrientCompleteness: number;
    barcodeMatch: number;
    localeMatch: number;
    portionCertainty: number;
    userConfirmation: number;
    conflictPenalty: number;
  };
  explanation: string;
}

const SOURCE_WEIGHTS: Record<string, number> = {
  "usda": 0.95,
  "open_food_facts": 0.75,
  "safoods": 0.90,
  "foodfinder": 0.85,
  "manual": 0.50,
  "user": 0.40,
  "unknown": 0.25,
};

export function scoreFoodConfidence(food: DBFood): ConfidenceBreakdown {
  const sourceWeight = SOURCE_WEIGHTS[food.source] ?? SOURCE_WEIGHTS["unknown"];
  const nutrientCompleteness = food.nutrientCompleteness ?? calculateNutrientCompleteness(food);
  const barcodeMatch = food.barcode ? 0.9 : 0.5;
  const localeMatch = food.localeMatch ?? (food.locale === "en-ZA" ? 0.9 : 0.6);
  const portionCertainty = food.portionCertainty ?? (food.servingSizeG ? 0.8 : 0.6);
  const userConfirmation = food.verified ? 0.3 : 0;
  const conflictPenalty = 0;

  const score = sourceWeight * 0.35 +
    nutrientCompleteness * 0.25 +
    barcodeMatch * 0.15 +
    localeMatch * 0.10 +
    portionCertainty * 0.10 +
    userConfirmation * 0.05 -
    conflictPenalty;

  const clamped = Math.max(0, Math.min(1, Math.round(score * 100) / 100));

  let label: ConfidenceBreakdown["label"];
  if (clamped >= 0.90) label = "highly-trusted";
  else if (clamped >= 0.75) label = "usable";
  else if (clamped >= 0.50) label = "estimate";
  else label = "unreliable";

  return {
    score: clamped,
    label,
    components: {
      sourceWeight,
      nutrientCompleteness,
      barcodeMatch,
      localeMatch,
      portionCertainty,
      userConfirmation,
      conflictPenalty,
    },
    explanation: getConfidenceExplanation(clamped, label),
  };
}

function calculateNutrientCompleteness(food: DBFood): number {
  const nutrients = [
    food.caloriesPer100g != null,
    food.proteinPer100g != null,
    food.carbsPer100g != null,
    food.fatPer100g != null,
    food.fiberPer100g != null,
    food.sugarPer100g != null,
    food.sodiumPer100g != null,
  ];
  const filled = nutrients.filter(Boolean).length;
  return filled / nutrients.length;
}

function getConfidenceExplanation(score: number, label: ConfidenceBreakdown["label"]): string {
  switch (label) {
    case "highly-trusted":
      return "This food entry comes from a trusted source with complete nutrient data and a verified barcode match.";
    case "usable":
      return "The data is reliable enough for tracking. Some nutrient values may be estimated.";
    case "estimate":
      return "This entry has gaps in nutrient data or comes from a less-verified source. Use as a rough guide.";
    case "unreliable":
      return "Very limited information is available. Consider verifying or replacing this entry.";
  }
}

export function getConfidenceColor(label: ConfidenceBreakdown["label"]): string {
  switch (label) {
    case "highly-trusted": return "var(--success)";
    case "usable": return "var(--info)";
    case "estimate": return "var(--warning)";
    case "unreliable": return "var(--error)";
  }
}

export function getConfidenceBadge(label: ConfidenceBreakdown["label"]): string {
  switch (label) {
    case "highly-trusted": return "Verified";
    case "usable": return "Good";
    case "estimate": return "Estimate";
    case "unreliable": return "Low confidence";
  }
}

export function calculateFoodConfidenceFromParams(params: {
  source: string;
  barcode?: string;
  locale?: string;
  servingSizeG?: number;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  fiberPer100g?: number;
  verified?: boolean;
}): { score: number; completeness: number; localeMatch: number; portionCertainty: number } {
  const sourceWeight = SOURCE_WEIGHTS[params.source] ?? SOURCE_WEIGHTS["unknown"];
  const nutrients = [params.caloriesPer100g, params.proteinPer100g, params.carbsPer100g, params.fatPer100g, params.fiberPer100g];
  const completeness = nutrients.filter((n) => n != null).length / nutrients.length;
  const localeMatch = params.locale === "en-ZA" ? 0.9 : 0.6;
  const portionCertainty = params.servingSizeG ? 0.8 : 0.6;

  const score = sourceWeight * 0.35 +
    completeness * 0.25 +
    (params.barcode ? 0.9 : 0.5) * 0.15 +
    localeMatch * 0.10 +
    portionCertainty * 0.10 +
    (params.verified ? 0.3 : 0) * 0.05;

  return {
    score: Math.round(score * 100) / 100,
    completeness,
    localeMatch,
    portionCertainty,
  };
}
