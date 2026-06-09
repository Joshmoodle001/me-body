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
  const [servingSizeG, setServingSizeG] = useState("100");
  const [calories, setCalories] = useState("0");
  const [protein, setProtein] = useState("0");
  const [carbs, setCarbs] = useState("0");
  const [fat, setFat] = useState("0");
  const [fiber, setFiber] = useState("0");
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!name.trim()) return; setSaving(true);
    const food = await saveFood({ source: "manual", name: name.trim(), brand: brand.trim() || undefined, barcode: barcode.trim() || undefined, servingSizeG: Number(servingSizeG), caloriesPer100g: Number(calories), proteinPer100g: Number(protein), carbsPer100g: Number(carbs), fatPer100g: Number(fat), fiberPer100g: Number(fiber), confidenceScore: verified ? 80 : 50, nutrientCompleteness: 0.7, localeMatch: 0.6, portionCertainty: Number(servingSizeG) > 0 ? 0.8 : 0.6, verified });
    router.push(`/food/${food.id}`);
  };

  return (
    <div className="app-container">
      <PageHeader title="Add Food" subtitle="Enter nutrition per 100g" />
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div><label className="input-label">Name *</label><input id="fname" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Homemade chicken salad" className="input" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="input-label">Brand</label><input id="fbrand" type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Optional" className="input" /></div>
          <div><label className="input-label">Barcode</label><input id="fbarcode" type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Optional" className="input" /></div>
        </div>
        <div><label className="input-label">Serving Size (g)</label><input id="fserving" type="text" inputMode="numeric" value={servingSizeG} onChange={(e) => setServingSizeG(e.target.value.replace(/\D/g,""))} className="input" /></div>
        <fieldset><legend className="input-label">Per 100g</legend>
          <div className="grid grid-cols-2 gap-3">
            {[{ id: "fcal", label: "Calories (kcal)", value: calories, set: setCalories },{ id: "fprot", label: "Protein (g)", value: protein, set: setProtein },{ id: "fcarbs", label: "Carbs (g)", value: carbs, set: setCarbs },{ id: "ffat", label: "Fat (g)", value: fat, set: setFat },{ id: "ffiber", label: "Fiber (g)", value: fiber, set: setFiber }].map((f) => (
              <div key={f.id}><label htmlFor={f.id} className="text-xs" style={{ color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>{f.label}</label><input id={f.id} type="text" inputMode="numeric" value={f.value} onChange={(e) => f.set(e.target.value.replace(/\D/g,""))} className="input" /></div>
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="w-5 h-5 rounded border-[var(--border)]" style={{ accentColor: "var(--brand)" }} /><span className="text-sm" style={{ color: "var(--text-secondary)" }}>I trust this nutrition data</span></label>
        <button type="submit" disabled={saving || !name.trim()} className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold text-white" style={{ background: name.trim() ? "var(--brand)" : "var(--border)", opacity: name.trim() ? 1 : 0.5 }}>{saving ? "Saving..." : "Save Food"}</button>
      </form>
    </div>
  );
}

export default function ManualFoodPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}><p style={{ color: "var(--text-muted)" }}>Loading...</p></div>}><ManualFoodForm /></Suspense>;
}
