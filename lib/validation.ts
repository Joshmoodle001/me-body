import { z } from "zod";
import { GOAL_TYPES, ACTIVITY_LEVELS, DIET_PREFERENCES, MEAL_TYPES } from "./constants";

export const profileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100),
  sex: z.enum(["male", "female"], { message: "Select male or female" }),
  birthYear: z.number().int().min(1920).max(2020),
  heightCm: z.number().min(100).max(250),
  currentWeightKg: z.number().min(30).max(300),
  goalWeightKg: z.number().min(30).max(300).optional(),
  activityLevel: z.enum(ACTIVITY_LEVELS),
  goalType: z.enum(GOAL_TYPES),
  trainingDaysPerWeek: z.number().int().min(0).max(7).optional(),
  dietPreference: z.enum(DIET_PREFERENCES).optional(),
  units: z.enum(["metric", "imperial"]).default("metric"),
  onboardingComplete: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  syncStatus: z.string().optional(),
});

export type Profile = z.infer<typeof profileSchema>;

export const targetsSchema = z.object({
  id: z.string().optional(),
  profileId: z.string().optional(),
  calories: z.number().int().min(500).max(8000),
  proteinG: z.number().int().min(20).max(500),
  carbsG: z.number().int().min(0).max(1000),
  fatG: z.number().int().min(10).max(300),
  fiberG: z.number().int().min(0).max(100),
  waterMl: z.number().int().min(500).max(10000),
  calculationMethod: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  syncStatus: z.string().optional(),
});

export type Targets = z.infer<typeof targetsSchema>;

export const manualFoodSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(200),
  brand: z.string().max(200).optional().default(""),
  barcode: z.string().max(50).optional().default(""),
  servingSizeG: z.number().min(1).max(10000).optional().default(100),
  caloriesPer100g: z.number().min(0).max(900).optional().default(0),
  proteinPer100g: z.number().min(0).max(100).optional().default(0),
  carbsPer100g: z.number().min(0).max(100).optional().default(0),
  fatPer100g: z.number().min(0).max(100).optional().default(0),
  fiberPer100g: z.number().min(0).max(100).optional().default(0),
  sugarPer100g: z.number().min(0).max(100).optional().default(0),
  sodiumPer100g: z.number().min(0).max(10000).optional().default(0),
  verified: z.boolean().optional().default(false),
});

export type ManualFood = z.infer<typeof manualFoodSchema>;

export const foodLogSchema = z.object({
  id: z.string().optional(),
  foodId: z.string().min(1),
  mealType: z.enum(MEAL_TYPES).default("snack"),
  quantityG: z.number().min(1).max(10000),
  servingLabel: z.string().optional().default(""),
  loggedAt: z.string(),
  notes: z.string().optional().default(""),
});

export type FoodLog = z.infer<typeof foodLogSchema>;

export const bodyMetricSchema = z.object({
  id: z.string().optional(),
  weightKg: z.number().min(20).max(400).optional(),
  waistCm: z.number().min(30).max(200).optional(),
  hipCm: z.number().min(30).max(200).optional(),
  chestCm: z.number().min(30).max(200).optional(),
  armCm: z.number().min(10).max(100).optional(),
  thighCm: z.number().min(10).max(150).optional(),
  bodyFatPercent: z.number().min(1).max(60).optional(),
  mood1To5: z.number().int().min(1).max(5).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  steps: z.number().int().min(0).optional(),
  recordedAt: z.string(),
  notes: z.string().optional().default(""),
});

export type BodyMetric = z.infer<typeof bodyMetricSchema>;

export const waterLogSchema = z.object({
  id: z.string().optional(),
  amountMl: z.number().int().min(50).max(5000),
  loggedAt: z.string(),
});

export type WaterLog = z.infer<typeof waterLogSchema>;

export const habitSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(200),
  targetFrequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
});

export type Habit = z.infer<typeof habitSchema>;

export const workoutSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200).optional().default("Workout"),
  type: z.string().optional().default("strength"),
  startedAt: z.string(),
  durationMinutes: z.number().int().min(1).max(600).optional(),
  perceivedEffort1To10: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional().default(""),
});

export type Workout = z.infer<typeof workoutSchema>;
