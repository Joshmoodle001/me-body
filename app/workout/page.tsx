"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [duration, setDuration] = useState(45);
  const [effort, setEffort] = useState(7);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadWorkouts = async () => {
    const data = await getWorkouts(30);
    setWorkouts(data);
    setLoading(false);
  };

  useEffect(() => { loadWorkouts(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await saveWorkout({
      name: name || "Workout",
      type,
      startedAt: new Date().toISOString(),
      durationMinutes: duration,
      perceivedEffort1To10: effort,
      notes,
    });
    setShowNew(false);
    setName("Workout");
    setDuration(45);
    setEffort(7);
    setNotes("");
    await loadWorkouts();
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-stone-50"><LoadingState message="Loading workouts..." /></div>;

  return (
    <div className="p-6 pb-8">
      <PageHeader title="Workouts" subtitle="Track your training">
        <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
          + Log
        </button>
      </PageHeader>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowNew(false); }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Log Workout</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="wName" className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                <input id="wName" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label htmlFor="wType" className="block text-sm font-medium text-stone-700 mb-1">Type</label>
                <select id="wType" value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {["strength", "cardio", "hiit", "mobility", "sport", "other"].map((t) => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="wDur" className="block text-sm font-medium text-stone-700 mb-1">Duration (min)</label>
                  <input id="wDur" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={1} max={600} className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label htmlFor="wEff" className="block text-sm font-medium text-stone-700 mb-1">Effort (1-10)</label>
                  <input id="wEff" type="number" value={effort} onChange={(e) => setEffort(Number(e.target.value))} min={1} max={10} className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label htmlFor="wNotes" className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
                <textarea id="wNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Exercises, sets, reps..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowNew(false)} className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {workouts.length === 0 ? (
        <EmptyState title="No workouts logged" description="Start tracking your training by logging your first workout." action={{ label: "Log Workout", onClick: () => setShowNew(true) }} />
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => (
            <div key={w.id} className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-stone-900">{w.name}</p>
                  <div className="flex gap-3 mt-1 text-sm text-stone-500">
                    <span className="capitalize">{w.type}</span>
                    {w.durationMinutes && <span>{w.durationMinutes} min</span>}
                    {w.perceivedEffort1To10 && <span>RPE {w.perceivedEffort1To10}/10</span>}
                  </div>
                  {w.notes && <p className="text-sm text-stone-400 mt-1">{w.notes}</p>}
                </div>
                <span className="text-xs text-stone-400">{new Date(w.startedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
