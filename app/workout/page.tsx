"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { getWorkouts, saveWorkout } from "@/db/queries";
import type { DBWorkout } from "@/db/localDb";

export default function WorkoutPage() {
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<DBWorkout[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("Workout");
  const [type, setType] = useState("strength");
  const [duration, setDuration] = useState("45");
  const [effort, setEffort] = useState("7");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadWorkouts = async () => { setWorkouts(await getWorkouts(30)); setLoading(false); };
  useEffect(() => { loadWorkouts(); }, []);

  const handleSave = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true);
    await saveWorkout({ name: name || "Workout", type, startedAt: new Date().toISOString(), durationMinutes: Number(duration), perceivedEffort1To10: Number(effort), notes });
    setShowNew(false); setName("Workout"); setNotes(""); loadWorkouts(); setSaving(false);
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--background)" }}><LoadingState /></div>;

  return (
    <div className="app-container">
      <PageHeader title="Workouts" subtitle="Track your training">
        <button onClick={() => setShowNew(true)} className="btn btn-primary text-sm" style={{ padding: "0.5rem 1rem" }}>+ Log</button>
      </PageHeader>

      {showNew && (
        <div className="dialog-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowNew(false); }}>
          <div className="dialog-content">
            <h3 className="mb-4" style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>Log Workout</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="input-label">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" /></div>
              <div><label className="input-label">Type</label><select value={type} onChange={(e) => setType(e.target.value)} className="input"><option value="strength">Strength</option><option value="cardio">Cardio</option><option value="hiit">HIIT</option><option value="mobility">Mobility</option><option value="sport">Sport</option><option value="other">Other</option></select></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="input-label">Duration (min)</label><input type="text" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value.replace(/\D/g,""))} className="input" /></div><div><label className="input-label">Effort (1-10)</label><input type="text" inputMode="numeric" value={effort} onChange={(e) => setEffort(e.target.value.replace(/\D/g,""))} className="input" /></div></div>
              <div><label className="input-label">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input" placeholder="Exercises, sets, reps..." /></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowNew(false)} className="flex-1 py-3 rounded-[var(--radius-button)] font-semibold" style={{ background: "var(--card-muted)", color: "var(--text-secondary)" }}>Cancel</button><button type="submit" disabled={saving} className="flex-1 btn btn-primary py-3">{saving ? "Saving..." : "Save"}</button></div>
            </form>
          </div>
        </div>
      )}

      {workouts.length === 0 ? (
        <EmptyState title="No workouts logged" description="Start tracking your training." action={{ label: "Log Workout", onClick: () => setShowNew(true) }} />
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => (
            <div key={w.id} className="card">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>{w.name}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    <span className="capitalize">{w.type}</span>
                    {w.durationMinutes && <span>{w.durationMinutes} min</span>}
                    {w.perceivedEffort1To10 && <span>RPE {w.perceivedEffort1To10}/10</span>}
                  </div>
                  {w.notes && <p className="mt-1 truncate" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{w.notes}</p>}
                </div>
                <span className="shrink-0" style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(w.startedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
