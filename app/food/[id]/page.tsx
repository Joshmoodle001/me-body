"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import { getFoodById, saveFoodLog } from "@/db/queries";
import { MEAL_TYPES, type MealType } from "@/lib/constants";
import { nutritionForQuantity } from "@/lib/calculations";
import type { DBFood } from "@/db/localDb";

export default function FoodDetailPage() {
  const params = useParams(); const router = useRouter();
  const [food, setFood] = useState<DBFood | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState("100");
  const [mealType, setMealType] = useState<MealType>("snack");
  const [saving, setSaving] = useState(false);

  useEffect(() => { getFoodById(params.id as string).then((f) => { setFood(f ?? null); if (f?.servingSizeG) setQuantity(String(f.servingSizeG)); setLoading(false); }); }, [params.id]);

  if (loading) return <div className="min-h-screen" style={{ background: "var(--background)" }}><LoadingState /></div>;
  if (!food) return <div className="app-container"><ErrorState message="Food not found." onRetry={() => router.back()} /></div>;

  const nut = nutritionForQuantity({ calories: food.caloriesPer100g ?? 0, protein: food.proteinPer100g ?? 0, carbs: food.carbsPer100g ?? 0, fat: food.fatPer100g ?? 0, fiber: food.fiberPer100g ?? 0 }, Number(quantity));

  const handleSave = async () => { setSaving(true); await saveFoodLog({ foodId: food.id, mealType, quantityG: Number(quantity), servingLabel: Number(quantity) === food.servingSizeG ? `${food.servingSizeG}g serving` : `${quantity}g`, loggedAt: new Date().toISOString(), notes: "" }); router.push("/app/log"); };

  const confBg = food.confidenceScore >= 85 ? "var(--success-soft)" : food.confidenceScore >= 65 ? "var(--warning-soft)" : "var(--error-soft)";
  const confColor = food.confidenceScore >= 85 ? "var(--success)" : food.confidenceScore >= 65 ? "var(--warning)" : "var(--error)";

  return (
    <div className="app-container">
      <PageHeader title={food.name} subtitle={food.brand ?? food.source} />
      <div className="card mb-4">
        <span className="badge" style={{ background: confBg, color: confColor }}>{food.source} · {food.confidenceScore}/100</span>
        <div className="mt-3 space-y-2">
          {[{ l: "Calories", v: food.caloriesPer100g, u: "kcal" },{ l: "Protein", v: food.proteinPer100g, u: "g" },{ l: "Carbs", v: food.carbsPer100g, u: "g" },{ l: "Fat", v: food.fatPer100g, u: "g" },{ l: "Fiber", v: food.fiberPer100g, u: "g" },{ l: "Sugar", v: food.sugarPer100g, u: "g" },{ l: "Sodium", v: food.sodiumPer100g, u: "mg" }].map((n) => (
            <div key={n.l} className="flex justify-between py-1" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{n.l}</span>
              <span className="font-semibold text-sm tabular-nums" style={{ color: "var(--text-primary)" }}>{n.v ?? "—"} {n.u} <span className="text-xs" style={{ color: "var(--text-muted)" }}>/100g</span></span>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="font-bold mb-3" style={{ color: "var(--text-primary)" }}>Log This Food</h3>
        <div className="space-y-3">
          <div><label className="input-label">Quantity (g)</label><input id="quantity" type="text" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/\D/g,""))} className="input" /></div>
          <div><label className="input-label">Meal</label><select id="mealType" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)} className="input">{MEAL_TYPES.map((m) => (<option key={m} value={m} className="capitalize">{m}</option>))}</select></div>
          <div className="rounded-xl p-3" style={{ background: "var(--card-muted)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>For {quantity}g:</p>
            <div className="flex gap-4 mt-1 text-sm">
              <span className="font-bold tabular-nums" style={{ color: "var(--brand)" }}>{nut.calories} kcal</span>
              <span style={{ color: "var(--text-muted)" }}>P: {nut.proteinG.toFixed(1)}g</span>
              <span style={{ color: "var(--text-muted)" }}>C: {nut.carbsG.toFixed(1)}g</span>
              <span style={{ color: "var(--text-muted)" }}>F: {nut.fatG.toFixed(1)}g</span>
            </div>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full mt-4 py-3.5 rounded-[var(--radius-button)] font-semibold text-white" style={{ background: "var(--brand)", opacity: saving ? 0.5 : 1 }}>{saving ? "Saving..." : "Log This Food"}</button>
      </div>
      <p className="text-center" style={{ fontSize: "11px", color: "var(--text-muted)" }}>Nutrition data may need checking.</p>
    </div>
  );
}
