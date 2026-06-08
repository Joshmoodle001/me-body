"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateMacroTargets } from "@/lib/calculations";
import { saveProfile, saveTargets } from "@/db/queries";

export default function SummaryPage() {
  const router = useRouter();
  const [targets, setTargets] = useState<ReturnType<typeof calculateMacroTargets> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const profile = {
      name: sessionStorage.getItem("onboarding_name") ?? "",
      sex: (sessionStorage.getItem("onboarding_sex") ?? "male") as "male" | "female",
      birthYear: Number(sessionStorage.getItem("onboarding_birthYear")) || 1990,
      heightCm: Number(sessionStorage.getItem("onboarding_heightCm")) || 170,
      currentWeightKg: Number(sessionStorage.getItem("onboarding_currentWeightKg")) || 70,
      goalWeightKg: Number(sessionStorage.getItem("onboarding_goalWeightKg")) || 65,
      activityLevel: (sessionStorage.getItem("onboarding_activityLevel") ?? "moderate") as any,
      goalType: (sessionStorage.getItem("onboarding_goal") ?? "fat_loss") as any,
      trainingDaysPerWeek: Number(sessionStorage.getItem("onboarding_trainingDays")) || 3,
      dietPreference: (sessionStorage.getItem("onboarding_dietPreference") ?? "any") as any,
      units: "metric" as const,
    };
    setTargets(calculateMacroTargets(profile));
  }, []);

  const handleFinish = async () => {
    setSaving(true);
    const profileData = {
      name: sessionStorage.getItem("onboarding_name") ?? "",
      sex: (sessionStorage.getItem("onboarding_sex") ?? "male") as "male" | "female",
      birthYear: Number(sessionStorage.getItem("onboarding_birthYear")) || 1990,
      heightCm: Number(sessionStorage.getItem("onboarding_heightCm")) || 170,
      currentWeightKg: Number(sessionStorage.getItem("onboarding_currentWeightKg")) || 70,
      goalWeightKg: Number(sessionStorage.getItem("onboarding_goalWeightKg")) || 65,
      activityLevel: sessionStorage.getItem("onboarding_activityLevel") ?? "moderate",
      goalType: sessionStorage.getItem("onboarding_goal") ?? "fat_loss",
      trainingDaysPerWeek: Number(sessionStorage.getItem("onboarding_trainingDays")) || 3,
      dietPreference: sessionStorage.getItem("onboarding_dietPreference") ?? "any",
      units: "metric" as const,
      onboardingComplete: true as const,
    };
    const saved = await saveProfile(profileData);
    if (targets) await saveTargets({ ...targets, profileId: saved.id, calculationMethod: "mifflin_st_jeor" });
    sessionStorage.clear();
    router.push("/app/dashboard");
  };

  if (!targets) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}><p style={{ color: "var(--text-muted)" }}>Calculating targets...</p></div>;

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--background)" }}>
      <div className="max-w-md mx-auto">
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Your Suggested Targets</h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "1.5rem" }}>Starting targets based on Mifflin-St Jeor. Adjust after 2-4 weeks of trend data.</p>
        <div className="space-y-3 mb-8">
          {[{ label: "Calories", value: `${targets.calories} kcal` },{ label: "Protein", value: `${targets.proteinG}g` },{ label: "Carbs", value: `${targets.carbsG}g` },{ label: "Fat", value: `${targets.fatG}g` },{ label: "Fiber", value: `${targets.fiberG}g` },{ label: "Water", value: `${targets.waterMl}ml` }].map((item) => (
            <div key={item.label} className="card flex justify-between items-center"><p className="font-semibold" style={{ color: "var(--text-primary)" }}>{item.label}</p><span className="text-lg font-bold tabular-nums" style={{ color: "var(--brand)" }}>{item.value}</span></div>
          ))}
        </div>
        <p className="text-center mb-6" style={{ fontSize: "12px", color: "var(--text-muted)" }}>Suggested starting targets. Not medical prescriptions. Edit anytime in Settings.</p>
        <button onClick={handleFinish} disabled={saving} className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold text-white" style={{ background: "var(--brand)", opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Finish & Go to Dashboard"}</button>
      </div>
    </div>
  );
}
