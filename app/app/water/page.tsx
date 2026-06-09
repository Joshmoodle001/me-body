"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import { getProfile, getTargets, saveWaterLog, getWaterLogsForDate, deleteWaterLog } from "@/db/queries";
import type { DBWaterLog, DBProfile, DBTargets } from "@/db/localDb";

function todayStr(): string { return new Date().toISOString().slice(0, 10); }

export default function WaterPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [targets, setTargets] = useState<DBTargets | null>(null);
  const [logs, setLogs] = useState<DBWaterLog[]>([]);
  const [customMl, setCustomMl] = useState("");

  const load = async () => {
    const p = await getProfile(); setProfile(p ?? null);
    if (p) { const t = await getTargets(p.id); setTargets(t ?? null); }
    const wLogs = await getWaterLogsForDate(todayStr()); setLogs(wLogs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addWater = async (ml: number) => { await saveWaterLog({ amountMl: ml, loggedAt: new Date().toISOString() }); load(); };

  const totalWater = logs.reduce((s, l) => s + l.amountMl, 0);
  const targetMl = targets?.waterMl ?? 2500;
  const pct = Math.min(100, Math.round((totalWater / targetMl) * 100));

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--background)" }}><LoadingState /></div>;

  return (
    <div className="app-container">
      <PageHeader title="Water" subtitle={todayStr()} />

      <div className="card mb-6" style={{ background: "linear-gradient(135deg, rgba(79,157,184,0.06), rgba(79,157,184,0.02))" }}>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(79,157,184,0.12)" }}>
            <span className="text-2xl font-bold" style={{ color: "var(--water)" }}>{pct}%</span>
          </div>
          <div className="flex-1">
            <div className="macro-bar mb-1.5">
              <div className="macro-bar-fill" style={{ width: `${pct}%`, background: "var(--water)" }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-semibold" style={{ color: "var(--water)" }}>{totalWater}ml</span>
              <span style={{ color: "var(--text-muted)" }}>{targetMl}ml</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[250, 350, 500, 750].map((ml) => (
          <button key={ml} onClick={() => addWater(ml)} className="card text-center py-3.5 font-semibold text-sm transition-all hover:shadow-lg" style={{ color: "var(--water)", borderColor: "var(--border)", background: "var(--card)" }}>
            +{ml}ml
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); const ml = Number(customMl); if (ml > 0 && ml <= 5000) { addWater(ml); setCustomMl(""); } }} className="flex gap-2 mb-6">
        <input type="text" inputMode="numeric" value={customMl} onChange={(e) => setCustomMl(e.target.value.replace(/\D/g,""))} placeholder="Custom amount (ml)" className="input flex-1" />
        <button type="submit" disabled={!customMl} className="px-6 py-3 rounded-[var(--radius-button)] font-semibold text-sm text-white transition-opacity" style={{ background: "var(--water)", opacity: customMl ? 1 : 0.5 }}>Add</button>
      </form>

      {logs.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>Today&apos;s logs</p>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between card px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-base">💧</span>
                  <span className="font-semibold text-sm tabular-nums" style={{ color: "var(--text-primary)" }}>{log.amountMl}ml</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(log.loggedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <button onClick={async () => { await deleteWaterLog(log.id); load(); }} className="p-1 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }} aria-label="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
