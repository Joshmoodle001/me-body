"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { getHabits, saveHabit, saveHabitLog } from "@/db/queries";
import { getFoodLogsForDate } from "@/db/queries";
import type { DBHabit, DBHabitLog } from "@/db/localDb";
import { db } from "@/db/localDb";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function HabitTrackerPage() {
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<DBHabit[]>([]);
  const [todayLogs, setTodayLogs] = useState<Map<string, DBHabitLog>>(new Map());
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");

  const load = async () => {
    const h = await getHabits();
    setHabits(h);
    const date = todayStr();
    const logs = await db.habitLogs.filter((l) => l.completedAt >= `${date}T00:00:00.000Z` && l.completedAt <= `${date}T23:59:59.999Z` && !l.deletedAt).toArray();
    const map = new Map<string, DBHabitLog>();
    logs.forEach((l) => map.set(l.habitId, l));
    setTodayLogs(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleHabit = async (habitId: string) => {
    if (todayLogs.has(habitId)) {
      const log = todayLogs.get(habitId)!;
      await db.habitLogs.update(log.id, { deletedAt: new Date().toISOString() });
    } else {
      await saveHabitLog({ habitId, completedAt: new Date().toISOString(), notes: "" });
    }
    const date = todayStr();
    const logs = await db.habitLogs.filter((l) => l.completedAt >= `${date}T00:00:00.000Z` && l.completedAt <= `${date}T23:59:59.999Z` && !l.deletedAt).toArray();
    const map = new Map<string, DBHabitLog>();
    logs.forEach((l) => map.set(l.habitId, l));
    setTodayLogs(map);
  };

  const addHabit = async () => {
    if (!newName.trim()) return;
    await saveHabit({ name: newName.trim(), targetFrequency: "daily" });
    setNewName("");
    setShowNew(false);
    load();
  };

  if (loading) return <div className="min-h-screen bg-stone-50"><LoadingState message="Loading habits..." /></div>;

  return (
    <div className="p-6 pb-8">
      <PageHeader title="Habits" subtitle="Build daily consistency">
        <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">+ New</button>
      </PageHeader>

      {showNew && (
        <div className="mb-4 bg-white rounded-xl border border-stone-200 p-4 animate-fade-in">
          <label htmlFor="hName" className="block text-sm font-medium text-stone-700 mb-1">Habit name</label>
          <div className="flex gap-2">
            <input id="hName" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Drink water, stretch, read..." className="flex-1 px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500" autoFocus />
            <button onClick={addHabit} disabled={!newName.trim()} className="px-5 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:bg-stone-300 transition-colors">Add</button>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <EmptyState title="No habits yet" description="Create your first habit to start tracking daily consistency." action={{ label: "Add Habit", onClick: () => setShowNew(true) }} />
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => {
            const done = todayLogs.has(habit.id);
            return (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`w-full flex items-center justify-between bg-white rounded-xl border p-4 transition-colors hover:shadow-sm ${done ? "border-green-300 bg-green-50" : "border-stone-200"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${done ? "bg-green-600 border-green-600" : "border-stone-300"}`}>
                    {done && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`font-medium text-sm ${done ? "text-green-800" : "text-stone-900"}`}>{habit.name}</span>
                </div>
                <span className="text-xs text-stone-400 capitalize">{habit.targetFrequency}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
