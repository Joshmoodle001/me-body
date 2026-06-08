"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BodyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [birthYear, setBirthYear] = useState(1990);
  const [heightCm, setHeightCm] = useState(170);
  const [currentWeightKg, setCurrentWeightKg] = useState(70);
  const [goalWeightKg, setGoalWeightKg] = useState(65);

  const handleNext = () => {
    if (!name.trim()) return;
    sessionStorage.setItem("onboarding_name", name);
    sessionStorage.setItem("onboarding_sex", sex);
    sessionStorage.setItem("onboarding_birthYear", String(birthYear));
    sessionStorage.setItem("onboarding_heightCm", String(heightCm));
    sessionStorage.setItem("onboarding_currentWeightKg", String(currentWeightKg));
    sessionStorage.setItem("onboarding_goalWeightKg", String(goalWeightKg));
    router.push("/onboarding/preferences");
  };

  return (
    <div className="min-h-screen p-6 bg-stone-50">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">About you</h1>
        <div className="space-y-4 mb-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-stone-700 mb-2">Sex</legend>
            <div className="flex gap-3">
              {(["male", "female"] as const).map((s) => (
                <button key={s} onClick={() => setSex(s)} className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm capitalize ${sex === s ? "border-green-600 bg-green-50 text-green-700" : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"}`}>{s}</button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="birthYear" className="block text-sm font-medium text-stone-700 mb-1">Birth Year</label>
            <input id="birthYear" type="number" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))} min={1920} max={2020} className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          <div>
            <label htmlFor="heightCm" className="block text-sm font-medium text-stone-700 mb-1">Height (cm)</label>
            <input id="heightCm" type="number" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} min={100} max={250} className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          <div>
            <label htmlFor="currentWeightKg" className="block text-sm font-medium text-stone-700 mb-1">Current Weight (kg)</label>
            <input id="currentWeightKg" type="number" value={currentWeightKg} onChange={(e) => setCurrentWeightKg(Number(e.target.value))} min={30} max={300} step={0.1} className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          <div>
            <label htmlFor="goalWeightKg" className="block text-sm font-medium text-stone-700 mb-1">Goal Weight (kg, optional)</label>
            <input id="goalWeightKg" type="number" value={goalWeightKg} onChange={(e) => setGoalWeightKg(Number(e.target.value))} min={30} max={300} step={0.1} className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>
        </div>

        <button onClick={handleNext} disabled={!name.trim()} className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors">Next</button>
      </div>
    </div>
  );
}
