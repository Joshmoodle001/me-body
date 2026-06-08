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
  const params = useParams();
  const router = useRouter();
  const [food, setFood] = useState<DBFood | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(100);
  const [mealType, setMealType] = useState<MealType>("snack");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    getFoodById(id).then((f) => {
      setFood(f ?? null);
      if (f?.servingSizeG) setQuantity(f.servingSizeG);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <div className="min-h-screen bg-stone-50"><LoadingState message="Loading food..." /></div>;
  if (!food) return <div className="p-6"><ErrorState message="Food not found." onRetry={() => router.back()} /></div>;

  const nut = nutritionForQuantity(
    {
      calories: food.caloriesPer100g ?? 0,
      protein: food.proteinPer100g ?? 0,
      carbs: food.carbsPer100g ?? 0,
      fat: food.fatPer100g ?? 0,
      fiber: food.fiberPer100g ?? 0,
    },
    quantity
  );

  const handleSave = async () => {
    setSaving(true);
    await saveFoodLog({
      foodId: food.id,
      mealType,
      quantityG: quantity,
      servingLabel: quantity === food.servingSizeG ? `${food.servingSizeG}g serving` : `${quantity}g`,
      loggedAt: new Date().toISOString(),
      notes: "",
    });
    router.push("/app/log");
  };

  const confidenceLevel = food.confidenceScore >= 85 ? "bg-green-100 text-green-800" : food.confidenceScore >= 65 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";

  return (
    <div className="p-6 pb-8">
      <PageHeader title={food.name} subtitle={food.brand ?? food.source} />

      <div className="bg-white rounded-xl border border-stone-200 p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${confidenceLevel}`}>
            {food.source} · Confidence: {food.confidenceScore}/100
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {[
            { label: "Calories", value: food.caloriesPer100g, unit: "kcal" },
            { label: "Protein", value: food.proteinPer100g, unit: "g" },
            { label: "Carbs", value: food.carbsPer100g, unit: "g" },
            { label: "Fat", value: food.fatPer100g, unit: "g" },
            { label: "Fiber", value: food.fiberPer100g, unit: "g" },
            { label: "Sugar", value: food.sugarPer100g, unit: "g" },
            { label: "Sodium", value: food.sodiumPer100g, unit: "mg" },
          ].map((n) => (
            <div key={n.label} className="flex justify-between text-sm py-1 border-b border-stone-100 last:border-0">
              <span className="text-stone-500">{n.label}</span>
              <span className="font-medium text-stone-900">{n.value ?? "—"} {n.unit} <span className="text-xs text-stone-400">/100g</span></span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5 mb-4">
        <h2 className="font-semibold text-stone-900 mb-3">Log This Food</h2>

        <div className="space-y-3">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-stone-700 mb-1">Quantity (g)</label>
            <input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={1} max={10000} className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label htmlFor="mealType" className="block text-sm font-medium text-stone-700 mb-1">Meal</label>
            <select id="mealType" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)} className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
              {MEAL_TYPES.map((m) => (
                <option key={m} value={m} className="capitalize">{m}</option>
              ))}
            </select>
          </div>

          <div className="bg-stone-50 rounded-lg p-3">
            <p className="text-sm font-medium text-stone-900">For {quantity}g:</p>
            <div className="flex gap-4 mt-1 text-sm">
              <span className="text-green-700 font-semibold">{nut.calories} kcal</span>
              <span className="text-stone-600">P: {nut.proteinG.toFixed(1)}g</span>
              <span className="text-stone-600">C: {nut.carbsG.toFixed(1)}g</span>
              <span className="text-stone-600">F: {nut.fatG.toFixed(1)}g</span>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full mt-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
          {saving ? "Saving..." : "Log This Food"}
        </button>
      </div>

      <p className="text-xs text-stone-500 text-center">Nutrition data may need checking. Edit locally in a future update.</p>
    </div>
  );
}
