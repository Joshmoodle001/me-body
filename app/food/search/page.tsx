"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import QuickAddModal from "@/components/food/QuickAddModal";
import ServingCalculator from "@/components/food/ServingCalculator";
import { searchLocalFoods, saveFood, saveFoodLog } from "@/db/queries";
import type { DBFood } from "@/db/localDb";

interface FoodResult {
  id: string;
  name: string;
  brand?: string;
  source: string;
  unit: string;
  unitGrams: number;
  cals: number;
  p: number;
  c: number;
  f: number;
  code?: string;
  raw: DBFood;
}

type TabMode = "all" | "local" | "off" | "usda";

function round(n: number | undefined): number { return Math.round((Number(n) || 0) * 10) / 10; }

function toFoodResult(dbFood: DBFood): FoodResult {
  return {
    id: dbFood.id,
    name: dbFood.name,
    brand: dbFood.brand,
    source: dbFood.source || "Local",
    unit: dbFood.servingSizeG ? `${dbFood.servingSizeG}g` : "100g",
    unitGrams: dbFood.servingSizeG || 100,
    cals: dbFood.caloriesPer100g ?? 0,
    p: dbFood.proteinPer100g ?? 0,
    c: dbFood.carbsPer100g ?? 0,
    f: dbFood.fatPer100g ?? 0,
    code: dbFood.barcode,
    raw: dbFood,
  };
}

function offProductToResult(p: Record<string, unknown>): FoodResult | null {
  const n = (p.nutriments as Record<string, number | undefined>) || {};
  const cal = n["energy-kcal_100g"] ?? n["energy-kcal_serving"];
  if (cal === undefined || cal === null) return null;
  const code = String(p.code || "");
  const name = String(p.product_name || "Unnamed food");
  return {
    id: `off_${code}`,
    name,
    brand: String(p.brands || ""),
    source: "Open Food Facts",
    unit: "100g",
    unitGrams: 100,
    cals: round(cal),
    p: round(n.proteins_100g ?? n.proteins_serving ?? 0),
    c: round(n.carbohydrates_100g ?? n.carbohydrates_serving ?? 0),
    f: round(n.fat_100g ?? n.fat_serving ?? 0),
    code,
    raw: {
      id: `off_${code}`,
      name,
      brand: String(p.brands || ""),
      source: "open_food_facts",
      barcode: code,
      caloriesPer100g: round(cal),
      proteinPer100g: round(n.proteins_100g ?? n.proteins_serving ?? 0),
      carbsPer100g: round(n.carbohydrates_100g ?? n.carbohydrates_serving ?? 0),
      fatPer100g: round(n.fat_100g ?? n.fat_serving ?? 0),
      confidenceScore: 0.7,
      nutrientCompleteness: 0.6,
      localeMatch: 0.5,
      portionCertainty: 0.7,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "local",
    } as DBFood,
  };
}

function usdaFoodToResult(food: Record<string, unknown>): FoodResult | null {
  const nutrients: Array<Record<string, unknown>> = (food.foodNutrients as Array<Record<string, unknown>>) || [];
  const findNutrient = (names: string[]): number => {
    const match = nutrients.find((n) => names.some((name) => String(n.nutrientName || n.nutrient || "").toLowerCase().includes(name)));
    return Number((match as Record<string, unknown>)?.value || 0);
  };
  const cal = findNutrient(["energy"]);
  if (!cal) return null;
  const fid = String(food.fdcId || "0");
  return {
    id: `usda_${fid}`,
    name: String(food.description || "USDA food"),
    brand: String((food as Record<string, unknown>).brandOwner || ""),
    source: "USDA",
    unit: "100g",
    unitGrams: 100,
    cals: round(cal),
    p: round(findNutrient(["protein"])),
    c: round(findNutrient(["carbohydrate"])),
    f: round(findNutrient(["total lipid", "fat"])),
    raw: {
      id: `usda_${fid}`,
      name: String(food.description || "USDA food"),
      brand: String((food as Record<string, unknown>).brandOwner || ""),
      source: "usda",
      sourceId: fid,
      caloriesPer100g: round(cal),
      proteinPer100g: round(findNutrient(["protein"])),
      carbsPer100g: round(findNutrient(["carbohydrate"])),
      fatPer100g: round(findNutrient(["total lipid", "fat"])),
      confidenceScore: 0.85,
      nutrientCompleteness: 0.7,
      localeMatch: 0.5,
      portionCertainty: 0.8,
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "local",
    } as DBFood,
  };
}

