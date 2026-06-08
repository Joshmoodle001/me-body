"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { getFoodLogsForDate, getWaterLogsForDate, getProfile, getTargets } from "@/db/queries";
import { generateInsights } from "@/lib/coaching";
import type { CoachingInsight } from "@/lib/coaching";
import type { DBProfile, DBTargets, DBFood, DBFoodLog } from "@/db/localDb";
import { db } from "@/db/localDb";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CoachPage() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<CoachingInsight[]>([]);

  useEffect(() => {
    (async () => {
      const profile = await getProfile();
      if (!profile) { setLoading(false); return; }
      const targets = await getTargets(profile.id);

      const date = todayStr();
      const logs = await getFoodLogsForDate(date);
      const waters = await getWaterLogsForDate(date);

      const enriched = await Promise.all(
        logs.map(async (log) => {
          const food = await db.foods.get(log.foodId);
          const factor = log.quantityG / 100;
          return {
            calories: Math.round((food?.caloriesPer100g ?? 0) * factor),
            proteinG: +(food?.proteinPer100g ?? 0) * factor,
            loggedAt: log.loggedAt,
          };
        })
      );

      const totalWater = waters.reduce((s, w) => s + w.amountMl, 0);

      // Check yesterday logs
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yestStr = yesterday.toISOString().slice(0, 10);
      const yestLogs = await getFoodLogsForDate(yestStr);

      const result = generateInsights({
        todayLogs: enriched,
        todayWaterMl: totalWater,
        weightLogs: [],
        loggedDaysThisWeek: date ? 1 : 0,
        yesterdayLogs: yestLogs.map(() => ({})),
        mealCount: logs.length,
        targets: targets ?? undefined,
      });
      setInsights(result);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="min-h-screen bg-stone-50"><LoadingState message="Analyzing your data..." /></div>;

  return (
    <div className="p-6 pb-8">
      <PageHeader title="Coach" subtitle="Gentle insights to guide your next choice" />

      {insights.length === 0 ? (
        <EmptyState title="No insights yet" description="Log your first meal to start receiving personalized coaching insights." />
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <div key={insight.id} className={`rounded-xl p-4 border ${
              insight.severity === "positive" ? "bg-green-50 border-green-200" :
              insight.severity === "warning" ? "bg-amber-50 border-amber-200" :
              "bg-blue-50 border-blue-200"
            }`}>
              <div className="flex items-start gap-2 mb-1">
                <span className="text-lg shrink-0">
                  {insight.severity === "positive" ? "&#10003;" : insight.severity === "warning" ? "!" : "i"}
                </span>
                <div>
                  <p className="font-semibold text-sm text-stone-900">{insight.title}</p>
                  <p className="text-sm text-stone-600 mt-0.5">{insight.body}</p>
                </div>
              </div>
              <p className="text-xs text-stone-400 mt-2 ml-7">Why: {insight.whyShown}</p>
            </div>
          ))}

          <div className="bg-white rounded-xl p-4 border border-stone-200 mt-4">
            <h3 className="font-semibold text-stone-900 text-sm mb-2">About Coaching</h3>
            <p className="text-sm text-stone-500">Coaching insights are rule-based and local. Your data never leaves your device. These are gentle suggestions, not medical advice. Adjust targets if they do not work for you.</p>
          </div>
        </div>
      )}
    </div>
  );
}
