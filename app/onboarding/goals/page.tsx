"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GOAL_TYPES, type GoalType } from "@/lib/constants";

const GOAL_LABELS: Record<GoalType, { label: string; desc: string }> = {
  fat_loss: { label: "Fat Loss", desc: "Reduce body fat while preserving muscle." },
  muscle_gain: { label: "Muscle Gain", desc: "Build lean muscle with a small surplus." },
  maintenance: { label: "Maintenance", desc: "Stay where you are and build consistency." },
  performance: { label: "Performance", desc: "Fuel training and recovery." },
  habit_reset: { label: "Habit Reset", desc: "Focus on awareness and logging." },
};

export default function GoalsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<GoalType>("fat_loss");

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--background)" }}>
      <div className="max-w-md mx-auto">
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>What is your goal?</h1>
        <div className="space-y-3 mb-8">
          {GOAL_TYPES.map((goal) => {
            const isSelected = selected === goal;
            return (
              <button key={goal} onClick={() => setSelected(goal)} className="w-full text-left p-4 rounded-[var(--radius-card)] border-2 transition-all"
                style={{ borderColor: isSelected ? "var(--brand)" : "var(--border)", background: isSelected ? "var(--brand-soft)" : "var(--card)" }} aria-pressed={isSelected}>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{GOAL_LABELS[goal].label}</p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "0.25rem" }}>{GOAL_LABELS[goal].desc}</p>
              </button>
            );
          })}
        </div>
        <button onClick={() => { sessionStorage.setItem("onboarding_goal", selected); router.push("/onboarding/body"); }}
          className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold text-white" style={{ background: "var(--brand)" }}>Next</button>
      </div>
    </div>
  );
}
