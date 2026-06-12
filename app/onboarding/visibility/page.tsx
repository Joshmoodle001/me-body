"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VisibilityPage() {
  const router = useRouter();
  const [visibility, setVisibility] = useState<"visible" | "hidden">("visible");

  const handleNext = () => {
    sessionStorage.setItem("onboarding_calorieVisibility", visibility);
    router.push("/onboarding/summary");
  };

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--background)" }}>
      <div className="max-w-md mx-auto">
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>How you want to see things</h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Choose how numbers appear in your tracking. You can change this anytime in Settings.
        </p>

        <div className="space-y-3 mb-8">
          <button onClick={() => setVisibility("visible")} className="w-full text-left p-4 rounded-[var(--radius-card)] border-2 transition-all"
            style={{ borderColor: visibility === "visible" ? "var(--brand)" : "var(--border)", background: visibility === "visible" ? "var(--brand-soft)" : "var(--card)" }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0 mt-0.5">&#128202;</span>
              <div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Show all numbers</p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  Calories, macros, and goals are visible. Best if you want precise tracking.
                </p>
              </div>
            </div>
          </button>

          <button onClick={() => setVisibility("hidden")} className="w-full text-left p-4 rounded-[var(--radius-card)] border-2 transition-all"
            style={{ borderColor: visibility === "hidden" ? "var(--brand)" : "var(--border)", background: visibility === "hidden" ? "var(--brand-soft)" : "var(--card)" }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0 mt-0.5">&#127793;</span>
              <div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Calorie-hidden mode</p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  Focus on meal balance, food quality, habits, and how you feel — without calorie or macro numbers. Progress bars show relative fullness instead of exact targets.
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="card mb-6" style={{ background: "var(--card-muted)" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Some people prefer to step away from numbers for a healthier relationship with food and body. Both modes give you the same coaching quality — just presented differently.
          </p>
        </div>

        <button onClick={handleNext}
          className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold text-white" style={{ background: "var(--brand)" }}>
          Next
        </button>
      </div>
    </div>
  );
}
