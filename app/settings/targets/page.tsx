"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import { getProfile, getTargets, saveTargets } from "@/db/queries";
import { calculateMacroTargets } from "@/lib/calculations";
import type { DBTargets } from "@/db/localDb";

export default function TargetsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState<DBTargets | null>(null);
  const [editing, setEditing] = useState<DBTargets | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      if (!p) return setLoading(false);
      const t = await getTargets(p.id);
      setTargets(t ?? null);
      setEditing(t ? { ...t } : null);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    await saveTargets({
      id: editing.id,
      profileId: editing.profileId,
      calories: editing.calories,
      proteinG: editing.proteinG,
      carbsG: editing.carbsG,
      fatG: editing.fatG,
      fiberG: editing.fiberG,
      waterMl: editing.waterMl,
      calculationMethod: "manual",
    });
    setTargets(editing);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = async () => {
    const p = await getProfile();
    if (!p) return;
    const profile = {
      name: p.name,
      sex: p.sex,
      birthYear: p.birthYear,
      heightCm: p.heightCm,
      currentWeightKg: p.currentWeightKg,
      goalWeightKg: p.goalWeightKg,
      activityLevel: p.activityLevel as "sedentary" | "light" | "moderate" | "active" | "very_active",
      goalType: p.goalType as "fat_loss" | "muscle_gain" | "maintenance" | "performance" | "habit_reset",
      trainingDaysPerWeek: p.trainingDaysPerWeek,
      dietPreference: p.dietPreference as "any" | "omnivore" | "vegetarian" | "vegan" | "pescatarian" | "keto" | "paleo",
      units: p.units as "metric" | "imperial",
    };
    const calc = calculateMacroTargets(profile);
    const newTargets = { ...calc, profileId: p.id, calculationMethod: "mifflin_st_jeor" };
    await saveTargets(newTargets);
    setTargets(newTargets as any);
    setEditing({ ...newTargets, id: targets?.id ?? "", createdAt: targets?.createdAt ?? "", updatedAt: new Date().toISOString(), syncStatus: "local" });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="min-h-screen bg-stone-50"><LoadingState /></div>;

  return (
    <div className="p-6 pb-8 max-w-md mx-auto">
      <Link href="/app/settings" className="text-green-600 text-sm font-medium mb-4 inline-block hover:underline">&larr; Back</Link>
      <h1 className="text-2xl font-bold text-stone-900 mb-4">Nutrition Targets</h1>

      {saved && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800 mb-4">Targets saved successfully.</div>}

      {editing ? (
        <div className="space-y-4">
          {[
            { id: "cal", label: "Calories (kcal/day)", key: "calories", min: 500, max: 8000 },
            { id: "prot", label: "Protein (g/day)", key: "proteinG", min: 20, max: 500 },
            { id: "carbs", label: "Carbs (g/day)", key: "carbsG", min: 0, max: 1000 },
            { id: "fat", label: "Fat (g/day)", key: "fatG", min: 10, max: 300 },
            { id: "fib", label: "Fiber (g/day)", key: "fiberG", min: 0, max: 100 },
            { id: "water", label: "Water (ml/day)", key: "waterMl", min: 500, max: 10000 },
          ].map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-sm font-medium text-stone-700 mb-1">{f.label}</label>
              <input
                id={f.id}
                type="number"
                value={(editing as any)[f.key]}
                onChange={(e) => setEditing({ ...editing, [f.key]: Number(e.target.value) })}
                min={f.min}
                max={f.max}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}

          <button onClick={handleSave} className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">Save Targets</button>
          <button onClick={handleReset} className="w-full py-3 bg-stone-100 text-stone-700 rounded-xl font-medium text-sm hover:bg-stone-200 transition-colors">Reset to Calculated</button>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-stone-500 mb-2">No targets set.</p>
          <Link href="/onboarding" className="text-green-600 font-medium hover:underline">Complete onboarding first</Link>
        </div>
      )}

      <p className="text-xs text-stone-500 text-center mt-6">Suggested starting targets. Adjust after 2–4 weeks of trend data.</p>
    </div>
  );
}
