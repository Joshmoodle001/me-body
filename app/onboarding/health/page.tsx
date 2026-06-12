"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HealthPage() {
  const router = useRouter();
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [cycleTracking, setCycleTracking] = useState(false);
  const [pregnancyStatus, setPregnancyStatus] = useState<string>("none");
  const [isMale, setIsMale] = useState(true);

  useEffect(() => {
    setIsMale((sessionStorage.getItem("onboarding_sex") ?? "male") === "male");
  }, []);
  const [error, setError] = useState("");

  const CONDITION_OPTIONS = [
    { value: "none", label: "No chronic conditions" },
    { value: "diabetes_type1", label: "Diabetes (type 1)" },
    { value: "diabetes_type2", label: "Diabetes (type 2)" },
    { value: "prediabetes", label: "Prediabetes" },
    { value: "hypertension", label: "High blood pressure" },
    { value: "ckd", label: "Kidney disease" },
    { value: "heart_disease", label: "Heart disease" },
    { value: "thyroid_disorder", label: "Thyroid disorder" },
    { value: "pcos", label: "PCOS" },
    { value: "ibs", label: "IBS" },
    { value: "coeliac", label: "Coeliac disease" },
    { value: "lactose_intolerance", label: "Lactose intolerance" },
    { value: "gout", label: "Gout" },
    { value: "anaemia", label: "Anaemia" },
    { value: "other", label: "Other" },
  ];

  const MED_OPTIONS = [
    { value: "none", label: "No medications" },
    { value: "insulin", label: "Insulin" },
    { value: "sulfonylurea", label: "Sulfonylurea (diabetes)" },
    { value: "metformin", label: "Metformin" },
    { value: "blood_pressure_meds", label: "Blood pressure medication" },
    { value: "cholesterol_meds", label: "Cholesterol medication" },
    { value: "antidepressant", label: "Antidepressant" },
    { value: "antipsychotic", label: "Antipsychotic" },
    { value: "thyroid_meds", label: "Thyroid medication" },
    { value: "corticosteroid", label: "Corticosteroid (e.g. prednisone)" },
    { value: "beta_blocker", label: "Beta blocker" },
    { value: "other", label: "Other" },
  ];

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    if (value === "none") {
      if (list.includes("none")) { setList([]); return; }
      setList(["none"]); return;
    }
    const current = list.filter((c) => c !== "none");
    if (current.includes(value)) {
      setList(current.filter((c) => c !== value));
    } else {
      setList([...current, value]);
    }
  };

  const handleNext = () => {
    setError("");
    if (!conditions.length && !medications.length) {
      sessionStorage.setItem("onboarding_chronicConditions", JSON.stringify([]));
      sessionStorage.setItem("onboarding_medications", JSON.stringify([]));
      sessionStorage.setItem("onboarding_cycleTracking", String(isMale ? false : cycleTracking));
      sessionStorage.setItem("onboarding_pregnancyStatus", isMale ? "not_applicable" : pregnancyStatus);
      router.push("/onboarding/preferences");
      return;
    }
    sessionStorage.setItem("onboarding_chronicConditions", JSON.stringify(conditions.filter((c) => c !== "none")));
    sessionStorage.setItem("onboarding_medications", JSON.stringify(medications.filter((m) => m !== "none")));
    sessionStorage.setItem("onboarding_cycleTracking", String(isMale ? false : cycleTracking));
    sessionStorage.setItem("onboarding_pregnancyStatus", isMale ? "not_applicable" : pregnancyStatus);
    router.push("/onboarding/preferences");
  };

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--background)" }}>
      <div className="max-w-md mx-auto">
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Health context</h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          This helps us show safer, more relevant guidance. All optional. Your data stays on your device.
        </p>

        <div className="space-y-4 mb-8">
          <fieldset>
            <legend className="input-label">Chronic conditions (select all that apply)</legend>
            <div className="flex flex-wrap gap-2 mt-1">
              {CONDITION_OPTIONS.map((c) => {
                const isSelected = conditions.includes(c.value);
                return (
                  <button key={c.value} type="button" onClick={() => toggle(conditions, setConditions, c.value)}
                    className="px-3 py-1.5 rounded-[var(--radius-button)] border-2 text-xs font-medium transition-all"
                    style={{ borderColor: isSelected ? "var(--brand)" : "var(--border)", background: isSelected ? "var(--brand-soft)" : "var(--card)", color: isSelected ? "var(--brand-dark)" : "var(--text-secondary)" }}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="input-label">Medications (select all that apply)</legend>
            <div className="flex flex-wrap gap-2 mt-1">
              {MED_OPTIONS.map((m) => {
                const isSelected = medications.includes(m.value);
                return (
                  <button key={m.value} type="button" onClick={() => toggle(medications, setMedications, m.value)}
                    className="px-3 py-1.5 rounded-[var(--radius-button)] border-2 text-xs font-medium transition-all"
                    style={{ borderColor: isSelected ? "var(--ember)" : "var(--border)", background: isSelected ? "var(--ember-soft)" : "var(--card)", color: isSelected ? "var(--ember)" : "var(--text-secondary)" }}>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {!isMale && (
          <fieldset>
            <legend className="input-label">Pregnancy status</legend>
            <div className="flex gap-2 mt-1">
              {[
                { v: "none", l: "Not pregnant" },
                { v: "pregnant", l: "Pregnant" },
                { v: "postpartum", l: "Postpartum" },
                { v: "not_applicable", l: "Not applicable" },
              ].map((p) => (
                <button key={p.v} type="button" onClick={() => setPregnancyStatus(p.v)}
                  className="flex-1 py-2 rounded-[var(--radius-button)] border-2 text-xs font-medium transition-all"
                  style={{ borderColor: pregnancyStatus === p.v ? "var(--brand)" : "var(--border)", background: pregnancyStatus === p.v ? "var(--brand-soft)" : "var(--card)", color: pregnancyStatus === p.v ? "var(--brand-dark)" : "var(--text-secondary)" }}>
                  {p.l}
                </button>
              ))}
            </div>
          </fieldset>
          )}

          {!isMale && (
          <fieldset>
            <legend className="input-label">Menstrual cycle tracking</legend>
            <div className="flex items-center gap-3 mt-1">
              <button type="button" role="switch" aria-checked={cycleTracking} onClick={() => setCycleTracking(!cycleTracking)}
                className="w-14 h-7 rounded-full transition-colors relative" style={{ background: cycleTracking ? "var(--brand)" : "var(--border)" }}>
                <span className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform" style={{ left: cycleTracking ? "calc(100% - 1.625rem)" : "2px" }} />
              </button>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {cycleTracking ? "Cycle-aware tracking on" : "Off"}
              </span>
            </div>
            <p className="input-helper">When on, you can log symptoms and the app will offer flexible targets during your cycle.</p>
          </fieldset>
          )}
        </div>

        <p className="text-center mb-4" style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic" }}>
          Me Body is for general wellness education. It does not diagnose illness and is not emergency care. If you have chest pain, fainting, severe shortness of breath, severe weakness, or pregnancy warning signs, get urgent medical help.
        </p>

        {error && <p className="text-sm text-center mb-2" style={{ color: "var(--error)" }}>{error}</p>}

        <button onClick={handleNext}
          className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold text-white" style={{ background: "var(--brand)" }}>
          Next
        </button>
      </div>
    </div>
  );
}
