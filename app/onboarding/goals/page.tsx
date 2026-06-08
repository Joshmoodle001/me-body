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
    <div className="min-h-screen p-6 bg-stone-50">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">What is your goal?</h1>
        <div className="space-y-3 mb-8">
          {GOAL_TYPES.map((goal) => {
            const info = GOAL_LABELS[goal];
            const isSelected = selected === goal;
            return (
              <button
                key={goal}
                onClick={() => setSelected(goal)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${isSelected ? "border-green-600 bg-green-50" : "border-stone-200 bg-white hover:border-stone-300"}`}
                aria-pressed={isSelected}
              >
                <p className="font-semibold text-stone-900">{info.label}</p>
                <p className="text-sm text-stone-500 mt-0.5">{info.desc}</p>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => {
            sessionStorage.setItem("onboarding_goal", selected);
            router.push("/onboarding/body");
          }}
          className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
