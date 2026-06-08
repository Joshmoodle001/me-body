"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVITY_LEVELS, type ActivityLevel, DIET_PREFERENCES, type DietPreference } from "@/lib/constants";

export default function PreferencesPage() {
  const router = useRouter();
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [trainingDays, setTrainingDays] = useState(3);
  const [dietPreference, setDietPreference] = useState<DietPreference>("any");

  return (
    <div className="min-h-screen p-6 bg-stone-50">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Activity & Preferences</h1>

        <div className="space-y-4 mb-8">
          <fieldset>
            <legend className="block text-sm font-medium text-stone-700 mb-2">Activity Level</legend>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map((level) => (
                <button key={level} onClick={() => setActivityLevel(level)} className={`w-full text-left p-3 rounded-xl border-2 text-sm capitalize ${activityLevel === level ? "border-green-600 bg-green-50" : "border-stone-200 bg-white hover:border-stone-300"}`}>
                  {level.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="trainingDays" className="block text-sm font-medium text-stone-700 mb-1">Training Days Per Week</label>
            <input id="trainingDays" type="number" value={trainingDays} onChange={(e) => setTrainingDays(Number(e.target.value))} min={0} max={7} className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-stone-700 mb-2">Diet Preference</legend>
            <div className="flex flex-wrap gap-2">
              {DIET_PREFERENCES.map((diet) => (
                <button key={diet} onClick={() => setDietPreference(diet)} className={`px-4 py-2 rounded-xl border-2 text-sm capitalize ${dietPreference === diet ? "border-green-600 bg-green-50 text-green-700" : "border-stone-200 bg-white hover:border-stone-300"}`}>
                  {diet.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <button
          onClick={() => {
            sessionStorage.setItem("onboarding_activityLevel", activityLevel);
            sessionStorage.setItem("onboarding_trainingDays", String(trainingDays));
            sessionStorage.setItem("onboarding_dietPreference", dietPreference);
            router.push("/onboarding/summary");
          }}
          className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Calculate My Targets
        </button>
      </div>
    </div>
  );
}
