"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingState from "@/components/ui/LoadingState";
import { getProfile, getTargets, getFoodLogsForDate, getWaterLogsForDate, getLatestBodyMetric, seedContentItems, seedProvenance } from "@/db/queries";
import { getDb } from "@/db/localDb";
import { calculateDailyNutrition } from "@/lib/calculations";
import { generateInsights, hasSafetyConcerns, filterBySerenity } from "@/lib/coaching";
import { getContraindicationsForProfile } from "@/lib/safety";
import { buildContentItems, buildProvenanceEntries } from "@/lib/contentSeed";
import type { DBProfile, DBTargets } from "@/db/localDb";

function todayStr(): string { return new Date().toISOString().slice(0, 10); }

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [targets, setTargets] = useState<DBTargets | null>(null);
  const [daily, setDaily] = useState({ calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 });
  const [waterTotal, setWaterTotal] = useState(0);
  const [insights, setInsights] = useState<any[]>([]);
  const [latestMetric, setLatestMetric] = useState<any>(null);
  const [safetyFlags, setSafetyFlags] = useState<any[]>([]);

  const load = async () => {
    const p = await getProfile();
    if (!p) { setLoading(false); return; }
    setProfile(p);
    const t = await getTargets(p.id);
    setTargets(t ?? null);
    const date = todayStr();
    const [logs, waters, metric] = await Promise.all([
      getFoodLogsForDate(date),
      getWaterLogsForDate(date),
      getLatestBodyMetric(),
    ]);
    setLatestMetric(metric ?? null);
    setWaterTotal(waters.reduce((s, w) => s + w.amountMl, 0));

    const enriched = await Promise.all(logs.map(async (l) => {
      const food = await (await getDb()).foods.get(l.foodId);
      const f = l.quantityG / 100;
      return { calories: Math.round((food?.caloriesPer100g ?? 0) * f), proteinG: +(food?.proteinPer100g ?? 0) * f, carbsG: +(food?.carbsPer100g ?? 0) * f, fatG: +(food?.fatPer100g ?? 0) * f, fiberG: +(food?.fiberPer100g ?? 0) * f, loggedAt: l.loggedAt };
    }));
    setDaily(calculateDailyNutrition(enriched));

    const yesterdayRaw = new Date(); yesterdayRaw.setDate(yesterdayRaw.getDate() - 1);
    const yesterdayStr = yesterdayRaw.toISOString().slice(0, 10);
    const yesterdayLogs = await getFoodLogsForDate(yesterdayStr);
    const yesterdayEnriched = await Promise.all(yesterdayLogs.map(async (l) => {
      const food = await (await getDb()).foods.get(l.foodId);
      const f = l.quantityG / 100;
      return { calories: Math.round((food?.caloriesPer100g ?? 0) * f), proteinG: +(food?.proteinPer100g ?? 0) * f };
    }));

    const contraindications = getContraindicationsForProfile(p);
    setSafetyFlags(contraindications);

    const coachInsights = generateInsights({
      profile: p,
      todayLogs: enriched,
      todayWaterMl: waters.reduce((s, w) => s + w.amountMl, 0),
      weightLogs: metric?.weightKg ? [{ weightKg: metric.weightKg, recordedAt: metric.recordedAt }] : [],
      sleepHours: metric?.sleepHours,
      steps: metric?.steps,
      mood1To5: metric?.mood1To5,
      loggedDaysThisWeek: logs.length > 0 ? 1 : 0,
      yesterdayLogs: yesterdayEnriched,
      mealCount: logs.length,
      targets: t ?? undefined,
    });
    setInsights(coachInsights);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    seedContentItems(buildContentItems()).catch(() => {});
    seedProvenance(buildProvenanceEntries()).catch(() => {});
  }, []);

  if (loading) return <div style={{ background: "var(--background)", minHeight: "100vh" }}><LoadingState /></div>;

  if (!profile || !targets) {
    return (
      <div className="app-container text-center" style={{ paddingTop: "3rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Welcome to Me Body</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Set up your profile to see your personal dashboard.</p>
        <Link href="/onboarding" className="inline-flex px-6 py-3.5 rounded-[var(--radius-button)] font-semibold text-white" style={{ background: "var(--brand)" }}>Get Started</Link>
      </div>
    );
  }

  const waterPct = Math.min(100, Math.round((waterTotal / targets.waterMl) * 100));
  const hideCalories = profile?.calorieVisibility === "hidden";
  const safetyAlerts = safetyFlags.filter((f: any) => f.riskLevel === "danger" || f.riskLevel === "warning");

  return (
    <div className="app-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Today</p>
          <h2 style={{ fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 700, color: "var(--text-primary)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </h2>
        </div>
        <Link href="/app/settings" className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0" style={{ background: "var(--brand-soft)", color: "var(--brand)" }} aria-label="Settings">
          {profile.name.charAt(0).toUpperCase()}
        </Link>
      </div>

      {/* Safety Alerts */}
      {safetyAlerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {safetyAlerts.map((f: any) => (
            <div key={f.id} className="card" style={{ background: "var(--ember-soft)", borderColor: "var(--ember-soft)" }}>
              <div className="flex items-start gap-2">
                <span className="text-base shrink-0 mt-0.5" style={{ color: "var(--ember)" }}>&#x26A0;&#xFE0F;</span>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--ember)", marginBottom: "0.125rem" }}>Health-aware guidance</p>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{f.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Body Score Card */}
      <div className="card mb-4" style={{ background: "linear-gradient(135deg, var(--card) 0%, var(--background-soft) 100%)" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem" }}>Today&apos;s Nutrition</p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
            {[
            { label: "Calories", current: daily.calories, target: targets.calories, unit: "kcal", color: "var(--calories)", bg: "rgba(47,111,94,0.07)" },
            { label: "Protein", current: daily.proteinG, target: targets.proteinG, unit: "g", color: "var(--protein)", bg: "rgba(59,130,160,0.07)" },
            { label: "Carbs", current: daily.carbsG, target: targets.carbsG, unit: "g", color: "var(--carbs)", bg: "rgba(217,130,75,0.07)" },
            { label: "Fat", current: daily.fatG, target: targets.fatG, unit: "g", color: "var(--fat)", bg: "rgba(200,169,106,0.07)" },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl p-2.5 sm:p-3.5" style={{ background: m.bg }}>
                <p style={{ fontSize: "9px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.125rem" }}>{m.label}</p>
                <p style={{ fontSize: "clamp(16px, 4vw, 22px)", fontWeight: 700, color: m.color, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
                  {hideCalories ? (m.label === "Calories" ? "..." : Math.round(m.current)) : Math.round(m.current)}
                  <span style={{ fontSize: "clamp(10px, 2vw, 13px)", fontWeight: 500, color: "var(--text-muted)", marginLeft: "2px" }}>
                    {hideCalories ? (m.label === "Calories" ? "" : `/${m.target} ${m.unit}`) : `/${m.target} ${m.unit}`}
                  </span>
                </p>
                <div className="macro-bar mt-1.5">
                  <div className="macro-bar-fill" style={{ width: `${Math.min(100, Math.round((m.current / (m.target || 1)) * 100))}%`, background: m.color }} />
                </div>
              </div>
            ))}
        </div>

        {/* Water */}
        <div className="rounded-2xl p-2.5 sm:p-3.5" style={{ background: "rgba(79,157,184,0.07)" }}>
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: "9px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Water</span>
            <span style={{ fontSize: "13px", fontWeight: 650, color: "var(--water)", fontVariantNumeric: "tabular-nums" }}>
              {waterTotal}<span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)" }}>/ {targets.waterMl}ml</span>
            </span>
          </div>
          <div className="macro-bar mb-2">
            <div className="macro-bar-fill" style={{ width: `${waterPct}%`, background: "var(--water)" }} />
          </div>
          <div className="flex gap-2">
            {[250, 500].map((ml) => (
              <button key={ml} onClick={async () => { const { saveWaterLog } = await import("@/db/queries"); await saveWaterLog({ amountMl: ml, loggedAt: new Date().toISOString() }); load(); }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors" style={{ background: "rgba(79,157,184,0.12)", color: "var(--water)" }}>+{ml}ml</button>
            ))}
          </div>
        </div>
      </div>

      {/* Coach */}
      {insights.length > 0 && (
        <div className="space-y-2 mb-4">
          {filterBySerenity(insights, hasSafetyConcerns(insights) ? 3 : 1).map((insight: any) => {
            const sevBg = insight.severity === "danger" ? "var(--error-soft)" : insight.severity === "warning" ? "var(--warning-soft)" : insight.severity === "positive" ? "var(--success-soft)" : "var(--brand-soft)";
            const sevColor = insight.severity === "danger" ? "var(--error)" : insight.severity === "warning" ? "var(--warning)" : insight.severity === "positive" ? "var(--success)" : "var(--brand-dark)";
            const sevBodyColor = insight.severity === "danger" ? "var(--error)" : insight.severity === "warning" ? "var(--warning)" : insight.severity === "positive" ? "var(--success)" : "var(--brand)";
            const icon = insight.severity === "danger" ? "\u26A0\uFE0F" : insight.severity === "warning" ? "\u26A0" : insight.severity === "positive" ? "\u2728" : "\u2728";
            return (
              <div key={insight.id} className="card" style={{ background: sevBg, borderColor: sevBg }}>
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0 mt-0.5" style={{ color: sevColor }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: sevColor, marginBottom: "0.125rem" }}>{insight.title}</p>
                    <p style={{ fontSize: "12px", color: sevBodyColor }}>{insight.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions — 4 columns on mobile */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Scan", href: "/app/scan", svg: "M12 4v1m6 11h2m-6 0h-2m4 0v-2m-8 2v-2m4 0a4 4 0 11-8 0 4 4 0 018 0z" },
          { label: "Search", href: "/food/search", svg: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
          { label: "Add", href: "/food/manual", svg: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Weight", href: "/app/progress", svg: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-shadow" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand)" }}>
              <path d={a.svg} />
            </svg>
            <span style={{ fontSize: "9px", fontWeight: 600, color: "var(--text-secondary)" }}>{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Water", href: "/app/water" },
          { label: "Habits", href: "/app/habits" },
          { label: "Workout", href: "/workout" },
          { label: "Coach", href: "/app/coach" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="text-center py-2.5 rounded-xl text-xs font-semibold transition-colors" style={{ background: "var(--card-muted)", color: "var(--text-secondary)" }}>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
