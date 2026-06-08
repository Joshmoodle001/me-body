"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const local = await searchLocalFoods(query.trim());
      setLocalResults(local);
    } catch { setLocalResults([]); }

    try {
      const usda = await searchUsda(query.trim());
      setUsdaResults(usda);
    } catch {
      setError("USDA search is currently unavailable. Try again later or use manual entry.");
      setUsdaResults([]);
    }

    setLoading(false);
  };

  const handleSelectFood = async (food: NormalizedFood | DBFood) => {
    const { saveFood } = await import("@/db/queries");
    let saved: DBFood;

    if ("source" in food && "confidenceScore" in food) {
      const nf = food as NormalizedFood;
      saved = await saveFood({
        source: nf.source,
        sourceId: nf.sourceId,
        barcode: nf.barcode,
        name: nf.name,
        brand: nf.brand,
        servingSizeG: nf.servingSizeG,
        caloriesPer100g: nf.caloriesPer100g,
        proteinPer100g: nf.proteinPer100g,
        carbsPer100g: nf.carbsPer100g,
        fatPer100g: nf.fatPer100g,
        fiberPer100g: nf.fiberPer100g,
        sugarPer100g: nf.sugarPer100g,
        sodiumPer100g: nf.sodiumPer100g,
        confidenceScore: nf.confidenceScore,
        verified: false,
      });
    } else {
      saved = food as DBFood;
    }

    router.push(`/food/${saved.id}`);
  };

  return (
    <div className="p-6 pb-8">
      <PageHeader title="Search Food" />

      <form onSubmit={handleSearch} className="mb-6">
        <label htmlFor="food-search" className="block text-sm font-medium text-stone-700 mb-1">Search foods</label>
        <div className="flex gap-2">
          <input id="food-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. banana, chicken breast..." className="flex-1 px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" autoFocus />
          <button type="submit" disabled={loading || !query.trim()} className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors">Search</button>
        </div>
      </form>

      {loading && <LoadingState message="Searching..." />}
      {error && <ErrorState message={error} />}

      {searched && !loading && localResults.length === 0 && usdaResults.length === 0 && (
        <EmptyState
          title="No foods found"
          description={`No results for "${query}". Try a different search term or add it manually.`}
          action={{ label: "Add Manually", onClick: () => router.push("/food/manual") }}
        />
      )}

      {localResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-stone-500 uppercase mb-2">Your Foods</h2>
          <div className="space-y-2">
            {localResults.map((food) => (
              <button key={food.id} onClick={() => router.push(`/food/${food.id}`)} className="w-full text-left bg-white rounded-xl p-4 border border-stone-200 hover:shadow-sm transition-shadow">
                <p className="font-medium text-stone-900">{food.name}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-stone-500">{food.caloriesPer100g ?? "?"} kcal/100g</span>
                  <span className="text-xs text-stone-400 capitalize">Local</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {usdaResults.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-stone-500 uppercase mb-2">USDA Database</h2>
          <div className="space-y-2">
            {usdaResults.map((food) => (
              <button key={food.sourceId ?? food.name} onClick={() => handleSelectFood(food)} className="w-full text-left bg-white rounded-xl p-4 border border-stone-200 hover:shadow-sm transition-shadow">
                <p className="font-medium text-stone-900">{food.name}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-stone-500">{food.caloriesPer100g ?? "?"} kcal/100g</span>
                  <span className="text-xs text-stone-400">USDA</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
