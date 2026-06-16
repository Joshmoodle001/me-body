"use client";

import { useState } from "react";
import Link from "next/link";
import { exportAllData, downloadJSON, importJSONData } from "@/db/exportData";
import { clearAllData } from "@/db/queries";
import { validateMealPlan, CUT65_PLAN } from "@/lib/mealPlanTemplate";
import { importMealPlan, clearMealPlan, getActiveMealPlan } from "@/lib/mealPlanImporter";
import PageHeader from "@/components/ui/PageHeader";

function csvToMealPlan(foodsCsv: string, mealsCsv: string, planName: string, startDate: string, totalDays: number) {
  const foods = foodsCsv.split("\n").slice(1).filter(r => r.trim()).map(row => {
    const [name, brand, servingSizeG, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g] = row.split(",").map(s => s.trim());
    return { name, brand: brand || undefined, source: "Uploaded Plan", servingSizeG: Number(servingSizeG) || 100, caloriesPer100g: Number(caloriesPer100g) || 0, proteinPer100g: Number(proteinPer100g) || 0, carbsPer100g: Number(carbsPer100g) || 0, fatPer100g: Number(fatPer100g) || 0 };
  });
  const mealMap = new Map<string, { name: string; time?: string; foods: { foodName: string; quantityG: number; notes?: string }[] }>();
  mealsCsv.split("\n").slice(1).filter(r => r.trim()).forEach(row => {
    const [mealName, mealTime, foodName, quantityG, notes] = row.split(",").map(s => s.trim());
    if (!mealMap.has(mealName)) mealMap.set(mealName, { name: mealName, time: mealTime || undefined, foods: [] });
    mealMap.get(mealName)!.foods.push({ foodName, quantityG: Number(quantityG) || 0, notes: notes || undefined });
  });
  return { schema: "mebody.mealplan.v1" as const, name: planName, startDate, totalDays, dayType: "both" as const, waterTargetMl: 3000, foods, meals: Array.from(mealMap.values()) };
}

