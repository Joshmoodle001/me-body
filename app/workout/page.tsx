"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { getWorkouts, saveWorkout, saveWorkoutSet, getWorkoutSets } from "@/db/queries";
import type { DBWorkout, DBWorkoutSet } from "@/db/localDb";

interface ExerciseEntry {
  name: string;
  sets: { reps: string; weight: string }[];
}

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
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [newExercise, setNewExercise] = useState("");

  const loadWorkouts = async () => { const w = await getWorkouts(30); setWorkouts(w); setLoading(false); };
  useEffect(() => { loadWorkouts(); }, []);

  const handleSave = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true);
    const saved = await saveWorkout({ name: name || "Workout", type, startedAt: new Date().toISOString(), durationMinutes: Number(duration), perceivedEffort1To10: Number(effort), notes });
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      for (let s = 0; s < ex.sets.length; s++) {
        const set = ex.sets[s];
        if (set.reps || set.weight) {
          await saveWorkoutSet({ workoutId: saved.id, exerciseName: ex.name, setNumber: s + 1, reps: Number(set.reps) || undefined, weightKg: Number(set.weight) || undefined, notes: "" });
        }
      }
    }
    setShowNew(false); setName("Workout"); setNotes(""); setExercises([]); setDuration("45"); setEffort("7"); loadWorkouts(); setSaving(false);
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
              <div>
                <label className="input-label">Exercises</label>
                {exercises.map((ex, exIdx) => (
                  <div key={exIdx} className="mb-2 rounded-xl p-3" style={{ background: "var(--card-muted)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ex.name}</span>
                      <button type="button" onClick={() => setExercises(exercises.filter((_, i) => i !== exIdx))} className="text-xs font-semibold" style={{ color: "var(--error)" }}>Remove</button>
                    </div>
                    {ex.sets.map((s, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium w-8" style={{ color: "var(--text-muted)" }}>#{sIdx + 1}</span>
                        <input type="text" inputMode="numeric" value={s.reps} onChange={(e) => {
                          const updated = [...exercises]; updated[exIdx].sets[sIdx].reps = e.target.value.replace(/\D/g,""); setExercises(updated);
                        }} placeholder="Reps" className="input flex-1 py-1.5 text-sm" />
                        <input type="text" inputMode="decimal" value={s.weight} onChange={(e) => {
                          let v = e.target.value.replace(/[^0-9.]/g,""); const p = v.split("."); if (p.length > 2) v = p[0] + "." + p.slice(1).join("");
                          const updated = [...exercises]; updated[exIdx].sets[sIdx].weight = v; setExercises(updated);
                        }} placeholder="Kg" className="input flex-1 py-1.5 text-sm" />
                        <button type="button" onClick={() => {
                          const updated = [...exercises]; updated[exIdx].sets = updated[exIdx].sets.filter((_, i) => i !== sIdx);
                          if (updated[exIdx].sets.length === 0) updated.splice(exIdx, 1);
                          setExercises(updated);
                        }} className="text-xs font-bold px-2 py-1 rounded" style={{ color: "var(--text-muted)" }}>X</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => {
                      const updated = [...exercises]; updated[exIdx].sets.push({ reps: "", weight: "" }); setExercises(updated);
                    }} className="mt-1 text-xs font-semibold" style={{ color: "var(--brand)" }}>+ Add Set</button>
                  </div>
                ))}
                <div className="flex gap-2 mt-1">
                  <input type="text" value={newExercise} onChange={(e) => setNewExercise(e.target.value)} placeholder="Exercise name" className="input flex-1 py-2 text-sm" />
                  <button type="button" onClick={() => { if (!newExercise.trim()) return; setExercises([...exercises, { name: newExercise.trim(), sets: [{ reps: "", weight: "" }] }]); setNewExercise(""); }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--brand-soft)", color: "var(--brand-dark)" }}>+ Add</button>
                </div>
              </div>
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
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkoutCard({ workout }: { workout: DBWorkout }) {
  const [sets, setSets] = useState<DBWorkoutSet[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded && sets.length === 0) {
      getWorkoutSets(workout.id).then((s) => setSets(s.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName) || a.setNumber - b.setNumber)));
    }
  }, [expanded, workout.id]);

  const exerciseNames = [...new Set(sets.map((s) => s.exerciseName))];

  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1 mr-2" onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer" }}>
          <p className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>{workout.name}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            <span className="capitalize">{workout.type}</span>
            {workout.durationMinutes && <span>{workout.durationMinutes} min</span>}
            {workout.perceivedEffort1To10 && <span>RPE {workout.perceivedEffort1To10}/10</span>}
            {sets.length > 0 && <span>{exerciseNames.length} exercises</span>}
          </div>
          {workout.notes && <p className="mt-1 truncate" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{workout.notes}</p>}
        </div>
        <span className="shrink-0" style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(workout.startedAt).toLocaleDateString()}</span>
      </div>
      {expanded && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          {sets.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>No exercise details recorded.</p>
          ) : (
            exerciseNames.map((name) => {
              const exSets = sets.filter((s) => s.exerciseName === name);
              return (
                <div key={name} className="mb-2 last:mb-0">
                  <p className="text-xs font-semibold" style={{ color: "var(--brand-dark)" }}>{name}</p>
                  <div className="flex gap-3 mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {exSets.map((s) => (
                      <span key={s.id}>
                        {s.reps && <span>{s.reps}r</span>}
                        {s.weightKg && <span> x {s.weightKg}kg</span>}
                        {!s.reps && !s.weightKg && "-"}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
