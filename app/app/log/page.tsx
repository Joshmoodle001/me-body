"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { getFoodLogsForDate } from "@/db/queries";
import type { DBFoodLog, DBFood } from "@/db/localDb";
import { getDb } from "@/db/localDb";
import { MEAL_TYPES, type MealType } from "@/lib/constants";

function todayStr(): string { return new Date().toISOString().slice(0, 10); }

export default function LogPage() {
  const [loading, setLoading] = useState(true);
  const [foodLogs, setFoodLogs] = useState<(DBFoodLog & { food?: DBFood })[]>([]);

  const loadLogs = async () => {
    setLoading(true);
    const date = todayStr();
    const logs = await getFoodLogsForDate(date);
    const enriched = await Promise.all(logs.map(async (log) => {
      const food = await (await getDb()).foods.get(log.foodId);
      return { ...log, food: food ?? undefined };
    }));
    setFoodLogs(enriched);
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, []);

  const grouped = MEAL_TYPES.reduce((acc, meal) => {
    acc[meal] = foodLogs.filter((l) => l.mealType === meal);
    return acc;
  }, {} as Record<MealType, (DBFoodLog & { food?: DBFood })[]>);

  const handleRemove = async (id: string) => {
    await (await getDb()).foodLogs.update(id, { deletedAt: new Date().toISOString() });
    loadLogs();
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--background)" }}><LoadingState /></div>;

  const totalCal = foodLogs.reduce((s, l) => s + Math.round((l.food?.caloriesPer100g ?? 0) * l.quantityG / 100), 0);

  return (
    <div className="app-container">
      <PageHeader title="Food Log" subtitle={todayStr()}>
        <Link href="/food/search" className="inline-flex px-5 py-2.5 rounded-[var(--radius-button)] text-sm font-semibold" style={{ background: "var(--brand)", color: "white" }}>+ Add</Link>
      </PageHeader>

      {foodLogs.length === 0 ? (
        <EmptyState title="No meals logged today" description="Search for foods, scan a barcode, or add one manually." action={{ label: "Add Food", onClick: () => window.location.href = "/food/search" }} />
      ) : (
        <div className="space-y-4">
          {MEAL_TYPES.map((meal) => {
            const items = grouped[meal];
            if (items.length === 0) return null;
            const mealCal = items.reduce((s, l) => s + Math.round((l.food?.caloriesPer100g ?? 0) * l.quantityG / 100), 0);

            return (
              <div key={meal} className="overflow-hidden" style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--border)", background: "var(--card)", boxShadow: "var(--shadow-card)" }}>
                <div className="px-5 py-3 flex justify-between items-center" style={{ borderBottom: "1px solid var(--border)", background: "var(--card-muted)" }}>
                  <h3 className="text-sm font-bold capitalize" style={{ color: "var(--text-primary)" }}>{meal}</h3>
                  <span style={{ fontSize: "13px", fontWeight: 650, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{mealCal} kcal</span>
                </div>
                {items.map((log) => (
                  <div key={log.id} className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{log.food?.name ?? "Food"}</p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{log.quantityG}g{log.servingLabel ? ` (${log.servingLabel})` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-secondary)" }}>{Math.round((log.food?.caloriesPer100g ?? 0) * log.quantityG / 100)} kcal</span>
                      <button onClick={() => handleRemove(log.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--error)" }} aria-label="Remove">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          <div className="card flex items-center gap-2" style={{ background: "var(--card)" }}>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Total:</span>
            <span className="text-lg font-bold tabular-nums" style={{ color: "var(--brand)" }}>{totalCal} kcal</span>
          </div>
        </div>
      )}
    </div>
  );
}
