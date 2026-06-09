"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { searchLocalFoods } from "@/db/queries";
import { searchUsda } from "@/lib/foodApiClient";
import type { NormalizedFood } from "@/lib/foodApiServer";
import type { DBFood } from "@/db/localDb";

export default function FoodSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState<DBFood[]>([]);
  const [usdaResults, setUsdaResults] = useState<NormalizedFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); if (!query.trim()) return;
    setLoading(true); setError(""); setSearched(true);
    try { setLocalResults(await searchLocalFoods(query.trim())); } catch { setLocalResults([]); }
    try { setUsdaResults(await searchUsda(query.trim())); } catch { setError("USDA search unavailable. Try manual entry."); setUsdaResults([]); }
    setLoading(false);
  };

  const handleSelectFood = async (food: NormalizedFood | DBFood) => {
    const { saveFood } = await import("@/db/queries");
    let saved: DBFood;
    if ("source" in food && "confidenceScore" in food) {
      const nf = food as NormalizedFood;
      saved = await saveFood({ source: nf.source, sourceId: nf.sourceId, barcode: nf.barcode, name: nf.name, brand: nf.brand, servingSizeG: nf.servingSizeG, caloriesPer100g: nf.caloriesPer100g, proteinPer100g: nf.proteinPer100g, carbsPer100g: nf.carbsPer100g, fatPer100g: nf.fatPer100g, fiberPer100g: nf.fiberPer100g, sugarPer100g: nf.sugarPer100g, sodiumPer100g: nf.sodiumPer100g, confidenceScore: nf.confidenceScore, nutrientCompleteness: 0.7, localeMatch: 0.6, portionCertainty: nf.servingSizeG ? 0.8 : 0.6, verified: false });
    } else { saved = food as DBFood; }
    router.push(`/food/${saved.id}`);
  };

  return (
    <div className="app-container">
      <PageHeader title="Search Food" />
      <form onSubmit={handleSearch} className="mb-6">
        <label className="input-label">Search foods</label>
        <div className="flex gap-2">
          <input id="food-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. banana, chicken breast..." className="input flex-1" autoFocus />
          <button type="submit" disabled={loading || !query.trim()} className="px-6 py-3 rounded-[var(--radius-button)] font-semibold text-sm text-white" style={{ background: "var(--brand)", opacity: loading || !query.trim() ? 0.5 : 1 }}>Search</button>
        </div>
      </form>

      {loading && <LoadingState message="Searching..." />}
      {error && <ErrorState message={error} />}

      {searched && !loading && localResults.length === 0 && usdaResults.length === 0 && (
        <EmptyState title="No foods found" description={`No results for "${query}". Try a different search or add it manually.`} action={{ label: "Add Manually", onClick: () => router.push("/food/manual") }} />
      )}

      {localResults.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>Your Foods</p>
          <div className="space-y-2">
            {localResults.map((food) => (
              <button key={food.id} onClick={() => router.push(`/food/${food.id}`)} className="card-interactive card w-full text-left">
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{food.name}</p>
                <div className="flex justify-between mt-1"><span className="text-xs" style={{ color: "var(--text-muted)" }}>{food.caloriesPer100g ?? "?"} kcal/100g</span><span className="text-xs" style={{ color: "var(--text-muted)" }}>Local</span></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {usdaResults.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>USDA Database</p>
          <div className="space-y-2">
            {usdaResults.map((food) => (
              <button key={food.sourceId ?? food.name} onClick={() => handleSelectFood(food)} className="card-interactive card w-full text-left">
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{food.name}</p>
                <div className="flex justify-between mt-1"><span className="text-xs" style={{ color: "var(--text-muted)" }}>{food.caloriesPer100g ?? "?"} kcal/100g</span><span className="text-xs" style={{ color: "var(--text-muted)" }}>USDA</span></div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
