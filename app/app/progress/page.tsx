"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { getBodyMetrics, getProfile, getTargets, getFoodLogsForRange } from "@/db/queries";
import { calculateDailyNutrition, calculateWeightTrend } from "@/lib/calculations";
import type { DBBodyMetric, DBProfile, DBTargets, DBFoodLog, DBFood } from "@/db/localDb";
import { db } from "@/db/localDb";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DBBodyMetric[]>([]);
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [targets, setTargets] = useState<DBTargets | null>(null);
  const [weeklyCals, setWeeklyCals] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const [m, p] = await Promise.all([getBodyMetrics(90), getProfile()]);
      setMetrics(m.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()));

      if (p) {
        setProfile(p);
        const t = await getTargets(p.id);
        setTargets(t ?? null);

        // Weekly avg calories
        const logs = await getFoodLogsForRange(`${daysAgo(7)}T00:00:00.000Z`, `${daysAgo(0)}T23:59:59.999Z`);
        const enriched = await Promise.all(logs.map(async (l) => {
          const food = await db.foods.get(l.foodId);
          const factor = l.quantityG / 100;
          return {
            calories: Math.round((food?.caloriesPer100g ?? 0) * factor),
            proteinG: +(food?.proteinPer100g ?? 0) * factor,
          };
        }));
        const daily = calculateDailyNutrition(enriched);
        setWeeklyCals(Math.round(daily.calories / Math.max(1, 7)));
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="min-h-screen bg-stone-50"><LoadingState message="Loading progress..." /></div>;

  const weightData = metrics.filter((m) => m.weightKg !== undefined && m.weightKg !== null).map((m) => ({ weightKg: m.weightKg!, recordedAt: m.recordedAt }));
  const trend = calculateWeightTrend(weightData);
  const latest = metrics[metrics.length - 1];

  return (
    <div className="p-6 pb-8">
      <PageHeader title="Progress" subtitle="Track your trends over time" />

      {metrics.length === 0 ? (
        <EmptyState title="No metrics logged yet" description="Log your weight and body measurements to see trends." action={{ label: "Log Weight", onClick: () => window.location.href = "/app/progress" }} />
      ) : (
        <div className="space-y-4">
          {latest?.weightKg && (
            <div className="bg-white rounded-xl p-5 border border-stone-200">
              <h2 className="font-semibold text-stone-900 mb-3">Weight Trend</h2>
              <p className="text-3xl font-bold text-stone-900 mb-1">{latest.weightKg} <span className="text-lg font-normal text-stone-500">kg</span></p>
              {trend.direction !== "not_enough_data" && (
                <p className="text-sm text-stone-500">
                  {trend.direction === "decreasing" ? "Down" : trend.direction === "increasing" ? "Up" : "Stable"} {Math.abs(trend.changeKg)}kg over {trend.days} days
                </p>
              )}
              {targets && <p className="text-sm text-stone-400 mt-1">Target: {profile?.goalWeightKg ?? "—"} kg</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {latest?.waistCm && (
              <div className="bg-white rounded-xl p-4 border border-stone-200 text-center">
                <p className="text-sm text-stone-500">Waist</p>
                <p className="text-2xl font-bold text-stone-900">{latest.waistCm} cm</p>
              </div>
            )}
            {latest?.sleepHours !== undefined && latest?.sleepHours !== null && (
              <div className="bg-white rounded-xl p-4 border border-stone-200 text-center">
                <p className="text-sm text-stone-500">Sleep</p>
                <p className="text-2xl font-bold text-stone-900">{latest.sleepHours}h</p>
              </div>
            )}
            {latest?.steps !== undefined && latest?.steps !== null && (
              <div className="bg-white rounded-xl p-4 border border-stone-200 text-center">
                <p className="text-sm text-stone-500">Steps</p>
                <p className="text-2xl font-bold text-stone-900">{latest.steps.toLocaleString()}</p>
              </div>
            )}
            {weeklyCals > 0 && (
              <div className="bg-white rounded-xl p-4 border border-stone-200 text-center">
                <p className="text-sm text-stone-500">Avg Cals/Day</p>
                <p className="text-2xl font-bold text-stone-900">{weeklyCals}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 border border-stone-200">
            <h2 className="font-semibold text-stone-900 mb-3">Log New Entry</h2>
            <button
              onClick={() => {
                const w = prompt("Weight (kg):");
                if (w) {
                  import("@/db/queries").then(({ saveBodyMetric }) => {
                    saveBodyMetric({ weightKg: Number(w), recordedAt: new Date().toISOString() }).then(() => window.location.reload());
                  });
                }
              }}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors mb-2"
            >
              Quick Log Weight
            </button>
            <p className="text-xs text-stone-500 text-center">More detailed metrics coming in v1.1</p>
          </div>
        </div>
      )}
    </div>
  );
}