export default function DataSettingsPage() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("success");
  const [importing, setImporting] = useState(false);
  const [activePlan, setActivePlan] = useState<ReturnType<typeof getActiveMealPlan>>(() => getActiveMealPlan());

  const show = (msg: string, type: "success" | "error" | "info" = "success") => { setMessage(msg); setMessageType(type); };

  const handleExport = async () => { try { const data = await exportAllData(); downloadJSON(data, `me-body-export-${new Date().toISOString().slice(0,10)}.json`); show("Export downloaded."); } catch { show("Failed to export.", "error"); } };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setImporting(true);
    try { show((await importJSONData(await file.text())).message); } catch { show("Failed to import.", "error"); }
    setImporting(false);
  };

  const handleMealPlanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setImporting(true);
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const validation = validateMealPlan(parsed);
      if (!validation.valid || !validation.plan) {
        show(validation.error || "Invalid meal plan format.", "error");
        setImporting(false);
        return;
      }
      const result = await importMealPlan(validation.plan);
      if (result.error) show(`Partial import: ${result.foods} foods, ${result.meals} meals. ${result.error}`, "info");
      else show(`Meal plan imported: ${result.foods} foods, ${result.meals} meals logged for today.`, "success");
      setActivePlan(getActiveMealPlan());
    } catch {
      show("Failed to parse meal plan JSON.", "error");
    }
    setImporting(false);
  };

  const handleLoadCut65 = async () => {
    setImporting(true);
    try {
      const result = await importMealPlan(CUT65_PLAN);
      show(`Cut65 plan loaded: ${result.foods} foods, ${result.meals} meals logged for today.`, "success");
      setActivePlan(getActiveMealPlan());
    } catch {
      show("Failed to load Cut65 plan.", "error");
    }
    setImporting(false);
  };

  const handleClear = async () => {
    if (window.confirm("Delete ALL local data? This cannot be undone.")) { await clearAllData(); window.location.href = "/onboarding"; }
  };

  const bgColor = messageType === "error" ? "var(--error-soft)" : messageType === "info" ? "var(--info-soft)" : "var(--brand-soft)";
  const txtColor = messageType === "error" ? "var(--error)" : messageType === "info" ? "var(--info)" : "var(--brand-dark)";

  return (
    <div className="app-container max-w-md mx-auto">
      <Link href="/app/settings" className="text-sm font-semibold mb-4 inline-block" style={{ color: "var(--brand)" }}>&larr; Back</Link>
      <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>Data Management</h1>

      {message && (
        <div className="card mb-4" style={{ background: bgColor, borderColor: bgColor }}>
          <p style={{ color: txtColor, fontSize: "14px" }}>{message}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Meal Plan Upload */}
        <div className="card neon-card-teal" style={{ background: "var(--card-muted)" }}>
          <h2 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>Upload Meal Plan</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
            Import a meal plan to pre-load foods and daily meals. Use JSON or CSV templates.
          </p>

          {activePlan && (
            <div className="mb-3 p-2.5 rounded-xl text-xs" style={{ background: "var(--teal-soft)", color: "var(--teal)" }}>
              Active: <b>{activePlan.name}</b> — imported {new Date(activePlan.importedAt).toLocaleDateString()} ({activePlan.totalDays} days from {activePlan.startDate})
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-3">
            <label className="block py-3 rounded-[var(--radius-button)] text-center text-xs font-semibold cursor-pointer transition-colors" style={{ border: "2px dashed var(--border-strong)", color: "var(--text-secondary)", background: "var(--card)" }}>
              {importing ? "Importing..." : "Upload JSON"}
              <input type="file" accept=".json" onChange={handleMealPlanUpload} className="hidden" />
            </label>
            <button onClick={handleLoadCut65} disabled={importing} className="py-3 rounded-[var(--radius-button)] text-xs font-semibold transition-colors" style={{ background: "var(--teal-soft)", color: "var(--teal)", border: "1px solid rgba(45,212,191,0.25)" }}>
              Load Cut65 Plan
            </button>
          </div>

          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Download templates to fill in:</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <a href="/templates/foods-template.csv" download className="text-center py-2 rounded-xl text-[10px] font-bold transition-colors" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", border: "1px solid var(--border)", textDecoration: "none" }}>
              Foods CSV
            </a>
            <a href="/templates/meals-template.csv" download className="text-center py-2 rounded-xl text-[10px] font-bold transition-colors" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", border: "1px solid var(--border)", textDecoration: "none" }}>
              Meals CSV
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); const blob = new Blob([JSON.stringify(CUT65_PLAN, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "cut65-plan.json"; a.click(); URL.revokeObjectURL(url); }} className="text-center py-2 rounded-xl text-[10px] font-bold transition-colors" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", border: "1px solid var(--border)", textDecoration: "none" }}>
              JSON template
            </a>
          </div>

          {activePlan && (
            <button onClick={async () => { await clearMealPlan(); setActivePlan(null); show("Meal plan cleared."); }} className="w-full py-2 rounded-xl text-xs font-semibold" style={{ background: "var(--error-soft)", color: "var(--error)" }}>
              Clear Active Plan
            </button>
          )}

        </div>

        <div className="card">
          <h2 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>Export All Data</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Download all your local data as a JSON file for backup.</p>
          <button onClick={handleExport} className="btn btn-primary w-full py-3">Export JSON</button>
        </div>

        <div className="card">
          <h2 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>Import Data</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Restore from a previous Me Body export file.</p>
          <label className="block w-full py-3 rounded-[var(--radius-button)] text-center text-sm font-semibold cursor-pointer transition-colors" style={{ border: "2px dashed var(--border)", color: "var(--text-secondary)", background: "var(--card-muted)" }}>
            {importing ? "Importing..." : "Choose JSON File"}
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        <div className="card" style={{ background: "var(--error-soft)", borderColor: "var(--error-soft)" }}>
          <h2 className="font-bold mb-1" style={{ color: "var(--error)" }}>Delete All Data</h2>
          <p style={{ fontSize: "13px", color: "var(--error)", marginBottom: "0.75rem", opacity: 0.8 }}>Permanently removes all your local data.</p>
          <button onClick={handleClear} className="w-full py-3 rounded-[var(--radius-button)] font-semibold text-sm" style={{ background: "var(--error)", color: "white" }}>Delete All Data</button>
        </div>
      </div>
    </div>
  );
}
