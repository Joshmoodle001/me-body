"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { getBodyMetrics, getProfile, getTargets, saveBodyMetric } from "@/db/queries";
import { calculateWeightTrend } from "@/lib/calculations";
import type { DBBodyMetric, DBProfile, DBTargets } from "@/db/localDb";

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
    setProfile(p ?? null);
    setLoading(false);
  };

  useEffect(() => { loadMetrics(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight && !waist && !sleep) return;
    setSaving(true);
    const latest = metrics.length > 0 ? metrics[metrics.length - 1] : null;
    await saveBodyMetric({
      weightKg: weight ? Number(weight) : latest?.weightKg ?? undefined,
      waistCm: waist ? Number(waist) : latest?.waistCm ?? undefined,
      sleepHours: sleep ? Number(sleep) : latest?.sleepHours ?? undefined,
      mood1To5: mood,
      steps: steps ? Number(steps) : latest?.steps ?? undefined,
      recordedAt: new Date().toISOString(),
    });
    setShowForm(false);
    setWeight("");
    setWaist("");
    setSleep("");
    setSteps("");
    await loadMetrics();
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-stone-50"><LoadingState /></div>;

  const weightData = metrics.filter((m) => m.weightKg != null).map((m) => ({ weightKg: m.weightKg!, recordedAt: m.recordedAt }));
  const trend = calculateWeightTrend(weightData);
  const latest = metrics.length > 0 ? metrics[metrics.length - 1] : null;

  return (
    <div className="p-6 pb-8">
      <PageHeader title="Progress" subtitle="Your trends over time">
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">+ Log</button>
      </PageHeader>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Log Body Metrics</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pmWeight" className="block text-sm font-medium text-stone-700 mb-1">Weight (kg)</label>
                  <input id="pmWeight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={latest?.weightKg?.toString() ?? ""} step={0.1} min={20} max={400} className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label htmlFor="pmWaist" className="block text-sm font-medium text-stone-700 mb-1">Waist (cm)</label>
                  <input id="pmWaist" type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder={latest?.waistCm?.toString() ?? ""} step={0.1} min={30} max={200} className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label htmlFor="pmSleep" className="block text-sm font-medium text-stone-700 mb-1">Sleep (hours)</label>
                  <input id="pmSleep" type="number" value={sleep} onChange={(e) => setSleep(e.target.value)} placeholder={latest?.sleepHours?.toString() ?? ""} step={0.5} min={0} max={24} className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label htmlFor="pmSteps" className="block text-sm font-medium text-stone-700 mb-1">Steps</label>
                  <input id="pmSteps" type="number" value={steps} onChange={(e) => setSteps(e.target.value)} placeholder={latest?.steps?.toString() ?? ""} min={0} className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label htmlFor="pmMood" className="block text-sm font-medium text-stone-700 mb-1">Mood (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setMood(n)} className={`flex-1 py-3 rounded-xl border-2 text-lg transition-colors ${mood === n ? "border-green-600 bg-green-50" : "border-stone-200 bg-white hover:border-stone-300"}`}>
                      {n === 1 ? "😞" : n === 2 ? "😕" : n === 3 ? "😐" : n === 4 ? "🙂" : "😊"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {metrics.length === 0 ? (
        <EmptyState title="No metrics yet" description="Log your weight and measurements to see trends." action={{ label: "Log First Entry", onClick: () => setShowForm(true) }} />
      ) : (
        <div className="space-y-4">
          {latest?.weightKg && (
            <div className="bg-white rounded-xl p-5 border border-stone-200">
              <h2 className="font-semibold text-stone-900 mb-3">Weight Trend</h2>
              <p className="text-3xl font-bold text-stone-900 mb-1">{latest.weightKg} <span className="text-lg font-normal text-stone-500">kg</span></p>
              {trend.direction !== "not_enough_data" && (
                <p className="text-sm text-stone-500">
                  {trend.direction === "decreasing" ? "Decreasing" : trend.direction === "increasing" ? "Increasing" : "Stable"}
                  {" "}by {Math.abs(trend.changeKg)}kg over {trend.days} days
                </p>
              )}
              {profile?.goalWeightKg && <p className="text-xs text-stone-400 mt-1">Goal: {profile.goalWeightKg} kg</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {latest?.waistCm != null && (
              <div className="bg-white rounded-xl p-4 border border-stone-200 text-center">
                <p className="text-xs text-stone-500">Waist</p>
                <p className="text-2xl font-bold text-stone-900">{latest.waistCm}</p>
                <p className="text-xs text-stone-400">cm</p>
              </div>
            )}
            {latest?.sleepHours != null && (
              <div className="bg-white rounded-xl p-4 border border-stone-200 text-center">
                <p className="text-xs text-stone-500">Sleep</p>
                <p className="text-2xl font-bold text-stone-900">{latest.sleepHours}</p>
                <p className="text-xs text-stone-400">hours</p>
              </div>
            )}
            {latest?.steps != null && (
              <div className="bg-white rounded-xl p-4 border border-stone-200 text-center">
                <p className="text-xs text-stone-500">Steps</p>
                <p className="text-2xl font-bold text-stone-900">{latest.steps.toLocaleString()}</p>
              </div>
            )}
            {latest?.mood1To5 != null && (
              <div className="bg-white rounded-xl p-4 border border-stone-200 text-center">
                <p className="text-xs text-stone-500">Mood</p>
                <p className="text-2xl font-bold text-stone-900">{["", "😞", "😕", "😐", "🙂", "😊"][latest.mood1To5]}</p>
                <p className="text-xs text-stone-400">{latest.mood1To5}/5</p>
              </div>
            )}
          </div>

          <p className="text-xs text-stone-400 text-center">
            {metrics.length} entries tracked. More charts coming in v1.1.
          </p>
        </div>
      )}
    </div>
  );
}
