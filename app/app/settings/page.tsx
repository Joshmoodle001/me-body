"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import { getProfile, clearAllData } from "@/db/queries";
import type { DBProfile } from "@/db/localDb";

export default function SettingsPage() {
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getProfile().then((p) => { setProfile(p ?? null); setLoading(false); }); }, []);

  const handleClear = async () => {
    if (window.confirm("Delete ALL local data? This cannot be undone.")) { await clearAllData(); window.location.href = "/onboarding"; }
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--background)" }}><LoadingState /></div>;

  return (
    <div className="app-container">
      <PageHeader title="Settings" />

      <div className="space-y-4">
        {profile && (
          <div className="card card-glow-ember animate-neon-pulse-ember" style={{ textAlign: "center" }}>
            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-xl font-bold mb-3" style={{ background: "var(--brand-soft)", color: "var(--brand)", border: "2px solid var(--brand-soft)", boxShadow: "0 0 18px rgba(255,107,61,0.20)" }}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{profile.name}</p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "0.25rem" }}>Goal: {profile.goalType.replace(/_/g, " ")}</p>
            <Link href="/settings/targets" className="text-sm font-semibold mt-2 inline-block" style={{ color: "var(--gold)" }}>Edit Targets &rarr;</Link>
          </div>
        )}

        {!profile && (
          <Link href="/onboarding" className="card block text-center">
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>Set Up Profile</p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Complete onboarding to calculate your targets</p>
          </Link>
        )}

        <div className="overflow-hidden" style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--border)", background: "var(--card)" }}>
          {[
            { href: "/settings/targets", label: "Nutrition Targets", desc: "Edit your calorie and macro targets" },
            { href: "/settings/privacy", label: "Privacy", desc: "How your data is handled" },
            { href: "/settings/data", label: "Data", desc: "Export, import, or delete your data" },
            { href: "/settings/sync", label: "Sync", desc: "Cloud sync (coming soon)" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center justify-between px-5 py-4 transition-colors" style={{ borderBottom: "1px solid var(--border)" }}>
              <div><p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.label}</p><p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.desc}</p></div>
              <span style={{ color: "var(--text-muted)" }}>&rarr;</span>
            </Link>
          ))}
        </div>

        <button onClick={handleClear} className="w-full py-3.5 rounded-[var(--radius-button)] font-semibold text-sm transition-colors" style={{ background: "var(--error-soft)", color: "var(--error)" }}>
          Delete All Local Data
        </button>

        <p className="text-center" style={{ fontSize: "12px", color: "var(--text-muted)" }}>Midnight Ember &middot; Me Body v0.1.0 &middot; Not medical advice</p>
      </div>
    </div>
  );
}
