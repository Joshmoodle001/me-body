"use client";

import { useState } from "react";
import type { DBFood } from "@/db/localDb";

interface ServingCalculatorProps {
  food: DBFood;
  onClose: () => void;
}

export default function ServingCalculator({ food, onClose }: ServingCalculatorProps) {
  const [servings, setServings] = useState(1);
  const [customGrams, setCustomGrams] = useState(food.servingSizeG || 100);
  const [mode, setMode] = useState<"servings" | "grams">("servings");

  const servingGrams = food.servingSizeG || 100;
  const totalGrams = mode === "servings" ? servings * servingGrams : customGrams;
  const factor = totalGrams / 100;

  const cals = Math.round((food.caloriesPer100g || 0) * factor);
  const protein = +((food.proteinPer100g || 0) * factor).toFixed(1);
  const carbs = +((food.carbsPer100g || 0) * factor).toFixed(1);
  const fat = +((food.fatPer100g || 0) * factor).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(5, 10, 8, 0.6)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-t-[var(--radius-panel)] sm:rounded-[var(--radius-panel)] bg-[var(--card)] border border-[var(--border)] p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-5 max-h-[85dvh] overflow-auto animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Serving Calculator</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: "var(--card-muted)", color: "var(--text-muted)" }} aria-label="Close">&times;</button>
        </div>

        <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{food.name}</p>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Per 100g: {food.caloriesPer100g || 0} kcal &middot; P {food.proteinPer100g || 0}g &middot; C {food.carbsPer100g || 0}g &middot; F {food.fatPer100g || 0}g</p>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode("servings")}
            className="flex-1 py-2 rounded-[var(--radius-button)] text-xs font-semibold transition-colors"
            style={{ background: mode === "servings" ? "var(--brand-soft)" : "var(--card-muted)", color: mode === "servings" ? "var(--brand)" : "var(--text-muted)", border: `1px solid ${mode === "servings" ? "var(--brand-soft)" : "var(--border)"}` }}
          >
            By servings
          </button>
          <button
            onClick={() => setMode("grams")}
            className="flex-1 py-2 rounded-[var(--radius-button)] text-xs font-semibold transition-colors"
            style={{ background: mode === "grams" ? "var(--brand-soft)" : "var(--card-muted)", color: mode === "grams" ? "var(--brand)" : "var(--text-muted)", border: `1px solid ${mode === "grams" ? "var(--brand-soft)" : "var(--border)"}` }}
          >
            By grams
          </button>
        </div>

        {mode === "servings" ? (
          <div className="mb-4">
            <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Servings ({servingGrams}g each)</label>
            <input type="number" step="0.1" min="0.1" value={servings} onChange={(e) => setServings(Number(e.target.value) || 0)} className="input mt-1" />
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Grams</label>
            <input type="number" step="1" min="1" value={customGrams} onChange={(e) => setCustomGrams(Number(e.target.value) || 0)} className="input mt-1" />
          </div>
        )}

        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>{totalGrams}g total</p>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-xl" style={{ background: "var(--gold-soft)" }}>
              <b className="block text-base" style={{ color: "var(--gold)" }}>{cals}</b>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>kcal</span>
            </div>
            <div className="text-center p-2 rounded-xl" style={{ background: "var(--teal-soft)" }}>
              <b className="block text-base" style={{ color: "var(--teal)" }}>{protein}</b>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>protein g</span>
            </div>
            <div className="text-center p-2 rounded-xl" style={{ background: "var(--sage-soft)" }}>
              <b className="block text-base" style={{ color: "var(--sage)" }}>{carbs}</b>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>carbs g</span>
            </div>
            <div className="text-center p-2 rounded-xl" style={{ background: "var(--brand-soft)" }}>
              <b className="block text-base" style={{ color: "var(--brand)" }}>{fat}</b>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>fat g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
