"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { saveFood } from "@/db/queries";

function ManualFoodForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState(searchParams.get("name") ?? "");
  const [brand, setBrand] = useState("");
  const [barcode, setBarcode] = useState(searchParams.get("barcode") ?? "");
  const [servingSizeG, setServingSizeG] = useState(100);
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [fiber, setFiber] = useState(0);
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const food = await saveFood({
      source: "manual",
      name: name.trim(),
      brand: brand.trim() || undefined,
      barcode: barcode.trim() || undefined,
      servingSizeG,
      caloriesPer100g: calories,
      proteinPer100g: protein,
      carbsPer100g: carbs,
      fatPer100g: fat,
      fiberPer100g: fiber,
      confidenceScore: verified ? 80 : 50,
      verified,
    });

    router.push(`/food/${food.id}`);
  };

  return (
    <div className="p-6 pb-8">
      <PageHeader title="Add Food" subtitle="Enter nutrition per 100g" />

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="fname" className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
          <input id="fname" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Homemade chicken salad" className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="fbrand" className="block text-sm font-medium text-stone-700 mb-1">Brand</label>
            <input id="fbrand" type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Optional" className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label htmlFor="fbarcode" className="block text-sm font-medium text-stone-700 mb-1">Barcode</label>
            <input id="fbarcode" type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Optional" className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>

        <div>
          <label htmlFor="fserving" className="block text-sm font-medium text-stone-700 mb-1">Serving Size (g)</label>
          <input id="fserving" type="number" value={servingSizeG} onChange={(e) => setServingSizeG(Number(e.target.value))} min={1} className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-stone-700 mb-2">Per 100g</legend>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "fcal", label: "Calories (kcal)", value: calories, set: setCalories },
              { id: "fprot", label: "Protein (g)", value: protein, set: setProtein },
              { id: "fcarbs", label: "Carbs (g)", value: carbs, set: setCarbs },
              { id: "ffat", label: "Fat (g)", value: fat, set: setFat },
              { id: "ffiber", label: "Fiber (g)", value: fiber, set: setFiber },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-xs text-stone-500 mb-1">{f.label}</label>
                <input id={f.id} type="number" value={f.value} onChange={(e) => f.set(Number(e.target.value))} min={0} className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="w-5 h-5 rounded border-stone-300 text-green-600 focus:ring-green-500" />
          <span className="text-sm text-stone-700">I trust this nutrition data</span>
        </label>

        <button type="submit" disabled={saving || !name.trim()} className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-stone-300 transition-colors">
          {saving ? "Saving..." : "Save Food"}
        </button>
      </form>
    </div>
  );
}

export default function ManualFoodPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center"><p className="text-stone-500">Loading...</p></div>}>
      <ManualFoodForm />
    </Suspense>
  );
}
