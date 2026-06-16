/**
 * MeBody Meal Plan Template Format
 * 
 * Upload a JSON file matching this format to pre-load:
 * - Food database entries
 * - Daily meal targets
 * - Water goals
 * - Meal structure for logging
 */

export interface MealPlanFood {
  name: string;
  brand?: string;
  source: string;
  servingSizeG: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export interface MealPlanMeal {
  name: string;
  time?: string;
  foods: { foodName: string; quantityG: number; notes?: string }[];
}

export interface MealPlanTemplate {
  schema: "mebody.mealplan.v1";
  name: string;
  description?: string;
  startDate: string;
  totalDays: number;
  dayType: "training" | "rest" | "both";
  waterTargetMl: number;
  foods: MealPlanFood[];
  meals: MealPlanMeal[];
  notes?: string[];
}

export const CUT65_PLAN: MealPlanTemplate = {
  schema: "mebody.mealplan.v1",
  name: "65kg Cut — Strict Meal Plan",
  description: "4-meal daily tracker. 90kg → 65kg over 175 days. Chicken, eggs, rice, vegetables.",
  startDate: "2026-06-15",
  totalDays: 175,
  dayType: "both",
  waterTargetMl: 3000,
  foods: [
    { name: "Cooked chicken breast", source: "Meal Plan", servingSizeG: 100, caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
    { name: "Whole egg", source: "Meal Plan", servingSizeG: 50, caloriesPer100g: 144, proteinPer100g: 12.6, carbsPer100g: 0.8, fatPer100g: 10 },
    { name: "Cooked white rice", source: "Meal Plan", servingSizeG: 100, caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
    { name: "Vegetables / salad mix", source: "Meal Plan", servingSizeG: 100, caloriesPer100g: 25, proteinPer100g: 1.2, carbsPer100g: 5, fatPer100g: 0.2 },
    { name: "Fruit (banana/apple/orange)", source: "Meal Plan", servingSizeG: 120, caloriesPer100g: 80, proteinPer100g: 0.9, carbsPer100g: 20, fatPer100g: 0.3 },
    { name: "Olive oil", source: "Meal Plan", servingSizeG: 10, caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  ],
  meals: [
    {
      name: "Breakfast",
      time: "Morning",
      foods: [
        { foodName: "Whole egg", quantityG: 150, notes: "3 large eggs" },
        { foodName: "Cooked white rice", quantityG: 100, notes: "1 cupped hand" },
        { foodName: "Vegetables / salad mix", quantityG: 175, notes: "150-200g" },
      ],
    },
    {
      name: "Lunch",
      time: "Midday",
      foods: [
        { foodName: "Cooked chicken breast", quantityG: 200, notes: "200g cooked" },
        { foodName: "Cooked white rice", quantityG: 175, notes: "150-200g" },
        { foodName: "Vegetables / salad mix", quantityG: 200, notes: "200g" },
      ],
    },
    {
      name: "Snack / Post-workout",
      time: "Afternoon",
      foods: [
        { foodName: "Cooked chicken breast", quantityG: 125, notes: "100-150g" },
        { foodName: "Fruit (banana/apple/orange)", quantityG: 120, notes: "1 fruit" },
      ],
    },
    {
      name: "Dinner",
      time: "Evening",
      foods: [
        { foodName: "Cooked chicken breast", quantityG: 150, notes: "150g cooked" },
        { foodName: "Cooked white rice", quantityG: 125, notes: "100-150g" },
        { foodName: "Vegetables / salad mix", quantityG: 275, notes: "250-300g" },
        { foodName: "Olive oil", quantityG: 10, notes: "10g olive oil/avocado/nuts" },
      ],
    },
  ],
  notes: [
    "Keep sauces light or skip them.",
    "No late-night extras. Dinner is the last meal.",
    "Weigh yourself each morning after bathroom, before food/water.",
    "Aim for 3 litres water spread across the day.",
    "Training: walk 30-60 min daily if possible.",
  ],
};

export function validateMealPlan(data: unknown): { valid: boolean; plan?: MealPlanTemplate; error?: string } {
  if (!data || typeof data !== "object") return { valid: false, error: "Invalid JSON" };
  const d = data as Record<string, unknown>;
  if (d.schema !== "mebody.mealplan.v1") return { valid: false, error: "Wrong schema version. Expected mebody.mealplan.v1" };
  if (!d.name || typeof d.name !== "string") return { valid: false, error: "Missing plan name" };
  if (!d.startDate || typeof d.startDate !== "string") return { valid: false, error: "Missing startDate" };
  if (!d.totalDays || typeof d.totalDays !== "number") return { valid: false, error: "Missing totalDays" };
  if (!Array.isArray(d.foods) || d.foods.length === 0) return { valid: false, error: "Missing foods array" };
  if (!Array.isArray(d.meals) || d.meals.length === 0) return { valid: false, error: "Missing meals array" };
  return { valid: true, plan: d as unknown as MealPlanTemplate };
}
