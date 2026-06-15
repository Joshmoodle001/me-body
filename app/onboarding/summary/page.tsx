"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateMacroTargets } from "@/lib/calculations";
import { saveProfile, saveTargets } from "@/db/queries";

export default function SummaryPage() {
  const router = useRouter();
  const [targets, setTargets] = useState<ReturnType<typeof calculateMacroTargets> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
      calorieVisibility: "visible" as const,
      cycleTracking: false,
      pregnancyStatus: "none" as const,
      chronicConditions: [] as string[],
      medications: [] as string[],
    };
    setTargets(calculateMacroTargets(profile));
  }, []);

  const handleFinish = async () => {
    setSaving(true); setError(null);
    try {
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
        calorieVisibility: (sessionStorage.getItem("onboarding_calorieVisibility") ?? "visible") as "visible" | "hidden",
        cycleTracking: sessionStorage.getItem("onboarding_cycleTracking") === "true",
        pregnancyStatus: (sessionStorage.getItem("onboarding_pregnancyStatus") ?? "none") as any,
        chronicConditions: JSON.parse(sessionStorage.getItem("onboarding_chronicConditions") ?? "[]") as string[],
        medications: JSON.parse(sessionStorage.getItem("onboarding_medications") ?? "[]") as string[],
        dayType: "training" as const,
      };
      const savedProfile = await saveProfile(profileData);
      if (targets) await saveTargets({ ...targets, profileId: savedProfile.id, calculationMethod: "mifflin_st_jeor" });
      sessionStorage.clear();
      setSaved(true);
      setTimeout(() => { router.push("/app/dashboard"); }, 1200);
    } catch (e: any) { setError(e?.message ?? "Could not save. Please try again."); setSaving(false); }
  };

  if (!targets) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}><p style={{ color: "var(--text-muted)" }}>Calculating targets...</p></div>;

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--background)" }}>
      <div className="max-w-md mx-auto">
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Your Suggested Targets</h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "1.5rem" }}>Starting targets based on Mifflin-St Jeor. Adjust after 2-4 weeks.</p>
        <div className="space-y-3 mb-8">
          {[{ label: "Calories", value: `${targets.calories} kcal` },{ label: "Protein", value: `${targets.proteinG}g` },{ label: "Carbs", value: `${targets.carbsG}g` },{ label: "Fat", value: `${targets.fatG}g` },{ label: "Fiber", value: `${targets.fiberG}g` },{ label: "Water", value: `${targets.waterMl}ml` }].map((item) => (
            <div key={item.label} className="card flex justify-between items-center" style={{ background: "var(--card-muted)" }}>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{item.label}</p>
              <span className="text-lg font-bold tabular-nums" style={{ color: "var(--gold)" }}>{item.value}</span>
            </div>
          ))}
        </div>
        <p className="text-center mb-6" style={{ fontSize: "12px", color: "var(--text-muted)" }}>Suggested starting targets. Not medical prescriptions. Edit anytime in Settings.</p>
        {saved && (
          <div className="card mb-4 animate-fade-in" style={{ background: "var(--success-soft)", borderColor: "rgba(45,212,191,0.25)" }}>
            <p style={{ color: "var(--success)", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>Profile saved successfully. Redirecting...</p>
          </div>
        )}
        <button onClick={handleFinish} disabled={saving || saved} className="btn btn-primary w-full" style={{ opacity: saving ? 0.7 : 1 }}>{saved ? "\u2713 Profile Saved!" : saving ? "Saving..." : "Finish & Go to Dashboard"}</button>
        {error && (
          <div className="card mt-3" style={{ background: "var(--error-soft)", borderColor: "rgba(255,107,107,0.25)" }}>
            <p style={{ color: "var(--error)", fontSize: "14px" }}>{error}</p>
            <button onClick={handleFinish} className="mt-2 font-semibold text-sm" style={{ color: "var(--error)" }}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}
