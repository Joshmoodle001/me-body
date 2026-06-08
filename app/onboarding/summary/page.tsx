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
      activityLevel: (sessionStorage.getItem("onboarding_activityLevel") ?? "moderate") as "sedentary" | "light" | "moderate" | "active" | "very_active",
      goalType: (sessionStorage.getItem("onboarding_goal") ?? "fat_loss") as "fat_loss" | "muscle_gain" | "maintenance" | "performance" | "habit_reset",
      trainingDaysPerWeek: Number(sessionStorage.getItem("onboarding_trainingDays")) || 3,
      dietPreference: (sessionStorage.getItem("onboarding_dietPreference") ?? "any") as "any" | "omnivore" | "vegetarian" | "vegan" | "pescatarian" | "keto" | "paleo",
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
    if (targets) {
      await saveTargets({ ...targets, profileId: saved.id, calculationMethod: targets.calculationMethod ?? "mifflin_st_jeor" });
    }
    router.push("/app/dashboard");
  };

  if (!targets) {
    return (
      <div className="min-h-screen p-6 bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500">Calculating your targets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-stone-50">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Your Suggested Targets</h1>
        <p className="text-sm text-stone-500 mb-6">Starting targets based on Mifflin-St Jeor. Adjust after 2-4 weeks of trend data.</p>

        <div className="space-y-3 mb-8">
          {[
            { label: "Calories", value: `${targets.calories} kcal` },
            { label: "Protein", value: `${targets.proteinG}g` },
            { label: "Carbs", value: `${targets.carbsG}g` },
            { label: "Fat", value: `${targets.fatG}g` },
            { label: "Fiber", value: `${targets.fiberG}g` },
            { label: "Water", value: `${targets.waterMl}ml` },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center bg-white rounded-xl p-4 border border-stone-200">
              <p className="font-semibold text-stone-900">{item.label}</p>
              <span className="text-lg font-bold text-green-700">{item.value}</span>
            </div>
          ))}
        </div>

        <p className="text-stone-500 text-xs mb-6 text-center">
          Suggested starting targets. Not medical prescriptions. Edit anytime in Settings.
        </p>

        <button
          onClick={handleFinish}
          disabled={saving}
          className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Finish & Go to Dashboard"}
        </button>
      </div>
    </div>
  );
}