export default function FoodSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [barcode, setBarcode] = useState("");
  const [tab, setTab] = useState<TabMode>("all");
  const [results, setResults] = useState<FoodResult[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Ready");
  const [addFood, setAddFood] = useState<FoodResult | null>(null);
  const [servingFood, setServingFood] = useState<FoodResult | null>(null);

  const searchAll = async (q: string) => {
    setLoading(true); setError(""); setStatus("Searching...");
    let all: FoodResult[] = [];

    if (tab === "all" || tab === "local") {
      try {
        const local = await searchLocalFoods(q);
        all.push(...local.map(toFoodResult));
      } catch {}
    }

    if (tab === "all" || tab === "off") {
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=12&fields=product_name,brands,code,nutriments,serving_size`;
        const res = await fetch(url);
        const data = await res.json();
        all.push(...(data.products || []).map(offProductToResult).filter(Boolean) as FoodResult[]);
      } catch {}
    }

    if (tab === "all" || tab === "usda") {
      try {
        const key = "DEMO_KEY";
        const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(q)}&pageSize=12`;
        const res = await fetch(url);
        const data = await res.json();
        all.push(...(data.foods || []).map(usdaFoodToResult).filter(Boolean) as FoodResult[]);
      } catch {}
    }

    const seen = new Set<string>();
    const deduped = all.filter((f) => {
      const key = `${f.name}|${f.brand||""}|${f.source}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 30);
    setResults(deduped);
    setStatus(deduped.length ? `${deduped.length} found` : "No results");
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    const bc = barcode.trim();
    if (!q && !bc) return;
    if (bc) {
      setLoading(true); setStatus("Barcode lookup...");
      try {
        const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(bc)}.json?fields=product_name,brands,code,nutriments,serving_size`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.product) {
          const r = offProductToResult(data.product);
          setResults(r ? [r] : []);
          setStatus(r ? "Barcode found" : "Nutrition unavailable");
        } else {
          setResults([]);
          setStatus("Not found");
        }
      } catch { setStatus("Lookup failed"); setError("Barcode lookup failed. Check internet."); }
      setLoading(false);
    } else {
      searchAll(q);
    }
  };

  const handleSave = async (f: FoodResult) => {
    const food = f.raw;
    if (savedIds.has(f.id) || savedIds.has(food.id)) return;
    try {
      const saved = await saveFood({
        source: food.source || "manual",
        sourceId: food.sourceId,
        barcode: food.barcode || f.code,
        name: food.name,
        brand: food.brand,
        servingSizeG: f.unitGrams,
        caloriesPer100g: food.caloriesPer100g || f.cals,
        proteinPer100g: food.proteinPer100g || f.p,
        carbsPer100g: food.carbsPer100g || f.c,
        fatPer100g: food.fatPer100g || f.f,
        confidenceScore: food.confidenceScore || 0.7,
        nutrientCompleteness: food.nutrientCompleteness || 0.5,
        localeMatch: food.localeMatch || 0.5,
        portionCertainty: food.portionCertainty || 0.7,
        verified: food.verified || false,
      });
      setSavedIds((prev) => new Set(prev).add(f.id).add(saved.id));
    } catch {}
  };

  const handleAddToMeal = async (mealType: string, quantityG: number, servingLabel: string) => {
    if (!addFood) return;
    try {
      const saved = await saveFood({
        source: addFood.raw.source || "manual",
        sourceId: addFood.raw.sourceId,
        barcode: addFood.code,
        name: addFood.name,
        brand: addFood.brand,
        servingSizeG: addFood.unitGrams,
        caloriesPer100g: addFood.cals,
        proteinPer100g: addFood.p,
        carbsPer100g: addFood.c,
        fatPer100g: addFood.f,
        confidenceScore: 0.7,
        nutrientCompleteness: 0.5,
        localeMatch: 0.5,
        portionCertainty: 0.7,
        verified: false,
      });
      await saveFoodLog({
        foodId: saved.id,
        mealType,
        quantityG,
        servingLabel,
        loggedAt: new Date().toISOString(),
        notes: "",
      });
    } catch {}
    setAddFood(null);
  };

  const tabs: { id: TabMode; label: string }[] = [
    { id: "all", label: "All" },
    { id: "local", label: "My Foods" },
    { id: "off", label: "Open Food Facts" },
    { id: "usda", label: "USDA" },
  ];

  return (
    <div className="app-container">
      <PageHeader title="Food Lookup" />

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2 mb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTab(t.id); setResults([]); setStatus("Ready"); }}
              className="py-1.5 px-3 rounded-xl text-xs font-bold transition-colors"
              style={{
                background: tab === t.id ? "var(--brand-soft)" : "rgba(255,255,255,0.04)",
                color: tab === t.id ? "var(--brand)" : "var(--text-muted)",
                border: `1px solid ${tab === t.id ? "var(--brand-soft)" : "var(--border)"}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="chicken breast, rice, bread..."
            className="input flex-1"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(e); }}
          />
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: "70px" }}>
            {loading ? "..." : "Search"}
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Barcode (UPC/EAN)"
            className="input flex-1"
          />
          <button type="submit" disabled={loading} className="btn btn-secondary" style={{ minWidth: "70px" }}>
            Scan
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between mb-2">
        <span className="badge badge-info text-xs">{status}</span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{savedIds.size} saved</span>
      </div>

      {loading && <LoadingState message="Searching free food sources..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && results.length === 0 && status !== "Ready" && (
        <EmptyState title="No foods found" description="Try a simpler search term or add manually." action={{ label: "Add Manually", onClick: () => router.push("/food/manual") }} />
      )}

      <div className="space-y-2 mb-4">
        {results.map((f) => (
          <div key={f.id} className="card" style={{ background: "var(--card-muted)" }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{f.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {f.brand ? `${f.brand} · ` : ""}{f.unit} · {f.cals} kcal · P {round(f.p)}g · C {round(f.c)}g · F {round(f.f)}g
                </p>
                <span className="badge mt-1 text-[10px]" style={{ background: f.source === "USDA" ? "var(--teal-soft)" : f.source === "Open Food Facts" ? "var(--gold-soft)" : "var(--brand-soft)", color: f.source === "USDA" ? "var(--teal)" : f.source === "Open Food Facts" ? "var(--gold)" : "var(--brand)" }}>
                  {f.source}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => handleSave(f)}
                  className="px-2 py-1.5 rounded-xl text-[10px] font-bold transition-colors"
                  style={{
                    background: savedIds.has(f.id) ? "var(--success-soft)" : "rgba(255,255,255,0.06)",
                    color: savedIds.has(f.id) ? "var(--success)" : "var(--text-muted)",
                    border: `1px solid ${savedIds.has(f.id) ? "var(--success-soft)" : "var(--border)"}`,
                  }}
                  disabled={savedIds.has(f.id)}
                >
                  {savedIds.has(f.id) ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => setServingFood(f)}
                  className="px-2 py-1.5 rounded-xl text-[10px] font-bold transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  Calc
                </button>
                <button
                  onClick={() => setAddFood(f)}
                  className="px-2 py-1.5 rounded-xl text-[10px] font-bold transition-colors"
                  style={{ background: "var(--brand-soft)", color: "var(--brand)", border: "1px solid var(--brand-soft)" }}
                >
                  + Meal
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {addFood && (
        <QuickAddModal
          food={{
            id: addFood.id,
            name: addFood.name,
            brand: addFood.brand,
            source: addFood.raw.source || "manual",
            servingSizeG: addFood.unitGrams,
            caloriesPer100g: addFood.cals,
            proteinPer100g: addFood.p,
            carbsPer100g: addFood.c,
            fatPer100g: addFood.f,
            confidenceScore: 0.7,
            nutrientCompleteness: 0.5,
            localeMatch: 0.5,
            portionCertainty: 0.7,
            verified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncStatus: "local",
          }}
          onClose={() => setAddFood(null)}
          onAdd={handleAddToMeal}
        />
      )}

      {servingFood && (
        <ServingCalculator
          food={{
            id: servingFood.id,
            name: servingFood.name,
            source: servingFood.raw.source || "manual",
            servingSizeG: servingFood.unitGrams,
            caloriesPer100g: servingFood.cals,
            proteinPer100g: servingFood.p,
            carbsPer100g: servingFood.c,
            fatPer100g: servingFood.f,
            confidenceScore: 0.7,
            nutrientCompleteness: 0.5,
            localeMatch: 0.5,
            portionCertainty: 0.7,
            verified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncStatus: "local",
          }}
          onClose={() => setServingFood(null)}
        />
      )}
    </div>
  );
}
