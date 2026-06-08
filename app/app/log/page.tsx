"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { getFoodLogsForDate } from "@/db/queries";
import type { DBFoodLog, DBFood } from "@/db/localDb";
import { db } from "@/db/localDb";
import { MEAL_TYPES, type MealType } from "@/lib/constants";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function LogPage() {
  const [loading, setLoading] = useState(true);
  const [foodLogs, setFoodLogs] = useState<(DBFoodLog & { food?: DBFood })[]>([]);

  const loadLogs = async () => {
    setLoading(true);
    const date = todayStr();
    const logs = await getFoodLogsForDate(date);
    const enriched = await Promise.all(
      logs.map(async (log) => {
        const food = await db.foods.get(log.foodId);
        return { ...log, food: food ?? undefined };
      })
    );
    setFoodLogs(enriched);
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, []);

  const grouped = MEAL_TYPES.reduce((acc, meal) => {
    acc[meal] = foodLogs.filter((l) => l.mealType === meal);
    return acc;
  }, {} as Record<MealType, (DBFoodLog & { food?: DBFood })[]>);

  const handleRemove = async (id: string) => {
    await db.foodLogs.update(id, { deletedAt: new Date().toISOString() });
    loadLogs();
  };

  if (loading) return <div className="min-h-screen bg-stone-50"><LoadingState message="Loading log..." /></div>;

  return (
    <div className="p-6 pb-8">
      <PageHeader title="Food Log" subtitle={todayStr()}>
        <Link href="/food/search" className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">Add Food</Link>
      </PageHeader>

      {foodLogs.length === 0 ? (
        <EmptyState
          title="No meals logged today"
          description="Start logging your first meal. Search for foods, scan a barcode, or add one manually."
          action={{ label: "Add Food", onClick: () => window.location.href = "/food/search" }}
        />
      ) : (
        <div className="space-y-4">
          {MEAL_TYPES.map((meal) => {
            const items = grouped[meal];
            if (items.length === 0) return null;
            const mealCal = items.reduce((s, l) => {
              const factor = l.quantityG / 100;
              return s + Math.round((l.food?.caloriesPer100g ?? 0) * factor);
            }, 0);

            return (
              <div key={meal} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                  <h3 className="font-semibold text-stone-900 capitalize">{meal}</h3>
                  <span className="text-sm text-stone-500">{mealCal} kcal</span>
                </div>
                <div className="divide-y divide-stone-100">
                  {items.map((log) => (
                    <div key={log.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-900 truncate">{log.food?.name ?? "Food"}</p>
                        <p className="text-sm text-stone-500">{log.quantityG}g{log.servingLabel ? ` (${log.servingLabel})` : ""}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span className="text-sm font-medium text-stone-700">{Math.round((log.food?.caloriesPer100g ?? 0) * log.quantityG / 100)} kcal</span>
                        <button onClick={() => handleRemove(log.id)} className="text-red-500 hover:text-red-700 p-1" aria-label={`Remove ${log.food?.name ?? "food"}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="bg-white rounded-xl p-4 border border-stone-200">
            <p className="text-sm text-stone-700 font-medium">Total today:</p>
            <p className="text-lg font-bold text-green-700">
              {foodLogs.reduce((s, l) => s + Math.round((l.food?.caloriesPer100g ?? 0) * l.quantityG / 100), 0)} kcal
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
