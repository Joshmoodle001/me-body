import type { Profile } from "./validation";
import { calculateMacroTargets } from "./calculations";

export interface CoachingInsight {
  id: string;
  type: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "positive";
  whyShown: string;
  generatedAt: string;
  dismissedAt?: string;
}

export function generateInsights(params: {
  profile?: Profile;
  targets?: { calories: number; proteinG: number; waterMl: number };
  todayLogs: { calories?: number; proteinG?: number; loggedAt: string }[];
  todayWaterMl: number;
  weightLogs: { weightKg: number; recordedAt: string }[];
  sleepHours?: number;
  loggedDaysThisWeek: number;
  yesterdayLogs: { calories?: number }[];
  mealCount: number;
}): CoachingInsight[] {
  const insights: CoachingInsight[] = [];
  const now = new Date().toISOString();

  const totalCals = params.todayLogs.reduce((s, l) => s + (l.calories ?? 0), 0);
  const totalProtein = params.todayLogs.reduce((s, l) => s + (l.proteinG ?? 0), 0);
  const target = params.targets ?? { calories: 2000, proteinG: 120, waterMl: 2500 };

  if (params.mealCount === 0) {
    insights.push({
      id: "no-meals",
      type: "meal_gap",
      title: "Start with one simple log",
      body: "Log your next meal. You do not need a perfect day to build momentum.",
      severity: "info",
      whyShown: "No meals have been logged today.",
      generatedAt: now,
    });
  }

  if (params.mealCount >= 2 && totalProtein < target.proteinG * 0.5) {
    insights.push({
      id: "protein-behind",
      type: "protein_low",
      title: "Protein is behind today",
      body: "Add a protein anchor to your next meal to support fullness and muscle retention.",
      severity: "warning",
      whyShown: "Your logged protein is under half of today's target.",
      generatedAt: now,
    });
  }

  if (params.mealCount >= 2 && totalCals < target.calories * 0.55) {
    insights.push({
      id: "calories-low",
      type: "calories_low",
      title: "Your intake looks very low",
      body: "Sustainable progress usually beats aggressive restriction. Consider a balanced meal.",
      severity: "warning",
      whyShown: "Your calories are far below target after multiple logs.",
      generatedAt: now,
    });
  }

  const calPct = target.calories > 0 ? totalCals / target.calories : 0;
  const protPct = target.proteinG > 0 ? totalProtein / target.proteinG : 0;
  if (calPct >= 0.8 && calPct <= 1.1 && protPct >= 0.8) {
    insights.push({
      id: "strong-day",
      type: "consistency",
      title: "Strong consistency today",
      body: "You are close to your target range. Keep the next choice simple.",
      severity: "positive",
      whyShown: "Calories and protein are both close to target.",
      generatedAt: now,
    });
  }

  if (params.todayWaterMl < target.waterMl * 0.5) {
    insights.push({
      id: "water-low",
      type: "hydration",
      title: "Hydration check",
      body: "Drink and log one glass of water.",
      severity: "info",
      whyShown: "Your logged water is under half of today's target.",
      generatedAt: now,
    });
  }

  const weights = [...params.weightLogs].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  if (weights.length >= 2) {
    const diff = weights[0].weightKg - weights[1].weightKg;
    if (diff > 1) {
      insights.push({
        id: "weight-spike",
        type: "weight_variance",
        title: "Watch the trend, not one day",
        body: "Short-term weight jumps are often water, sodium, carbs, digestion, or training stress.",
        severity: "info",
        whyShown: "Today's weight is noticeably higher than the previous log.",
        generatedAt: now,
      });
    }
  }

  if (params.sleepHours !== undefined && params.sleepHours < 6) {
    insights.push({
      id: "sleep-low",
      type: "recovery",
      title: "Sleep may affect hunger",
      body: "Low sleep can increase hunger and reduce recovery. Aim for a better night.",
      severity: "warning",
      whyShown: "Your logged sleep was below six hours.",
      generatedAt: now,
    });
  }

  if (params.yesterdayLogs.length === 0) {
    insights.push({
      id: "missed-yesterday",
      type: "encouragement",
      title: "Missed logs happen",
      body: "Your next log matters more than yesterday's gap.",
      severity: "info",
      whyShown: "There were no logs yesterday.",
      generatedAt: now,
    });
  }

  if (params.loggedDaysThisWeek >= 5) {
    insights.push({
      id: "consistency-building",
      type: "streak",
      title: "Consistency is building",
      body: "You are building consistency. That matters more than perfection.",
      severity: "positive",
      whyShown: "You logged on at least five days this week.",
      generatedAt: now,
    });
  }

  return insights;
}
