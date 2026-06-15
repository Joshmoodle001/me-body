"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import DayCheckin from "@/components/daily/DayCheckin";
import { getBodyMetrics, getProfile, saveBodyMetric, getDayCompletions, toggleDayCompletion, getCurrentStreak, getBestStreak } from "@/db/queries";
import { calculateWeightTrend } from "@/lib/calculations";
import type { DBBodyMetric, DBProfile } from "@/db/localDb";

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DBBodyMetric[]>([]);
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState(""); const [waist, setWaist] = useState(""); const [sleep, setSleep] = useState(""); const [mood, setMood] = useState(3); const [steps, setSteps] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"overview" | "weekly" | "checkin">("overview");
  const [dayCompletions, setDayCompletions] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [openWeek, setOpenWeek] = useState<number | null>(null);

  const loadAll = async () => {
    const [m, p] = await Promise.all([getBodyMetrics(90), getProfile()]);
    setMetrics(m.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()));
    setProfile(p ?? null);
    if (p) {
      const [comps, s, bs] = await Promise.all([
        getDayCompletions(p.id, 90),
        getCurrentStreak(p.id),
        getBestStreak(p.id),
      ]);
      const map: Record<string, boolean> = {};
      comps.forEach((c) => { if (c.completed) map[c.date] = true; });
      setDayCompletions(map);
      setStreak(s);
      setBestStreak(bs);
    }
    setLoading(false);
  };
  useEffect(() => { loadAll(); }, []);

  const handleSave = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true);
    const latest = metrics.length > 0 ? metrics[0] : null;
    await saveBodyMetric({ weightKg: weight ? Number(weight) : latest?.weightKg ?? undefined, waistCm: waist ? Number(waist) : latest?.waistCm ?? undefined, sleepHours: sleep ? Number(sleep) : latest?.sleepHours ?? undefined, mood1To5: mood, steps: steps ? Number(steps) : latest?.steps ?? undefined, recordedAt: new Date().toISOString() });
    setShowForm(false); setWeight(""); setWaist(""); setSleep(""); setSteps(""); await loadAll(); setSaving(false);
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--background)" }}><LoadingState /></div>;
  const weightData = metrics.filter((m) => m.weightKg != null).map((m) => ({ weightKg: m.weightKg!, recordedAt: m.recordedAt }));
  const trend = calculateWeightTrend(weightData);
  const latest = metrics.length > 0 ? metrics[0] : null;

  const buildWeeks = () => {
    const weeks: { label: string; days: { date: string; label: string; done: boolean }[] }[] = [];
    const today = new Date();
    for (let w = 3; w >= 0; w--) {
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - w * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      const days: { date: string; label: string; done: boolean }[] = [];
      const cursor = new Date(weekStart);
      while (cursor <= weekEnd) {
        const dateStr = cursor.toISOString().slice(0, 10);
        const label = cursor.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        days.push({ date: dateStr, label, done: !!dayCompletions[dateStr] });
        cursor.setDate(cursor.getDate() + 1);
      }
      const completed = days.filter((d) => d.done).length;
      weeks.unshift({
        label: `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${completed}/7`,
        days,
      });
    }
    return weeks;
  };

  const weeks = buildWeeks();

  return (
    <div className="app-container">
      <PageHeader title="Progress" subtitle="Your trends over time">
        <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ fontSize: "13px", padding: "0.5rem 1.25rem" }}>+ Log</button>
      </PageHeader>

      <div className="flex gap-1 mb-5 p-1 rounded-2xl" style={{ background: "var(--card-muted)", border: "1px solid var(--border)" }}>
        {(["overview", "weekly", "checkin"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
            style={{ background: tab === t ? "var(--card)" : "transparent", color: tab === t ? "var(--gold)" : "var(--text-muted)" }}>{t}</button>
        ))}
      </div>

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
              <div><label className="input-label">Mood</label><div className="flex gap-2">{[1,2,3,4,5].map((n) => (<button type="button" key={n} onClick={() => setMood(n)} className="flex-1 py-2.5 rounded-xl border-2 text-lg transition-all" style={{ borderColor: mood === n ? "var(--gold)" : "var(--border)", background: mood === n ? "var(--gold-soft)" : "var(--card)" }}>{["\uD83D\uDE1E","\uD83D\uDE15","\uD83D\uDE10","\uD83D\uDE42","\uD83D\uDE0A"][n-1]}</button>))}</div></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-[var(--radius-button)] font-semibold" style={{ background: "var(--card-muted)", color: "var(--text-secondary)" }}>Cancel</button><button type="submit" disabled={saving} className="btn btn-primary flex-1">{saving ? "Saving..." : "Save"}</button></div>
            </form>
          </div>
        </div>
      )}

      {tab === "overview" && (
        <>
          {metrics.length === 0 ? (
            <EmptyState title="No metrics yet" description="Log your weight and measurements to see trends." action={{ label: "Log First Entry", onClick: () => setShowForm(true) }} />
          ) : (
            <div className="space-y-4">
              {latest?.weightKg && (
                <div className="card card-glow-teal animate-neon-pulse-teal" style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Current Weight</p>
                  <span className="neon-text-teal" style={{ fontSize: "clamp(40px, 10vw, 56px)", fontWeight: 800, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{latest.weightKg}</span>
                  <span style={{ fontSize: "18px", color: "var(--text-muted)", marginLeft: "6px" }}>kg</span>
                  {trend.direction !== "not_enough_data" && (
                    <p style={{ fontSize: "14px", color: trend.direction === "decreasing" ? "var(--teal)" : trend.direction === "increasing" ? "var(--warning)" : "var(--text-secondary)", marginTop: "0.75rem", fontWeight: 600 }}>
                      {trend.direction === "decreasing" ? "\u2193" : trend.direction === "increasing" ? "\u2191" : "\u2192"} {Math.abs(trend.changeKg)}kg over {trend.days} days
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {latest?.waistCm != null && <MetricTile label="Waist" value={latest.waistCm} unit="cm" color="var(--brand)" />}
                {latest?.sleepHours != null && <MetricTile label="Sleep" value={latest.sleepHours} unit="hrs" color="var(--teal)" />}
                {latest?.steps != null && <MetricTile label="Steps" value={latest.steps.toLocaleString()} unit="" color="var(--gold)" />}
                {latest?.mood1To5 != null && <MetricTile label="Mood" value={["","\uD83D\uDE1E","\uD83D\uDE15","\uD83D\uDE10","\uD83D\uDE42","\uD83D\uDE0A"][latest.mood1To5]} unit={`${latest.mood1To5}/5`} color="var(--teal)" />}
              </div>
            </div>
          )}
        </>
      )}

      {tab === "weekly" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="card text-center py-2" style={{ background: "var(--card-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Days Done</p>
              <b className="text-lg" style={{ color: "var(--gold)" }}>{Object.keys(dayCompletions).length}</b>
            </div>
            <div className="card text-center py-2" style={{ background: "var(--card-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Streak</p>
              <b className="text-lg" style={{ color: "var(--teal)" }}>{streak} days</b>
            </div>
            <div className="card text-center py-2" style={{ background: "var(--card-muted)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Best</p>
              <b className="text-lg" style={{ color: "var(--brand)" }}>{bestStreak} days</b>
            </div>
          </div>

          {weeks.map((week, wi) => (
            <div key={wi} className="card" style={{ background: "var(--card-muted)", cursor: "pointer" }}>
              <div
                className="flex items-center justify-between gap-2"
                onClick={() => setOpenWeek(openWeek === wi ? null : wi)}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--text-muted)", transition: "transform 0.2s", transform: openWeek === wi ? "rotate(90deg)" : "rotate(0deg)" }}>&#9654;</span>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{week.label}</span>
                </div>
                <span className={`badge text-xs ${week.days.filter(d=>d.done).length === 7 ? "badge-gold" : "badge-info"}`}>
                  {week.days.filter(d=>d.done).length}/7
                </span>
              </div>
              {openWeek === wi && (
                <div className="space-y-1.5 mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  {week.days.map((day) => (
                    <div key={day.date} className="flex items-center justify-between py-1.5 px-2 rounded-xl" style={{ background: day.done ? "rgba(45,212,191,0.08)" : "transparent", border: `1px solid ${day.done ? "rgba(45,212,191,0.20)" : "transparent"}` }}>
                      <span className="text-xs" style={{ color: day.done ? "var(--teal)" : "var(--text-muted)" }}>{day.label}</span>
                      <button
                        onClick={async () => {
                          if (!profile) return;
                          const comp = await toggleDayCompletion(day.date, profile.id, profile.dayType || "training");
                          setDayCompletions((prev) => ({ ...prev, [day.date]: comp.completed }));
                          const [s, bs] = await Promise.all([getCurrentStreak(profile.id), getBestStreak(profile.id)]);
                          setStreak(s); setBestStreak(bs);
                        }}
                        className="px-3 py-1 text-xs font-bold rounded-xl transition-colors"
                        style={{
                          background: day.done ? "var(--success-soft)" : "rgba(255,255,255,0.06)",
                          color: day.done ? "var(--success)" : "var(--text-muted)",
                          border: `1px solid ${day.done ? "var(--success-soft)" : "var(--border)"}`,
                        }}
                      >
                        {day.done ? "\u2713" : "Tick"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "checkin" && (
        <DayCheckin />
      )}
    </div>
  );
}

function MetricTile({ label, value, unit, color }: { label: string; value: string | number; unit: string; color: string }) {
  return (
    <div className="card text-center py-3 neon-outline-teal" style={{ background: "var(--card-muted)" }}>
      <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 750, color }} className="tabular-nums">{value}</p>
      <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>{unit}</p>
    </div>
  );
}
