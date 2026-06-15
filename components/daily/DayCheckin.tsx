"use client";

import { useState, useEffect } from "react";
import { saveBodyMetric } from "@/db/queries";
import { getLatestBodyMetric } from "@/db/queries";

export default function DayCheckin() {
  const [weight, setWeight] = useState("");
  const [steps, setSteps] = useState("");
  const [waterLitres, setWaterLitres] = useState("");
  const [trained, setTrained] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getLatestBodyMetric().then((m) => {
      if (m) {
        if (m.weightKg) setWeight(String(m.weightKg));
        if (m.steps) setSteps(String(m.steps));
        if (m.notes) setNotes(m.notes);
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveBodyMetric({
        weightKg: weight ? Number(weight) : undefined,
        steps: steps ? Number(steps) : undefined,
        notes: notes || undefined,
        recordedAt: new Date().toISOString(),
        mood1To5: trained ? 3 : undefined,
        sleepHours: undefined,
      });
      if (waterLitres) {
        const { saveWaterLog } = await import("@/db/queries");
        await saveWaterLog({
          amountMl: Math.round(Number(waterLitres) * 1000),
          loggedAt: new Date().toISOString(),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="card" style={{ background: "var(--card-muted)" }}>
      <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Daily Check-in
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div>
          <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="90.0"
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Steps</label>
          <input
            type="number"
            step="1"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="4000"
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Water (L)</label>
          <input
            type="number"
            step="0.1"
            value={waterLitres}
            onChange={(e) => setWaterLitres(e.target.value)}
            placeholder="2.5"
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Trained?</label>
          <select
            value={trained ? "yes" : "no"}
            onChange={(e) => setTrained(e.target.value === "yes")}
            className="input mt-1"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>
      <div className="mb-3">
        <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Hunger, cravings, workout, sleep, mood..."
          className="input mt-1"
          style={{ minHeight: "64px", resize: "vertical" }}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className={`btn ${saved ? "badge-success" : "btn-primary"} w-full`}
        style={saved ? { background: "var(--success-soft)", color: "var(--success)", minHeight: "44px" } : {}}
      >
        {saved ? "\u2713 Saved!" : saving ? "Saving..." : "Save Check-in"}
      </button>
    </div>
  );
}
