"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
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

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setNotFound(false);
    setSaved(false);

    try {
      // Check local cache first
      const cached = await getFoodByBarcode(barcode.trim());
      if (cached) {
        setResult({
          source: cached.source as NormalizedFood["source"],
          sourceId: cached.sourceId,
          barcode: cached.barcode,
          name: cached.name,
          brand: cached.brand,
          servingSizeG: cached.servingSizeG,
          caloriesPer100g: cached.caloriesPer100g,
          proteinPer100g: cached.proteinPer100g,
          carbsPer100g: cached.carbsPer100g,
          fatPer100g: cached.fatPer100g,
          fiberPer100g: cached.fiberPer100g,
          sugarPer100g: cached.sugarPer100g,
          sodiumPer100g: cached.sodiumPer100g,
          confidenceScore: cached.confidenceScore,
          raw: null,
        });
        setLoading(false);
        return;
      }

      const res = await lookupBarcode(barcode.trim());
      if ("not_found" in res) {
        setNotFound(true);
      } else {
        setResult(res);
      }
    } catch {
      setError("Could not look up this barcode. Check your connection or try manual entry.");
    }
    setLoading(false);
  };

  const handleSaveAndLog = async () => {
    if (!result) return;
    await saveFood({
      source: result.source,
      sourceId: result.sourceId,
      barcode: result.barcode,
      name: result.name,
      brand: result.brand,
      servingSizeG: result.servingSizeG,
      caloriesPer100g: result.caloriesPer100g,
      proteinPer100g: result.proteinPer100g,
      carbsPer100g: result.carbsPer100g,
      fatPer100g: result.fatPer100g,
      fiberPer100g: result.fiberPer100g,
      sugarPer100g: result.sugarPer100g,
      sodiumPer100g: result.sodiumPer100g,
      confidenceScore: result.confidenceScore,
      verified: false,
      rawJson: typeof result.raw === "object" ? JSON.stringify(result.raw) : undefined,
    });
    setSaved(true);
  };

  const handleLogFood = () => {
    if (!result) return;
    router.push(`/food/manual?barcode=${result.barcode ?? ""}&name=${encodeURIComponent(result.name)}`);
  };

  return (
    <div className="p-6 pb-8">
      <PageHeader title="Scan Barcode" subtitle="Look up a food by its barcode" />

      <form onSubmit={handleBarcodeSubmit} className="mb-6">
        <label htmlFor="barcode-input" className="block text-sm font-medium text-stone-700 mb-1">Enter barcode number</label>
        <div className="flex gap-2">
          <input
            id="barcode-input"
            type="text"
            inputMode="numeric"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 6001234567890"
            className="flex-1 px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            autoFocus
          />
          <button type="submit" disabled={loading || !barcode.trim()} className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors">
            Look Up
          </button>
        </div>
        <p className="text-xs text-stone-500 mt-2">Supported: EAN-13, EAN-8, UPC-A, UPC-E. Data from Open Food Facts.</p>
      </form>

      {loading && <LoadingState message="Looking up barcode..." />}

      {error && <ErrorState message={error} onRetry={() => handleBarcodeSubmit(new Event("submit") as any)} />}

      {notFound && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-amber-800 font-medium">Barcode not found</p>
          <p className="text-amber-700 text-sm mt-1">This barcode is not in the Open Food Facts database. You can add this food manually.</p>
          <button onClick={handleLogFood} className="mt-3 px-5 py-2.5 bg-amber-100 text-amber-800 rounded-xl font-medium text-sm hover:bg-amber-200 transition-colors">Add Manually</button>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-lg text-stone-900 mb-2">{result.name}</h2>
          {result.brand && <p className="text-sm text-stone-500 mb-3">{result.brand}</p>}

          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-4 ${result.confidenceScore >= 85 ? "bg-green-100 text-green-800" : result.confidenceScore >= 65 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
            Confidence: {result.confidenceScore}/100
          </div>

          <div className="space-y-2 mb-4">
            {[
              { label: "Calories", value: result.caloriesPer100g, unit: "kcal" },
              { label: "Protein", value: result.proteinPer100g, unit: "g" },
              { label: "Carbs", value: result.carbsPer100g, unit: "g" },
              { label: "Fat", value: result.fatPer100g, unit: "g" },
              { label: "Fiber", value: result.fiberPer100g, unit: "g" },
            ].map((n) => (
              <div key={n.label} className="flex justify-between text-sm">
                <span className="text-stone-500">{n.label}</span>
                <span className="font-medium text-stone-900">{n.value ?? "—"} {n.unit}</span>
              </div>
            ))}
          </div>

          {!saved ? (
            <button onClick={handleSaveAndLog} className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors mb-2">Save & Log This Food</button>
          ) : (
            <p className="text-green-700 text-sm text-center mb-2">Food saved! Go to the food log to add it to a meal.</p>
          )}
          <p className="text-xs text-stone-500 text-center">Nutrition data is crowdsourced and may need checking. Source: {result.source === "open_food_facts" ? "Open Food Facts" : "USDA"}.</p>
        </div>
      )}
    </div>
  );
}
