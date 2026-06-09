"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { getBodyMetrics, getProfile, saveBodyMetric } from "@/db/queries";
import { calculateWeightTrend } from "@/lib/calculations";
import type { DBBodyMetric, DBProfile } from "@/db/localDb";

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DBBodyMetric[]>([]);
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [sleep, setSleep] = useState("");
  const [mood, setMood] = useState(3);
  const [steps, setSteps] = useState("");
  const [saving, setSaving] = useState(false);

  const loadMetrics = async () => {
    const [m, p] = await Promise.all([getBodyMetrics(90), getProfile()]);
    setMetrics(m.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()));
    setProfile(p ?? null); setLoading(false);
  };
  useEffect(() => { loadMetrics(); }, []);

  const handleSave = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true);
    const latest = metrics.length > 0 ? metrics[0] : null;
    await saveBodyMetric({ weightKg: weight ? Number(weight) : latest?.weightKg ?? undefined, waistCm: waist ? Number(waist) : latest?.waistCm ?? undefined, sleepHours: sleep ? Number(sleep) : latest?.sleepHours ?? undefined, mood1To5: mood, steps: steps ? Number(steps) : latest?.steps ?? undefined, recordedAt: new Date().toISOString() });
    setShowForm(false); setWeight(""); setWaist(""); setSleep(""); setSteps(""); await loadMetrics(); setSaving(false);
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--background)" }}><LoadingState /></div>;

  const weightData = metrics.filter((m) => m.weightKg != null).map((m) => ({ weightKg: m.weightKg!, recordedAt: m.recordedAt }));
  const trend = calculateWeightTrend(weightData);
  const latest = metrics.length > 0 ? metrics[0] : null;

  return (
    <div className="app-container">
      <PageHeader title="Progress" subtitle="Your trends over time">
        <button onClick={() => setShowForm(true)} className="btn btn-primary text-sm" style={{ padding: "0.5rem 1rem" }}>+ Log</button>
      </PageHeader>

      {showForm && (
        <div className="dialog-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="dialog-content">
            <h3 className="mb-4" style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>Log Body Metrics</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="input-label">Weight (kg)</label><input type="text" inputMode="decimal" value={weight} onChange={(e)=>{let v=e.target.value.replace(/[^0-9.]/g,"");const p=v.split(".");if(p.length>2)v=p[0]+"."+p.slice(1).join("");setWeight(v)}} placeholder={latest?.weightKg?.toString() ?? ""} className="input" /></div>
                <div><label className="input-label">Waist (cm)</label><input type="text" inputMode="decimal" value={waist} onChange={(e)=>{let v=e.target.value.replace(/[^0-9.]/g,"");const p=v.split(".");if(p.length>2)v=p[0]+"."+p.slice(1).join("");setWaist(v)}} placeholder={latest?.waistCm?.toString() ?? ""} className="input" /></div>
                <div><label className="input-label">Sleep (hrs)</label><input type="text" inputMode="decimal" value={sleep} onChange={(e)=>{let v=e.target.value.replace(/[^0-9.]/g,"");const p=v.split(".");if(p.length>2)v=p[0]+"."+p.slice(1).join("");setSleep(v)}} placeholder={latest?.sleepHours?.toString() ?? ""} className="input" /></div>
                <div><label className="input-label">Steps</label><input type="text" inputMode="numeric" value={steps} onChange={(e)=>setSteps(e.target.value.replace(/\D/g,""))} placeholder={latest?.steps?.toString() ?? ""} className="input" /></div>
              </div>
              <div><label className="input-label">Mood</label>
                <div className="flex gap-2">{[1,2,3,4,5].map((n) => (
                  <button type="button" key={n} onClick={() => setMood(n)} className="flex-1 py-2.5 rounded-xl border-2 text-lg transition-all"
                    style={{ borderColor: mood === n ? "var(--brand)" : "var(--border)", background: mood === n ? "var(--brand-soft)" : "var(--card)" }}>{["😞","😕","😐","🙂","😊"][n-1]}</button>
                ))}</div>
              </div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-[var(--radius-button)] font-semibold" style={{ background: "var(--card-muted)", color: "var(--text-secondary)" }}>Cancel</button><button type="submit" disabled={saving} className="flex-1 btn btn-primary py-3">{saving ? "Saving..." : "Save"}</button></div>
            </form>
          </div>
        </div>
      )}

      {metrics.length === 0 ? (
        <EmptyState title="No metrics yet" description="Log your weight and measurements to see trends." action={{ label: "Log First Entry", onClick: () => setShowForm(true) }} />
      ) : (
        <div className="space-y-4">
          {latest?.weightKg && (
            <div className="card">
              <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Weight</p>
              <span style={{ fontSize: "clamp(32px, 8vw, 40px)", fontWeight: 750, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{latest.weightKg}</span>
              <span style={{ fontSize: "16px", color: "var(--text-muted)", marginLeft: "4px" }}>kg</span>
              {trend.direction !== "not_enough_data" && (
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                  {trend.direction === "decreasing" ? "Down" : trend.direction === "increasing" ? "Up" : "Stable"} {Math.abs(trend.changeKg)}kg over {trend.days} days
                </p>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {latest?.waistCm != null && <MetricTile label="Waist" value={latest.waistCm} unit="cm" color="var(--ember)" />}
            {latest?.sleepHours != null && <MetricTile label="Sleep" value={latest.sleepHours} unit="hrs" color="var(--info)" />}
            {latest?.steps != null && <MetricTile label="Steps" value={latest.steps.toLocaleString()} unit="" color="var(--sand)" />}
            {latest?.mood1To5 != null && <MetricTile label="Mood" value={["","😞","😕","😐","🙂","😊"][latest.mood1To5]} unit={`${latest.mood1To5}/5`} color="var(--brand)" />}
          </div>
          <p className="text-center" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{metrics.length} entries tracked</p>
        </div>
      )}
    </div>
  );
}

function MetricTile({ label, value, unit, color }: { label: string; value: string | number; unit: string; color: string }) {
  return (
    <div className="card text-center py-2.5 sm:py-3 px-2">
      <p style={{ fontSize: "9px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ fontSize: "clamp(18px, 5vw, 24px)", fontWeight: 700, color }} className="tabular-nums">{value}</p>
      <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>{unit}</p>
    </div>
  );
}
