"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { getFoodLogsForDate, getWaterLogsForDate, getFoodLogsForRange, getProfile, getTargets, getBodyMetrics, getWorkouts, getLatestBodyMetric } from "@/db/queries";
import { generateInsights, filterBySerenity, hasSafetyConcerns } from "@/lib/coaching";
import { getContraindicationsForProfile } from "@/lib/safety";
import { calculateWeeklyAverages, calculateWeightTrend } from "@/lib/calculations";
import type { CoachingInsight } from "@/lib/coaching";
import { getDb } from "@/db/localDb";

function todayStr(): string { return new Date().toISOString().slice(0, 10); }
function daysAgo(days: number): string { const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString().slice(0, 10); }

export default function CoachPage() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<CoachingInsight[]>([]);
  const [safetyFlags, setSafetyFlags] = useState<any[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => { (async () => {
    const profile = await getProfile();
    if (!profile) { setLoading(false); return; }
    const targets = await getTargets(profile.id);
    const date = todayStr();
    const [logs, waters, metrics, workouts, latestMetric] = await Promise.all([
      getFoodLogsForDate(date), getWaterLogsForDate(date), getBodyMetrics(7), getWorkouts(7), getLatestBodyMetric(),
    ]);

    const enriched = await Promise.all(logs.map(async (l) => {
      const food = await (await getDb()).foods.get(l.foodId);
      const f = l.quantityG / 100;
      return { calories: Math.round((food?.caloriesPer100g ?? 0) * f), proteinG: +(food?.proteinPer100g ?? 0) * f, carbsG: +(food?.carbsPer100g ?? 0) * f, fatG: +(food?.fatPer100g ?? 0) * f, fiberG: +(food?.fiberPer100g ?? 0) * f, loggedAt: l.loggedAt };
    }));

    const weekStart = daysAgo(6);
    const weekLogs = await getFoodLogsForRange(weekStart, date + "T23:59:59.999Z");
    const weekEnriched = await Promise.all(weekLogs.map(async (l) => {
      const food = await (await getDb()).foods.get(l.foodId);
      const f = l.quantityG / 100;
      return { calories: Math.round((food?.caloriesPer100g ?? 0) * f), proteinG: +(food?.proteinPer100g ?? 0) * f, loggedAt: l.loggedAt };
    }));

    const weekDays = new Set(weekLogs.map((l) => l.loggedAt.slice(0, 10))).size;
    const weekAvg = calculateWeeklyAverages(weekEnriched);
    const weightData = metrics.filter((m) => m.weightKg != null).map((m) => ({ weightKg: m.weightKg!, recordedAt: m.recordedAt }));
    const trend = calculateWeightTrend(weightData);
    const yesterdayEnriched = await Promise.all((await getFoodLogsForDate(daysAgo(1))).map(async (l) => {
      const food = await (await getDb()).foods.get(l.foodId);
      const f = l.quantityG / 100;
      return { calories: Math.round((food?.caloriesPer100g ?? 0) * f), proteinG: +(food?.proteinPer100g ?? 0) * f };
    }));

    setWeeklySummary({ loggedDays: weekDays, avgCalories: weekAvg.avgCalories, avgProtein: weekAvg.avgProtein, workoutCount: workouts.length, weightTrend: trend, latestWeight: latestMetric?.weightKg, latestSleep: latestMetric?.sleepHours, latestSteps: latestMetric?.steps });
    const contraindications = getContraindicationsForProfile(profile);
    setSafetyFlags(contraindications.filter((c: any) => c.riskLevel === "warning" || c.riskLevel === "danger"));

    setInsights(generateInsights({ profile, todayLogs: enriched, todayWaterMl: waters.reduce((s, w) => s + w.amountMl, 0), weightLogs: weightData, sleepHours: latestMetric?.sleepHours, steps: latestMetric?.steps, mood1To5: latestMetric?.mood1To5, loggedDaysThisWeek: weekDays, yesterdayLogs: yesterdayEnriched, mealCount: logs.length, targets: targets ?? undefined }));
    setLoading(false);
  })(); }, []);

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--background)" }}><LoadingState /></div>;

  const visibleInsights = filterBySerenity(insights.filter((i) => !dismissedIds.has(i.id)), hasSafetyConcerns(insights) ? 8 : 6);

  return (
    <div className="app-container">
      <PageHeader title="Coach" subtitle="Evidence-based insights for your journey" />

      {safetyFlags.length > 0 && (
        <div className="mb-4 space-y-2">
          {safetyFlags.map((f: any) => (
            <div key={f.id} className="card" style={{ background: "var(--error-soft)", borderColor: "rgba(255,107,107,0.20)" }}>
              <div className="flex items-start gap-2"><span className="text-base shrink-0 mt-0.5">&#x26A0;&#xFE0F;</span><div><p className="text-xs font-semibold" style={{ color: "var(--error)" }}>Health-aware guidance</p><p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{f.message}</p></div></div>
            </div>
          ))}
        </div>
      )}

      {/* Coach intro */}
      <div className="card card-glow mb-4" style={{ textAlign: "center" }}>
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 animate-pulse-glow" style={{ background: "var(--brand-soft)", border: "1px solid rgba(255,107,61,0.25)" }}>
          <svg className="w-8 h-8" fill="none" stroke="var(--brand)" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round">
            <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
        </div>
        <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Your coach</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Evidence-backed insights that adapt to your body, goals, and context.</p>
      </div>

      {/* Weekly Summary */}
      {weeklySummary && (
        <div className="card mb-4" style={{ background: "var(--card-muted)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>This Week</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <SummaryTile label="Days logged" value={`${weeklySummary.loggedDays}/7`} color="var(--gold)" />
            <SummaryTile label="Workouts" value={String(weeklySummary.workoutCount)} color="var(--brand)" />
            <SummaryTile label="Avg protein" value={weeklySummary.avgProtein > 0 ? `${weeklySummary.avgProtein.toFixed(0)}g` : "—"} color="var(--protein)" />
            <SummaryTile label="Latest weight" value={weeklySummary.latestWeight ? `${weeklySummary.latestWeight} kg` : "—"} color="var(--teal)" />
          </div>
          {weeklySummary.weightTrend.direction !== "not_enough_data" && (
            <div className="rounded-xl p-3" style={{ background: "var(--card-soft)" }}>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Your weight is {weeklySummary.weightTrend.direction === "decreasing" ? "down" : weeklySummary.weightTrend.direction === "increasing" ? "up" : "stable"} {Math.abs(weeklySummary.weightTrend.changeKg)}kg over {weeklySummary.weightTrend.days} days. Bodies do not lose weight in a straight line.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Insights */}
      {visibleInsights.length === 0 ? (
        <EmptyState title="No insights yet" description="Log your first meal to start receiving personalized coaching insights." />
      ) : (
        <div className="space-y-3">
          {visibleInsights.map((insight) => {
            const sevColor = insight.severity === "danger" ? "var(--error)" : insight.severity === "warning" ? "var(--warning)" : insight.severity === "positive" ? "var(--success)" : "var(--teal)";
            const sevBg = insight.severity === "danger" ? "var(--error-soft)" : insight.severity === "warning" ? "var(--warning-soft)" : insight.severity === "positive" ? "var(--success-soft)" : "var(--teal-soft)";
            return (
              <div key={insight.id} className="card" style={{ background: sevBg, borderColor: sevBg }}>
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0 mt-0.5" style={{ color: sevColor }}>{insight.severity === "danger" ? "\u26A0\uFE0F" : insight.severity === "warning" ? "\u26A0" : "\u2728"}</span>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "13px", fontWeight: 650, color: sevColor, marginBottom: "0.25rem" }}>{insight.title}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>{insight.body}</p>
                    <details className="mt-2"><summary className="text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>Why am I seeing this?</summary><p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{insight.whyShown}</p></details>
                    {insight.sourceRefs && insight.sourceRefs.length > 0 && <details className="mt-1"><summary className="text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>Sources</summary><p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{insight.sourceRefs.join(", ")}</p></details>}
                  </div>
                  <button onClick={() => setDismissedIds((prev) => new Set(prev).add(insight.id))} className="text-xs shrink-0 font-semibold px-2 py-1 rounded" style={{ color: "var(--text-muted)", background: "rgba(255,255,255,0.04)" }} aria-label="Dismiss">Dismiss</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center mt-6 mb-4" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
        Me Body coaching is educational wellness support, not medical diagnosis. If you have emergency symptoms, get urgent medical help.
      </p>
    </div>
  );
}

function SummaryTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ background: "var(--card-soft)", border: "1px solid var(--border)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-base font-bold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}
