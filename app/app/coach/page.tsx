"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { getFoodLogsForDate, getWaterLogsForDate, getProfile, getTargets } from "@/db/queries";
import { generateInsights } from "@/lib/coaching";
import type { CoachingInsight } from "@/lib/coaching";
import { db } from "@/db/localDb";

function todayStr(): string { return new Date().toISOString().slice(0, 10); }

export default function CoachPage() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<CoachingInsight[]>([]);

  useEffect(() => {
    (async () => {
      const profile = await getProfile();
      if (!profile) { setLoading(false); return; }
      const targets = await getTargets(profile.id);
      const date = todayStr();
      const [logs, waters] = await Promise.all([getFoodLogsForDate(date), getWaterLogsForDate(date)]);
      const enriched = await Promise.all(logs.map(async (l) => {
        const food = await db.foods.get(l.foodId);
        const f = l.quantityG / 100;
        return { calories: Math.round((food?.caloriesPer100g ?? 0) * f), proteinG: +(food?.proteinPer100g ?? 0) * f, loggedAt: l.loggedAt };
      }));
      const result = generateInsights({ todayLogs: enriched, todayWaterMl: waters.reduce((s, w) => s + w.amountMl, 0), weightLogs: [], loggedDaysThisWeek: logs.length > 0 ? 1 : 0, yesterdayLogs: [], mealCount: logs.length, targets: targets ?? undefined });
      setInsights(result);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--background)" }}><LoadingState /></div>;

  return (
    <div className="app-container">
      <PageHeader title="Coach" subtitle="Gentle insights to guide your next choice" />

      {insights.length === 0 ? (
        <EmptyState title="No insights yet" description="Log your first meal to start receiving personalized coaching insights." />
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <div key={insight.id} className="card" style={{
              background: insight.severity === "positive" ? "var(--brand-soft)" : insight.severity === "warning" ? "var(--warning-soft)" : "var(--info-soft)",
              borderColor: insight.severity === "positive" ? "var(--brand-soft)" : insight.severity === "warning" ? "var(--warning-soft)" : "var(--info-soft)",
            }}>
              <p style={{ fontSize: "13px", fontWeight: 650, color: insight.severity === "positive" ? "var(--brand-dark)" : insight.severity === "warning" ? "var(--warning)" : "var(--info)", marginBottom: "0.25rem" }}>{insight.title}</p>
              <p style={{ fontSize: "13px", color: insight.severity === "positive" ? "var(--brand)" : insight.severity === "warning" ? "var(--warning)" : "var(--info)" }}>{insight.body}</p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "0.75rem" }}>Why: {insight.whyShown}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
