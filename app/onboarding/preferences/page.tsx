"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVITY_LEVELS, type ActivityLevel, DIET_PREFERENCES, type DietPreference } from "@/lib/constants";

export default function PreferencesPage() {
  const router = useRouter();
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [trainingDays, setTrainingDays] = useState("3");
  const [dietPreference, setDietPreference] = useState<DietPreference>("any");

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--background)" }}>
      <div className="max-w-md mx-auto">
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>Activity & Preferences</h1>
        <div className="space-y-4 mb-8">
          <fieldset><legend className="input-label">Activity Level</legend><div className="space-y-2">{ACTIVITY_LEVELS.map((l)=>(<button key={l} onClick={()=>setActivityLevel(l)} className="w-full text-left p-3 rounded-[var(--radius-button)] border-2 text-sm capitalize transition-all" style={{borderColor:activityLevel===l?"var(--brand)":"var(--border)",background:activityLevel===l?"var(--brand-soft)":"var(--card)",color:activityLevel===l?"var(--brand-dark)":"var(--text-secondary)"}}>{l.replace(/_/g," ")}</button>))}</div></fieldset>
          <div><label htmlFor="trainingDays" className="input-label">Training Days Per Week</label><input id="trainingDays" type="text" inputMode="numeric" value={trainingDays} onChange={(e)=>setTrainingDays(e.target.value.replace(/\D/g,""))} min={0} max={7} className="input" /></div>
          <fieldset><legend className="input-label">Diet Preference</legend><div className="flex flex-wrap gap-2">{DIET_PREFERENCES.map((d)=>(<button key={d} onClick={()=>setDietPreference(d)} className="px-4 py-2 rounded-[var(--radius-button)] border-2 text-sm capitalize transition-all" style={{borderColor:dietPreference===d?"var(--brand)":"var(--border)",background:dietPreference===d?"var(--brand-soft)":"var(--card)",color:dietPreference===d?"var(--brand-dark)":"var(--text-secondary)"}}>{d.replace(/_/g," ")}</button>))}</div></fieldset>
        </div>
        <button onClick={()=>{sessionStorage.setItem("onboarding_activityLevel",activityLevel);sessionStorage.setItem("onboarding_trainingDays",trainingDays);sessionStorage.setItem("onboarding_dietPreference",dietPreference);router.push("/onboarding/visibility")}}
          className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold text-white" style={{ background: "var(--brand)" }}>Calculate My Targets</button>
      </div>
    </div>
  );
}
