"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import { getProfile, getTargets, getFoodLogsForDate, getWaterLogsForDate } from "@/db/queries";
import { calculateDailyNutrition } from "@/lib/calculations";
import { generateInsights } from "@/lib/coaching";
import type { DBProfile, DBTargets, DBFoodLog, DBWaterLog, DBFood } from "@/db/localDb";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [targets, setTargets] = useState<DBTargets | null>(null);
  const [foodLogs, setFoodLogs] = useState<(DBFoodLog & { food?: DBFood })[]>([]);
  const [waterLogs, setWaterLogs] = useState<DBWaterLog[]>([]);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      if (!p) return setLoading(false);
      setProfile(p);

      const t = await getTargets(p.id);
      setTargets(t ?? null);

      const date = todayStr();
      const logs = await getFoodLogsForDate(date);
      const waters = await getWaterLogsForDate(date);

      // Enrich food logs with food data
      const { db } = await import("@/db/localDb");
      const enriched = await Promise.all(
        logs.map(async (log) => {
          const food = await db.foods.get(log.foodId);
          return { ...log, food: food ?? undefined };
        })
      );
      setFoodLogs(enriched);
      setWaterLogs(waters);

      // Generate insights
      const enriched2 = enriched.map((log) => {
        const factor = log.quantityG / 100;
        return {
          calories: (log.food?.caloriesPer100g ?? 0) * factor,
          proteinG: (log.food?.proteinPer100g ?? 0) * factor,
          loggedAt: log.loggedAt,
        };
      });
      const totalWater = waters.reduce((s, w) => s + w.amountMl, 0);
      const coachInsights = generateInsights({
        todayLogs: enriched2,
        todayWaterMl: totalWater,
        weightLogs: [],
        loggedDaysThisWeek: 0,
        yesterdayLogs: [],
        mealCount: logs.length,
        targets: t ?? undefined,
      });
      setInsights(coachInsights);

      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="min-h-screen bg-stone-50"><LoadingState message="Loading dashboard..." /></div>;

  if (!profile || !targets) {
    return (
      <div className="p-6 bg-stone-50 min-h-screen">
        <PageHeader title="Dashboard" />
        <div className="text-center py-16">
          <p className="text-stone-500 mb-4">Set up your profile to see your dashboard.</p>
          <Link href="/onboarding" className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">Get Started</Link>
        </div>
      </div>
    );
  }

  const enrichedForNutrition = foodLogs.map((log) => {
    const factor = log.quantityG / 100;
    return {
      calories: Math.round((log.food?.caloriesPer100g ?? 0) * factor),
      proteinG: +(log.food?.proteinPer100g ?? 0) * factor,
      carbsG: +(log.food?.carbsPer100g ?? 0) * factor,
      fatG: +(log.food?.fatPer100g ?? 0) * factor,
      fiberG: +(log.food?.fiberPer100g ?? 0) * factor,
    };
  });
  const daily = calculateDailyNutrition(enrichedForNutrition);
  const waterTotal = waterLogs.reduce((s, w) => s + w.amountMl, 0);

  const MacroBar = ({ label, current, target, unit }: { label: string; current: number; target: number; unit: string }) => {
    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-stone-700">{label}</span>
          <span className="text-stone-500">{Math.round(current)} / {target} {unit}</span>
        </div>
        <div className="h-2.5 bg-stone-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 pb-8">
      <PageHeader title="Dashboard" subtitle={todayStr()} />

      <div className="grid gap-4">
        <div className="bg-white rounded-xl p-5 border border-stone-200">
          <h2 className="font-semibold text-stone-900 mb-4">Today&apos;s Nutrition</h2>
          <MacroBar label="Calories" current={daily.calories} target={targets.calories} unit="kcal" />
          <MacroBar label="Protein" current={daily.proteinG} target={targets.proteinG} unit="g" />
          <MacroBar label="Carbs" current={daily.carbsG} target={targets.carbsG} unit="g" />
          <MacroBar label="Fat" current={daily.fatG} target={targets.fatG} unit="g" />
          <MacroBar label="Water" current={waterTotal} target={targets.waterMl} unit="ml" />
        </div>

        {insights.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-stone-200">
            <h2 className="font-semibold text-stone-900 mb-3">Coach</h2>
            {insights.slice(0, 2).map((insight) => (
              <div key={insight.id} className="mb-3 last:mb-0">
                <p className="font-medium text-sm text-stone-900">{insight.title}</p>
                <p className="text-sm text-stone-500">{insight.body}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Scan Barcode", href: "/app/scan", icon: "S" },
            { label: "Search Food", href: "/food/search", icon: "F" },
            { label: "Add Manual", href: "/food/manual", icon: "+" },
            { label: "Log Weight", href: "/app/progress", icon: "W" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="bg-white rounded-xl p-4 border border-stone-200 hover:shadow-sm transition-shadow text-center">
              <span className="text-2xl font-bold text-green-600 block mb-1">{item.icon}</span>
              <span className="text-sm font-medium text-stone-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
