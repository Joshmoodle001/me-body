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

function daysAgo(days: number): string {
  const d = new Date(); d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

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
      getFoodLogsForDate(date),
      getWaterLogsForDate(date),
      getBodyMetrics(7),
      getWorkouts(7),
      getLatestBodyMetric(),
    ]);

    const enriched = await Promise.all(logs.map(async (l) => {
      const food = await (await getDb()).foods.get(l.foodId);
      const f = l.quantityG / 100;
      return { calories: Math.round((food?.caloriesPer100g ?? 0) * f), proteinG: +(food?.proteinPer100g ?? 0) * f, carbsG: +(food?.carbsPer100g ?? 0) * f, fatG: +(food?.fatPer100g ?? 0) * f, fiberG: +(food?.fiberPer100g ?? 0) * f, loggedAt: l.loggedAt };
    }));

    // Weekly data
    const weekStart = daysAgo(6);
    const weekEnd = date + "T23:59:59.999Z";
    const weekLogs = await getFoodLogsForRange(weekStart, weekEnd);
    const weekEnriched = await Promise.all(weekLogs.map(async (l) => {
      const food = await (await getDb()).foods.get(l.foodId);
      const f = l.quantityG / 100;
      return { calories: Math.round((food?.caloriesPer100g ?? 0) * f), proteinG: +(food?.proteinPer100g ?? 0) * f, loggedAt: l.loggedAt };
    }));

    const weekDays = new Set(weekLogs.map((l) => l.loggedAt.slice(0, 10))).size;
    const weekAvg = calculateWeeklyAverages(weekEnriched);
    const weightData = metrics.filter((m) => m.weightKg != null).map((m) => ({ weightKg: m.weightKg!, recordedAt: m.recordedAt }));
    const trend = calculateWeightTrend(weightData);

    const yesterdayStr = daysAgo(1);
    const yesterdayLogs = await getFoodLogsForDate(yesterdayStr);
    const yesterdayEnriched = await Promise.all(yesterdayLogs.map(async (l) => {
      const food = await (await getDb()).foods.get(l.foodId);
      const f = l.quantityG / 100;
      return { calories: Math.round((food?.caloriesPer100g ?? 0) * f), proteinG: +(food?.proteinPer100g ?? 0) * f };
    }));

    setWeeklySummary({
      loggedDays: weekDays,
      avgCalories: weekAvg.avgCalories,
      avgProtein: weekAvg.avgProtein,
      workoutCount: workouts.length,
      weightTrend: trend,
      latestWeight: latestMetric?.weightKg,
      latestSleep: latestMetric?.sleepHours,
      latestSteps: latestMetric?.steps,
      weekLogs: weekEnriched,
    });

    const contraindications = getContraindicationsForProfile(profile);
    setSafetyFlags(contraindications.filter((c: any) => c.riskLevel === "warning" || c.riskLevel === "danger"));

    const result = generateInsights({
      profile,
      todayLogs: enriched,
      todayWaterMl: waters.reduce((s, w) => s + w.amountMl, 0),
      weightLogs: weightData,
      sleepHours: latestMetric?.sleepHours,
      steps: latestMetric?.steps,
      mood1To5: latestMetric?.mood1To5,
      loggedDaysThisWeek: weekDays,
      yesterdayLogs: yesterdayEnriched,
      mealCount: logs.length,
      targets: targets ?? undefined,
    });
    setInsights(result);
    setLoading(false);
  })(); }, []);

  const dismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--background)" }}><LoadingState /></div>;

  const visibleInsights = filterBySerenity(
    insights.filter((i) => !dismissedIds.has(i.id)),
    hasSafetyConcerns(insights) ? 8 : 6
  );

  return (
    <div className="app-container">
      <PageHeader title="Coach" subtitle="Evidence-based insights for your journey" />

      {/* Safety Alerts */}
      {safetyFlags.length > 0 && (
        <div className="mb-4 space-y-2">
          {safetyFlags.map((f: any) => (
            <div key={f.id} className="card" style={{ background: "var(--ember-soft)", borderColor: "var(--ember-soft)" }}>
              <div className="flex items-start gap-2">
                <span className="text-base shrink-0 mt-0.5" style={{ color: "var(--ember)" }}>&#x26A0;&#xFE0F;</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--ember)" }}>Health-aware guidance active</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{f.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Summary */}
      {weeklySummary && (
        <div className="card mb-4" style={{ background: "linear-gradient(135deg, var(--card) 0%, var(--background-soft) 100%)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>This Week</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <SummaryTile label="Days logged" value={`${weeklySummary.loggedDays}/7`} color="var(--brand)" />
            <SummaryTile label="Workouts" value={String(weeklySummary.workoutCount)} color="var(--ember)" />
            <SummaryTile label="Avg protein" value={weeklySummary.avgProtein > 0 ? `${weeklySummary.avgProtein.toFixed(0)}g` : "—"} color="var(--protein)" />
            <SummaryTile label="Latest weight" value={weeklySummary.latestWeight ? `${weeklySummary.latestWeight} kg` : "—"} color="var(--calories)" />
          </div>
          {weeklySummary.weightTrend.direction !== "not_enough_data" && (
            <div className="rounded-xl p-3" style={{ background: "var(--card-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Your 7-day average weight is {weeklySummary.weightTrend.direction === "decreasing" ? "down" : weeklySummary.weightTrend.direction === "increasing" ? "up" : "stable"} {Math.abs(weeklySummary.weightTrend.changeKg)}kg over {weeklySummary.weightTrend.days} days.
                {weeklySummary.weightTrend.direction === "stable" && " Bodies do not lose weight in a straight line — this is normal."}
                {weeklySummary.latestSleep && weeklySummary.latestSleep < 7 && ` Sleep averaged ${weeklySummary.latestSleep}h — short sleep can increase hunger.`}
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
            const sevBg = insight.severity === "danger" ? "var(--error-soft)" : insight.severity === "warning" ? "var(--warning-soft)" : insight.severity === "positive" ? "var(--success-soft)" : "var(--info-soft)";
            const sevColor = insight.severity === "danger" ? "var(--error)" : insight.severity === "warning" ? "var(--warning)" : insight.severity === "positive" ? "var(--success)" : "var(--info)";
            const sevBody = insight.severity === "danger" ? "var(--error)" : insight.severity === "warning" ? "var(--warning)" : insight.severity === "positive" ? "var(--success)" : "var(--info)";
            return (
              <div key={insight.id} className="card" style={{ background: sevBg, borderColor: sevBg }}>
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0 mt-0.5" style={{ color: sevColor }}>
                    {insight.severity === "danger" ? "\u26A0\uFE0F" : insight.severity === "warning" ? "\u26A0" : "\u2728"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "13px", fontWeight: 650, color: sevColor, marginBottom: "0.25rem" }}>{insight.title}</p>
                    <p style={{ fontSize: "12px", color: sevBody, lineHeight: "1.5" }}>{insight.body}</p>
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>Why am I seeing this?</summary>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{insight.whyShown}</p>
                    </details>
                    {insight.sourceRefs && insight.sourceRefs.length > 0 && (
                      <details className="mt-1">
                        <summary className="text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>Sources</summary>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{insight.sourceRefs.join(", ")}</p>
                      </details>
                    )}
                  </div>
                  <button onClick={() => dismiss(insight.id)} className="text-xs shrink-0 font-semibold px-2 py-1 rounded" style={{ color: "var(--text-muted)" }} aria-label="Dismiss insight">
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center mt-6 mb-4" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
        Me Body coaching is educational wellness support, not medical diagnosis or emergency care.
        If you have chest pain, fainting, severe shortness of breath, or other emergency symptoms, get urgent medical help.
      </p>
    </div>
  );
}

function SummaryTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ background: "var(--card-muted)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-base font-bold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}
