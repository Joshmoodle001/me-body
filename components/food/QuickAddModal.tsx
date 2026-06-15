"use client";

import { useState } from "react";
import { MEAL_TYPES } from "@/lib/constants";
import type { DBFood } from "@/db/localDb";

interface QuickAddModalProps {
  food: DBFood;
  onClose: () => void;
  onAdd: (mealType: string, quantityG: number, servingLabel: string) => void;
}

export default function QuickAddModal({ food, onClose, onAdd }: QuickAddModalProps) {
  const [mealType, setMealType] = useState("lunch");
  const [qty, setQty] = useState(1);

  const servingGrams = food.servingSizeG || 100;
  const cals = Math.round((food.caloriesPer100g || 0) * (qty * servingGrams / 100));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(5, 10, 8, 0.6)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm rounded-t-[var(--radius-panel)] sm:rounded-[var(--radius-panel)] bg-[var(--card)] border border-[var(--border)] p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Add to Meal</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: "var(--card-muted)", color: "var(--text-muted)" }}>&times;</button>
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{food.name}</p>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>{servingGrams}g per serving &middot; {food.caloriesPer100g || 0} kcal/100g</p>

        <div className="mb-3">
          <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Meal Type</label>
          <select className="input mt-1" value={mealType} onChange={(e) => setMealType(e.target.value)}>
            {MEAL_TYPES.map((m) => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Quantity (servings)</label>
          <input type="number" step="0.25" min="0.25" value={qty} onChange={(e) => setQty(Number(e.target.value) || 0)} className="input mt-1" />
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>&asymp;{qty * servingGrams}g &middot; {cals} kcal</p>
        </div>
        <button onClick={() => onAdd(mealType, qty * servingGrams, `${qty} serving${qty !== 1 ? "s" : ""}`)} className="btn btn-primary w-full">Add Food</button>
      </div>
    </div>
  );
}
