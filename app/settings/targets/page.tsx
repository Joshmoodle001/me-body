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
  const [editing, setEditing] = useState<DBTargets | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { (async () => { const p = await getProfile(); if (!p) return setLoading(false); const t = await getTargets(p.id); setEditing(t ? { ...t } : null); setLoading(false); })(); }, []);

  const handleSave = async () => { if (!editing) return; await saveTargets({ id: editing.id, profileId: editing.profileId, calories: editing.calories, proteinG: editing.proteinG, carbsG: editing.carbsG, fatG: editing.fatG, fiberG: editing.fiberG, waterMl: editing.waterMl, calculationMethod: "manual" }); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const handleReset = async () => {
    const p = await getProfile(); if (!p) return;
    const profile = { name: p.name, sex: p.sex, birthYear: p.birthYear, heightCm: p.heightCm, currentWeightKg: p.currentWeightKg, goalWeightKg: p.goalWeightKg, activityLevel: p.activityLevel as any, goalType: p.goalType as any, trainingDaysPerWeek: p.trainingDaysPerWeek, dietPreference: p.dietPreference as any, units: p.units as any };
    const calc = calculateMacroTargets(profile);
    await saveTargets({ ...calc, profileId: p.id, calculationMethod: "mifflin_st_jeor" });
    setEditing({ ...calc, calculationMethod: "mifflin_st_jeor", id: editing?.id ?? "", profileId: p.id, createdAt: editing?.createdAt ?? "", updatedAt: new Date().toISOString(), syncStatus: "local" });
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="min-h-screen" style={{ background: "var(--background)" }}><LoadingState /></div>;

  return (
    <div className="app-container max-w-md mx-auto">
      <Link href="/app/settings" className="text-sm font-semibold mb-4 inline-block" style={{ color: "var(--brand)" }}>&larr; Back</Link>
      <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>Nutrition Targets</h1>

      {saved && <div className="card mb-4" style={{ background: "var(--success-soft)", borderColor: "var(--success-soft)" }}><p style={{ color: "var(--success)", fontSize: "14px" }}>Targets saved successfully.</p></div>}

      {editing ? (
        <div className="space-y-4">
          {[{ id: "cal", label: "Calories (kcal/day)", key: "calories" as const, min: 500, max: 8000 },{ id: "prot", label: "Protein (g/day)", key: "proteinG" as const, min: 20, max: 500 },{ id: "carbs", label: "Carbs (g/day)", key: "carbsG" as const, min: 0, max: 1000 },{ id: "fat", label: "Fat (g/day)", key: "fatG" as const, min: 10, max: 300 },{ id: "fib", label: "Fiber (g/day)", key: "fiberG" as const, min: 0, max: 100 },{ id: "water", label: "Water (ml/day)", key: "waterMl" as const, min: 500, max: 10000 }].map((f) => (
            <div key={f.id}><label className="input-label">{f.label}</label><input id={f.id} type="number" value={editing[f.key]} onChange={(e) => setEditing({ ...editing, [f.key]: Number(e.target.value) })} min={f.min} max={f.max} className="input" /></div>
          ))}
          <button onClick={handleSave} className="btn btn-primary w-full py-3.5">Save Targets</button>
          <button onClick={handleReset} className="w-full py-3 rounded-[var(--radius-button)] font-medium text-sm" style={{ background: "var(--card-muted)", color: "var(--text-secondary)" }}>Reset to Calculated</button>
        </div>
      ) : (
        <div className="text-center py-8">
          <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>No targets set.</p>
          <Link href="/onboarding" className="font-semibold" style={{ color: "var(--brand)" }}>Complete onboarding first</Link>
        </div>
      )}
      <p className="text-center mt-6" style={{ fontSize: "12px", color: "var(--text-muted)" }}>Suggested starting targets. Adjust after 2–4 weeks.</p>
    </div>
  );
}
