import type { DBProfile, DBTargets, DBBodyMetric } from "@/db/localDb";
import { getContraindicationsForProfile, getActiveRedFlags } from "./safety";
import { chooseGoalMode, getGoalModeLabel, getGoalModeDescription } from "./adaptiveEngine";

export interface CoachingInsight {
  id: string;
  type: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "positive" | "danger";
  whyShown: string;
  generatedAt: string;
  dismissedAt?: string;
  sourceRefs?: string[];
}

export interface CoachingParams {
  profile?: DBProfile;
  targets?: Pick<DBTargets, "calories" | "proteinG" | "waterMl">;
  todayLogs: { calories?: number; proteinG?: number; fatG?: number; carbsG?: number; fiberG?: number; loggedAt: string }[];
  todayWaterMl: number;
  weightLogs: { weightKg: number; recordedAt: string }[];
  sleepHours?: number;
  steps?: number;
  mood1To5?: number;
  loggedDaysThisWeek: number;
  yesterdayLogs: { calories?: number; proteinG?: number }[];
  mealCount: number;
  cycleSymptoms?: boolean;
  sodiumEstimate?: number;
}

export function generateInsights(params: CoachingParams): CoachingInsight[] {
  const insights: CoachingInsight[] = [];
  const now = new Date().toISOString();

  const totalCals = params.todayLogs.reduce((s, l) => s + (l.calories ?? 0), 0);
  const totalProtein = params.todayLogs.reduce((s, l) => s + (l.proteinG ?? 0), 0);
  const target = params.targets ?? { calories: 2000, proteinG: 120, waterMl: 2500 };
  const profile = params.profile;

  const add = (id: string, type: string, title: string, body: string, severity: CoachingInsight["severity"], whyShown: string, sourceRefs?: string[]) => {
    if (insights.find((i) => i.id === id)) return;
    insights.push({ id, type, title, body, severity, whyShown, generatedAt: now, sourceRefs });
  };

  // --- SAFETY CHECKS (highest priority) ---
  if (profile) {
    const contraindications = getContraindicationsForProfile(profile);
    const redFlags = getActiveRedFlags(profile);

    for (const c of contraindications) {
      if (c.riskLevel === "danger" || c.riskLevel === "warning") {
        add(`safety-${c.id}`, "safety_advisory", "Health-aware guidance active", c.message, c.riskLevel === "danger" ? "danger" : "warning", `Active contraindication: ${c.condition}`, c.sourceRefs);
      }
    }

    for (const f of redFlags) {
      add(`redflag-${f.id}`, "red_flag", "Important safety notice", f.message, f.severity === "emergency" ? "danger" : "warning", `Active red flag: ${f.condition}`, f.sourceRefs);
    }

    if (profile.calorieVisibility === "hidden") {
      add("calorie-hidden", "privacy_mode", "Calorie-hidden active", "You are tracking with calorie numbers hidden. Focus on meal balance, food quality, and how you feel.", "info", "User selected calorie-hidden mode");
    }
  }

  // --- ADAPTIVE GOAL MODE ---
  if (profile) {
    const trainingAgeMonths = 0; // default for new users
    const detrained = false;
    const waistRisk = profile.goalType === "fat_loss";
    const mode = chooseGoalMode(profile, trainingAgeMonths, detrained, waistRisk);
    if (mode !== "fat_loss" && mode !== "muscle_gain" && mode !== "maintenance") {
      add(`mode-${mode}`, "goal_guidance", getGoalModeLabel(mode), getGoalModeDescription(mode), "info", `Adaptive goal mode: ${mode}`);
    }
  }
  if (params.mealCount === 0) {
    add("no-meals", "meal_gap", "Start with one simple log", "Log your next meal or just a glass of water. You do not need a perfect day to build momentum.", "info", "No meals logged today");
    add("smallest-step", "encouragement", "The smallest step matters", "The smallest useful action right now: drink water, log one balanced meal, or take a 10-minute walk.", "info", "Starting from zero — offer smallest possible step");
    return insights;
  }

  // --- SLEEP CHECKS (run early, affects everything) ---
  if (params.sleepHours !== undefined && params.sleepHours < 6) {
    add("sleep-low", "recovery", "Sleep may be affecting your hunger today", "Short sleep can make hunger louder and late-night eating easier. Tonight's win is not perfection — it is protecting your sleep window.", "warning", "Sleep under 6 hours — affects appetite and recovery", ["nhlbi-sleep", "niddk-weight-management"]);
  }

  if (params.sleepHours !== undefined && params.sleepHours < 7 && params.sleepHours >= 6) {
    add("sleep-marginal", "recovery", "Sleep is close to target", "You are near the 7–9 hour range recommended for most adults. A slightly earlier wind-down could help recovery.", "info", "Sleep close to but below target range", ["nhlbi-sleep"]);
  }

  // --- MEDICATION AWARENESS ---
  if (profile && profile.medications.length > 0 && profile.medications.some((m) => m !== "none")) {
    add("meds-aware", "medication_context", "You have active medications on file", "Some medicines can change appetite, fluid balance, glucose, or weight trend. That is a body response, not a failure. We will adapt the plan around that.", "info", "Profile has active medications listed");
  }

  // --- CYCLE SUPPORT ---
  if (params.cycleSymptoms) {
    add("cycle-symptoms", "cycle_aware", "Cycle symptoms are up today", "If symptoms are up today, the goal can shift from pushing harder to staying consistent with a lighter option.", "info", "Cycle symptoms reported", ["acsm-resistance-2026"]);
  }

  // --- PROTEIN CHECKS ---
  if (params.mealCount >= 2 && totalProtein < target.proteinG * 0.5) {
    add("protein-behind", "protein_low", "Protein is behind today", "Add a protein anchor to your next meal to support fullness, lean mass, and recovery.", "warning", "Protein under half of target", ["niddk-weight-management"]);
  }

  if (params.mealCount >= 2 && totalProtein >= target.proteinG * 0.85) {
    add("protein-strong", "consistency", "Protein is looking strong", "You are close to your protein target. This helps support lean mass and satiety.", "positive", "Protein near or above target");
  }

  // --- CALORIE CHECKS ---
  const calPct = target.calories > 0 ? totalCals / target.calories : 0;
  if (params.mealCount >= 2 && calPct < 0.55 && totalCals > 0) {
    add("calories-low", "calories_low", "Your intake looks very low today", "Sustainable progress usually beats aggressive restriction. Consider a balanced meal rather than pushing further.", "warning", "Calories well below target");
  }

  if (calPct >= 0.8 && calPct <= 1.1) {
    add("strong-day", "consistency", "Strong consistency today", "You are close to your target range. The next choice matters — keep it simple.", "positive", "Calories close to target range");
  }

  // --- SODIUM / FOOD QUALITY ---
  if (params.sodiumEstimate && params.sodiumEstimate > 3000) {
    add("sodium-high", "food_quality", "Today looks high in salty foods", "Add a potassium-rich food at your next meal — beans, spinach, potatoes, banana, or morogo (wild spinach).", "warning", "Estimated sodium above threshold", ["who-healthy-diet-2023"]);
  }

  // --- HYDRATION ---
  if (params.todayWaterMl < target.waterMl * 0.5) {
    add("water-low", "hydration", "Hydration check", "You are behind on water today. Drink and log one glass now — hydration supports energy, digestion, and recovery.", "info", "Water under half target");
  }

  // --- WEIGHT TREND ANALYSIS ---
  const sortedWeights = [...params.weightLogs].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  if (sortedWeights.length >= 2) {
    const latest = sortedWeights[0].weightKg;
    const previous = sortedWeights[1].weightKg;
    const diff = latest - previous;

    if (Math.abs(diff) > 1.5) {
      add("weight-spike", "weight_variance", "Watch the trend, not one day", "A jump this size is usually water, sodium, carbs, digestion, or training stress — not fat gain.", "info", "Short-term weight change over 1.5 kg");
    }
  }

  // --- PLATEAU DETECTION (7+ days, multiple weights) ---
  if (sortedWeights.length >= 3) {
    const recent7 = sortedWeights.filter((w) => {
      const daysAgo = (Date.now() - new Date(w.recordedAt).getTime()) / 86400000;
      return daysAgo <= 7;
    });
    if (recent7.length >= 3) {
      const oldest = recent7[recent7.length - 1].weightKg;
      const newest = recent7[0].weightKg;
      const change7d = newest - oldest;
      if (Math.abs(change7d) < 0.3 && profile?.goalType === "fat_loss") {
        add("plateau-context", "plateau", "Your weight trend is flatter this week", "Before changing calories, let's check sleep, stress, sodium, hydration, and activity consistency. Bodies do not lose weight in a straight line.", "info", "7-day weight change under 0.3 kg during fat loss goal", ["niddk-weight-management"]);
      }
    }
  }

  // --- STEPS / ACTIVITY ---
  if (params.steps !== undefined && params.steps < 3000) {
    add("steps-low", "activity", "Steps are low today", "Even a short walk can improve energy and mood. Start with 5–10 minutes and build from there.", "info", "Steps under 3,000");
  }

  // --- MOOD ---
  if (params.mood1To5 !== undefined && params.mood1To5 <= 2) {
    add("mood-low", "wellbeing", "How you feel matters", "Stress can increase hunger and reduce follow-through. Choose one small supportive action — water, one balanced meal, or a short walk.", "info", "Mood logged at 2 or below", ["who-healthy-diet-2023"]);
  }

  // --- CONSISTENCY ---
  if (params.loggedDaysThisWeek >= 5) {
    add("consistency-building", "streak", "Consistency is building", "You are logging consistently. That matters more than perfection — consistency is the foundation of progress.", "positive", "Five or more logging days this week");
  }

  // --- MISSED YESTERDAY ---
  if (params.yesterdayLogs.length === 0 && params.loggedDaysThisWeek > 0) {
    add("missed-yesterday", "encouragement", "No problem — want a quick estimate?", "Your next log matters more than yesterday's gap. Want to quickly log what you remember?", "info", "No logs yesterday but some logs earlier this week");
  }

  // --- MEAL STRUCTURE ---
  if (params.mealCount === 1) {
    add("meal-structure", "meal_gap", "One log so far", "Aim for balanced meals spread across the day. Too few meals can make late-day hunger harder to manage.", "info", "Only one meal logged");
  }

  return insights;
}

export function hasSafetyConcerns(insights: CoachingInsight[]): boolean {
  return insights.some((i) => i.severity === "danger" && (i.type === "safety_advisory" || i.type === "red_flag"));
}

export function filterBySerenity(insights: CoachingInsight[], maxItems = 4): CoachingInsight[] {
  return insights
    .sort((a, b) => {
      const sev = { danger: 0, warning: 1, info: 2, positive: 3 };
      return (sev[a.severity] ?? 2) - (sev[b.severity] ?? 2);
    })
    .slice(0, maxItems);
}
