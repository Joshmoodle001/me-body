"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import BarcodeScanner from "@/components/scanner/BarcodeScanner";
import { lookupBarcode } from "@/lib/foodApiClient";
import { saveFood, getFoodByBarcode } from "@/db/queries";
import type { NormalizedFood } from "@/lib/foodApiServer";

export default function ScanPage() {
  const router = useRouter();
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<NormalizedFood | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const doLookup = async (barcodeVal: string) => {
    setBarcode(barcodeVal);
    setLoading(true); setError(""); setResult(null); setNotFound(false); setSaved(false);
    try {
      const cached = await getFoodByBarcode(barcodeVal.trim());
      if (cached) {
        setResult({ source: cached.source as NormalizedFood["source"], sourceId: cached.sourceId, barcode: cached.barcode, name: cached.name, brand: cached.brand, servingSizeG: cached.servingSizeG, caloriesPer100g: cached.caloriesPer100g, proteinPer100g: cached.proteinPer100g, carbsPer100g: cached.carbsPer100g, fatPer100g: cached.fatPer100g, fiberPer100g: cached.fiberPer100g, sugarPer100g: cached.sugarPer100g, sodiumPer100g: cached.sodiumPer100g, confidenceScore: cached.confidenceScore, raw: null });
        setLoading(false); return;
      }
      const res = await lookupBarcode(barcodeVal.trim());
      if ("not_found" in res) setNotFound(true); else setResult(res);
    } catch { setError("Could not look up this barcode."); }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!result) return;
    await saveFood({ source: result.source, sourceId: result.sourceId, barcode: result.barcode, name: result.name, brand: result.brand, servingSizeG: result.servingSizeG, caloriesPer100g: result.caloriesPer100g, proteinPer100g: result.proteinPer100g, carbsPer100g: result.carbsPer100g, fatPer100g: result.fatPer100g, fiberPer100g: result.fiberPer100g, sugarPer100g: result.sugarPer100g, sodiumPer100g: result.sodiumPer100g, confidenceScore: result.confidenceScore, nutrientCompleteness: 0.7, localeMatch: 0.6, portionCertainty: result.servingSizeG ? 0.8 : 0.6, verified: false, rawJson: typeof result.raw === "object" ? JSON.stringify(result.raw) : undefined });
    setSaved(true);
  };

  return (
    <div className="app-container">
      <PageHeader title="Scan Barcode" subtitle="Look up a food by its barcode" />

      {!showScanner && (
        <button onClick={() => setShowScanner(true)} className="w-full mb-4 py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--brand)" }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2m4 0v-2m-8 2v-2m4 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          Open Camera Scanner
        </button>
      )}

      {showScanner && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Camera Scanner</span>
            <button onClick={() => setShowScanner(false)} className="text-xs font-semibold" style={{ color: "var(--brand)" }}>Close Scanner</button>
          </div>
          <BarcodeScanner onScan={(code) => { doLookup(code); setShowScanner(false); }} />
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); if (barcode.trim()) doLookup(barcode); }} className="mb-6">
        <label className="input-label">Enter barcode number</label>
        <div className="flex gap-2">
          <input type="text" inputMode="numeric" value={barcode} onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 6001234567890" className="input flex-1" autoFocus />
          <button type="submit" disabled={loading || !barcode.trim()} className="px-6 py-3 rounded-[var(--radius-button)] font-semibold text-sm text-white transition-opacity" style={{ background: "var(--brand)", opacity: loading || !barcode.trim() ? 0.5 : 1 }}>Look Up</button>
        </div>
        <p className="input-helper">Data from Open Food Facts. EAN-13, EAN-8, UPC-A, UPC-E supported.</p>
      </form>

      {loading && <LoadingState message="Looking up..." />}
      {error && <ErrorState message={error} />}

      {notFound && (
        <div className="card" style={{ background: "var(--warning-soft)", borderColor: "var(--warning-soft)" }}>
          <p className="font-bold" style={{ color: "var(--warning)" }}>Not found</p>
          <p style={{ fontSize: "13px", color: "var(--warning)", marginTop: "0.25rem" }}>This barcode is not in Open Food Facts. Add it manually.</p>
          <button onClick={() => router.push(`/food/manual?barcode=${barcode}`)} className="mt-3 px-5 py-2.5 rounded-[var(--radius-button)] text-sm font-semibold" style={{ background: "var(--warning-soft)", color: "var(--warning)", border: "1px solid var(--warning)" }}>Add Manually</button>
        </div>
      )}

      {result && (
        <div className="card">
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>{result.name}</h3>
          {result.brand && <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "0.25rem" }}>{result.brand}</p>}

          <div className="mt-3 mb-4 flex flex-wrap gap-2">
            <span className="badge" style={{ background: result.confidenceScore >= 85 ? "var(--success-soft)" : result.confidenceScore >= 65 ? "var(--warning-soft)" : "var(--error-soft)", color: result.confidenceScore >= 85 ? "var(--success)" : result.confidenceScore >= 65 ? "var(--warning)" : "var(--error)" }}>
              Confidence: {result.confidenceScore}/100
            </span>
            <span className="badge badge-info">{result.source === "open_food_facts" ? "Open Food Facts" : "USDA"}</span>
          </div>

          <div className="space-y-2 mb-4">
            {[{ l: "Calories", v: result.caloriesPer100g, u: "kcal" }, { l: "Protein", v: result.proteinPer100g, u: "g" }, { l: "Carbs", v: result.carbsPer100g, u: "g" }, { l: "Fat", v: result.fatPer100g, u: "g" }, { l: "Fiber", v: result.fiberPer100g, u: "g" }].map((n) => (
              <div key={n.l} className="flex justify-between text-sm py-1" style={{ borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-secondary)" }}>{n.l}</span>
                <span className="font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{n.v ?? "—"} {n.u}</span>
              </div>
            ))}
          </div>

          {!saved ? (
            <button onClick={handleSave} className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold text-white text-sm transition-opacity" style={{ background: "var(--brand)" }}>Save & Log This Food</button>
          ) : (
            <p style={{ fontSize: "14px", color: "var(--success)", textAlign: "center" }}>Saved! Go to the food log to add it to a meal.</p>
          )}

          <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "0.75rem" }}>Nutrition data is crowdsourced and may need checking.</p>
        </div>
      )}
    </div>
  );
}
