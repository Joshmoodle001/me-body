"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BodyPage() {
  const router = useRouter();
  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("onboarding_name") ?? "";
    return "";
  });
  const [sex, setSex] = useState<"male" | "female">("male");
  const [birthYear, setBirthYear] = useState("1990");
  const [heightCm, setHeightCm] = useState("170");
  const [currentWeightKg, setCurrentWeightKg] = useState("70");
  const [goalWeightKg, setGoalWeightKg] = useState("65");

  const handleNext = () => {
    if (!name.trim()) return;
    sessionStorage.setItem("onboarding_name", name);
    sessionStorage.setItem("onboarding_sex", sex);
    sessionStorage.setItem("onboarding_birthYear", birthYear);
    sessionStorage.setItem("onboarding_heightCm", heightCm);
    sessionStorage.setItem("onboarding_currentWeightKg", currentWeightKg);
    sessionStorage.setItem("onboarding_goalWeightKg", goalWeightKg);
    router.push("/onboarding/health");
  };

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--background)" }}>
      <div className="max-w-md mx-auto">
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>About you</h1>
        <div className="space-y-4 mb-8">
          <div><label className="input-label">Name</label><input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input" /></div>
          <fieldset><legend className="input-label">Sex</legend><div className="flex gap-3">{(["male","female"] as const).map((s)=>(<button key={s} onClick={()=>setSex(s)} className="flex-1 py-3 rounded-[var(--radius-button)] border-2 font-medium text-sm capitalize" style={{borderColor:sex===s?"var(--brand)":"var(--border)",background:sex===s?"var(--brand-soft)":"var(--card)",color:sex===s?"var(--brand-dark)":"var(--text-secondary)"}}>{s}</button>))}</div></fieldset>
          <div><label className="input-label">Birth Year</label><input id="birthYear" type="text" inputMode="numeric" value={birthYear} onChange={(e)=>setBirthYear(e.target.value.replace(/\D/g,""))} className="input" /></div>
          <div><label className="input-label">Height (cm)</label><input id="heightCm" type="text" inputMode="numeric" value={heightCm} onChange={(e)=>setHeightCm(e.target.value.replace(/\D/g,""))} className="input" /></div>
          <div><label className="input-label">Current Weight (kg)</label><input id="currentWeightKg" type="text" inputMode="decimal" value={currentWeightKg} onChange={(e)=>{let v=e.target.value.replace(/[^0-9.]/g,"");const p=v.split(".");if(p.length>2)v=p[0]+"."+p.slice(1).join("");setCurrentWeightKg(v)}} className="input" /></div>
          <div><label className="input-label">Goal Weight (kg, optional)</label><input id="goalWeightKg" type="text" inputMode="decimal" value={goalWeightKg} onChange={(e)=>{let v=e.target.value.replace(/[^0-9.]/g,"");const p=v.split(".");if(p.length>2)v=p[0]+"."+p.slice(1).join("");setGoalWeightKg(v)}} className="input" /></div>
        </div>
        <button onClick={handleNext} disabled={!name.trim()} className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold text-white" style={{ background: name.trim()?"var(--brand)":"var(--border)", opacity:name.trim()?1:0.5 }}>Next</button>
      </div>
    </div>
  );
}
