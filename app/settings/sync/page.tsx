"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { fullSync, getSyncStatus, pushToCloud, pullFromCloud } from "@/lib/syncEngine";
import { createClient } from "@/lib/supabase/client";

export default function SyncSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ lastPushedAt: string | null; lastPulledAt: string | null }>({ lastPushedAt: null, lastPulledAt: null });
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (u) {
        const s = await getSyncStatus();
        setStatus(s);
      }
    })();
  }, []);

  const handleSync = async () => {
    setLoading(true); setResult(null);
    const r = await fullSync();
    setResult(`Pushed ${r.pushed} records, pulled ${r.pulled} records.${r.error ? ` Error: ${r.error}` : ""}`);
    const s = await getSyncStatus();
    setStatus(s);
    setLoading(false);
  };

  const handlePush = async () => {
    setLoading(true); setResult(null);
    const r = await pushToCloud();
    setResult(`Pushed ${r.pushed} records.${r.error ? ` Error: ${r.error}` : ""}`);
    const s = await getSyncStatus();
    setStatus(s);
    setLoading(false);
  };

  const handlePull = async () => {
    setLoading(true); setResult(null);
    const r = await pullFromCloud();
    setResult(`Pulled ${r.pulled} records.${r.error ? ` Error: ${r.error}` : ""}`);
    const s = await getSyncStatus();
    setStatus(s);
    setLoading(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="app-container">
      <PageHeader title="Sync" subtitle="Cloud backup and multi-device sync" />

      <div className="space-y-4">
        <div className="card" style={{ background: "var(--card-muted)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {user ? `Signed in as ${user.email}` : "Not signed in"}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Your data stays local by default. Sync only when you choose to.
          </p>
        </div>

        {user && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center" style={{ background: "var(--card-muted)" }}>
                <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--text-muted)" }}>Last Push</p>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {status.lastPushedAt ? new Date(status.lastPushedAt).toLocaleDateString() : "Never"}
                </p>
              </div>
              <div className="card text-center" style={{ background: "var(--card-muted)" }}>
                <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--text-muted)" }}>Last Pull</p>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {status.lastPulledAt ? new Date(status.lastPulledAt).toLocaleDateString() : "Never"}
                </p>
              </div>
            </div>

            {result && (
              <div className="p-3 rounded-xl text-sm" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
                {result}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <button onClick={handleSync} disabled={loading} className="btn btn-primary w-full">
                {loading ? "Syncing..." : "Full Sync (Push & Pull)"}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handlePush} disabled={loading} className="btn btn-secondary">Push to Cloud</button>
                <button onClick={handlePull} disabled={loading} className="btn btn-secondary">Pull from Cloud</button>
              </div>
            </div>
          </>
        )}

        {user && (
          <div className="card" style={{ background: "var(--card-muted)" }}>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Account</p>
            <button onClick={handleSignOut} className="btn btn-secondary w-full">Sign Out</button>
          </div>
        )}

        <div className="card" style={{ background: "var(--card-muted)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Your data is stored locally on this device by default. Cloud sync lets you back up your progress and use Me Body across multiple devices. Synced data is encrypted in transit and stored in a private Supabase database you control.
          </p>
        </div>
      </div>
    </div>
  );
}
