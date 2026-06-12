"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { getHabits, saveHabit, saveHabitLog } from "@/db/queries";
import type { DBHabit, DBHabitLog } from "@/db/localDb";
import { getDb } from "@/db/localDb";

function todayStr(): string { return new Date().toISOString().slice(0, 10); }

export default function HabitTrackerPage() {
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<DBHabit[]>([]);
  const [todayLogs, setTodayLogs] = useState<Map<string, DBHabitLog>>(new Map());
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");

  const load = async () => {
    const h = await getHabits(); setHabits(h);
    const logs = await (await getDb()).habitLogs.filter((l) => l.completedAt >= `${todayStr()}T00:00:00.000Z` && l.completedAt <= `${todayStr()}T23:59:59.999Z` && !l.deletedAt).toArray();
    setTodayLogs(new Map(logs.map((l) => [l.habitId, l]))); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleHabit = async (habitId: string) => {
    if (todayLogs.has(habitId)) { await (await getDb()).habitLogs.update(todayLogs.get(habitId)!.id, { deletedAt: new Date().toISOString() }); }
    else { await saveHabitLog({ habitId, completedAt: new Date().toISOString(), notes: "" }); }
    await load();
  };

  const addHabit = async () => { if (!newName.trim()) return; await saveHabit({ name: newName.trim(), targetFrequency: "daily" }); setNewName(""); setShowNew(false); load(); };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--background)" }}><LoadingState /></div>;

  return (
    <div className="app-container">
      <PageHeader title="Habits" subtitle="Build daily consistency">
        <button onClick={() => setShowNew(true)} className="btn btn-primary" style={{ fontSize: "13px", padding: "0.5rem 1.25rem" }}>+ New</button>
      </PageHeader>

      {showNew && (
        <div className="card mb-4 animate-fade-in" style={{ background: "var(--card-muted)" }}>
          <label htmlFor="habitName" className="input-label">Habit name</label>
          <div className="flex gap-2"><input id="habitName" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Drink water, stretch..." className="input flex-1" autoFocus /><button onClick={addHabit} disabled={!newName.trim()} className="btn btn-primary" style={{ opacity: newName.trim() ? 1 : 0.5 }}>Add</button></div>
        </div>
      )}

      {habits.length === 0 ? (
        <EmptyState title="No habits yet" description="Create your first habit to start tracking daily consistency." action={{ label: "Add Habit", onClick: () => setShowNew(true) }} />
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => { const done = todayLogs.has(habit.id);
            return (
              <button key={habit.id} onClick={() => toggleHabit(habit.id)} className={`card-interactive card w-full flex items-center gap-3 ${done ? "neon-outline-teal" : ""}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: done ? "var(--teal)" : "var(--card-soft)", border: done ? "none" : "1px solid var(--border)", boxShadow: done ? "0 0 14px rgba(45,212,191,0.35)" : "none" }}>
                  {done && <svg className="w-4 h-4" fill="none" stroke="#0F1A17" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm font-semibold" style={{ color: done ? "var(--teal)" : "var(--text-primary)" }}>{habit.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
