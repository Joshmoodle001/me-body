"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import { getProfile, getTargets, saveWaterLog, getWaterLogsForDate, deleteWaterLog } from "@/db/queries";
import type { DBWaterLog, DBProfile, DBTargets } from "@/db/localDb";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const QUICK_AMOUNTS = [250, 350, 500, 750];

export default function WaterPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [targets, setTargets] = useState<DBTargets | null>(null);
  const [logs, setLogs] = useState<DBWaterLog[]>([]);
  const [customMl, setCustomMl] = useState("");

  const load = async () => {
    const p = await getProfile();
    setProfile(p ?? null);
    if (p) {
      const t = await getTargets(p.id);
      setTargets(t ?? null);
    }
    const date = todayStr();
    const wLogs = await getWaterLogsForDate(date);
    setLogs(wLogs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addWater = async (ml: number) => {
    await saveWaterLog({ amountMl: ml, loggedAt: new Date().toISOString() });
    load();
  };

  const handleCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const ml = Number(customMl);
    if (ml > 0 && ml <= 5000) {
      addWater(ml);
      setCustomMl("");
    }
  };

  const totalWater = logs.reduce((s, l) => s + l.amountMl, 0);
  const targetMl = targets?.waterMl ?? 2500;
  const pct = Math.min(100, Math.round((totalWater / targetMl) * 100));

  if (loading) return <div className="min-h-screen bg-stone-50"><LoadingState /></div>;

  return (
    <div className="p-6 pb-8">
      <PageHeader title="Water" subtitle={todayStr()} />

      <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">{pct}%</span>
          </div>
          <div className="flex-1">
            <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-sm">
              <span className="text-stone-500">{totalWater}ml</span>
              <span className="text-stone-400">{targetMl}ml</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-stone-500 text-center">Default target: ~35ml per kg body weight</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {QUICK_AMOUNTS.map((ml) => (
          <button key={ml} onClick={() => addWater(ml)} className="py-4 bg-white border border-stone-200 rounded-xl font-medium text-stone-700 hover:border-blue-400 hover:bg-blue-50 transition-colors">
            +{ml}ml
          </button>
        ))}
      </div>

      <form onSubmit={handleCustom} className="flex gap-2 mb-6">
        <input type="number" value={customMl} onChange={(e) => setCustomMl(e.target.value)} placeholder="Custom amount (ml)" min={50} max={5000} className="flex-1 px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" disabled={!customMl} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-stone-300 transition-colors">Add</button>
      </form>

      {logs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stone-500 uppercase">Today&apos;s logs</h3>
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between bg-white rounded-xl border border-stone-200 p-3">
              <div className="flex items-center gap-3">
                <span className="text-blue-500">&#x1F4A7;</span>
                <span className="font-medium text-stone-900">{log.amountMl}ml</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">{new Date(log.loggedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <button onClick={async () => { await deleteWaterLog(log.id); load(); }} className="text-red-500 hover:text-red-700 p-1" aria-label="Delete water log">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
