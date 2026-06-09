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

function WellnessRing({ score, size = 140 }: { score: number; size?: number }) {
  const strokeW = size * 0.08;
  const r = (size - strokeW) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="wellness-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-bg" strokeWidth={strokeW} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          className="ring-fg"
          stroke="url(#wellnessGradient)"
          strokeWidth={strokeW}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="wellnessGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#FFC56B" />
          </linearGradient>
        </defs>
      </svg>
      <div className="wellness-ring-value" style={{ fontSize: size * 0.28 }}>{score}</div>
      <div className="wellness-ring-label" style={{ bottom: `${size * 0.18}px` }}>WELLNESS</div>
    </div>
  );
}

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
        <h2 className="mb-2" style={{ color: "var(--text-primary)" }}>Welcome to Me Body</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Set up your profile to see your personal dashboard.</p>
        <Link href="/onboarding" className="btn btn-primary">Get Started</Link>
      </div>
    );
  }

  const waterPct = Math.min(100, Math.round((waterTotal / targets.waterMl) * 100));
  const hideCalories = profile?.calorieVisibility === "hidden";
  const safetyAlerts = safetyFlags.filter((f: any) => f.riskLevel === "danger" || f.riskLevel === "warning");
  const wellnessScore = Math.min(100, Math.round(
    ((daily.proteinG / (targets.proteinG || 1)) * 35 +
    (daily.calories > 0 ? Math.min(1, daily.calories / (targets.calories || 1)) * 25 : 15) +
    ((waterPct / 100) * 20) +
    (daily.fiberG >= 15 ? 20 : (daily.fiberG / 15) * 20))
  ));

  return (
    <div className="app-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(255,107,61,0.25), rgba(255,197,107,0.18))" }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="var(--gold)" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round">
                <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <span className="text-xs font-bold tracking-tight" style={{ color: "var(--gold)", fontFamily: "Georgia, serif" }}>Me Body</span>
          </div>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
        </div>
        <Link href="/app/settings" className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0" style={{ background: "var(--brand-soft)", color: "var(--brand)", border: "1px solid var(--brand-soft)" }} aria-label="Settings">
          {profile.name.charAt(0).toUpperCase()}
        </Link>
      </div>

      {/* Safety Alerts */}
      {safetyAlerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {safetyAlerts.map((f: any) => (
            <div key={f.id} className="card" style={{ background: "var(--error-soft)", borderColor: "rgba(255,107,107,0.20)" }}>
              <div className="flex items-start gap-2">
                <span className="text-base shrink-0 mt-0.5">&#x26A0;&#xFE0F;</span>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--error)", marginBottom: "0.125rem" }}>Health-aware guidance</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{f.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wellness Score */}
      <div className="card card-glow mb-4" style={{ textAlign: "center" }}>
        <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
          {profile.name.split(" ")[0]}, you&apos;re on fire
        </p>
        <WellnessRing score={wellnessScore} size={140} />
        <p style={{ fontSize: "12px", color: "var(--teal)", marginTop: "0.5rem", fontWeight: 600 }}>
          &#x2191; {wellnessScore > 70 ? "Strong consistency" : "Building momentum"}
        </p>
      </div>

      {/* Macro Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
        {[
          { label: "Calories", current: daily.calories, target: targets.calories, unit: "kcal", color: "var(--calories)" },
          { label: "Protein", current: daily.proteinG, target: targets.proteinG, unit: "g", color: "var(--protein)" },
          { label: "Carbs", current: daily.carbsG, target: targets.carbsG, unit: "g", color: "var(--carbs)" },
          { label: "Fat", current: daily.fatG, target: targets.fatG, unit: "g", color: "var(--fat)" },
        ].map((m) => (
          <div key={m.label} className="card" style={{ background: "var(--card-muted)" }}>
            <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>{m.label}</p>
            <p style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 750, color: m.color, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
              {hideCalories && m.label === "Calories" ? "..." : Math.round(m.current).toLocaleString()}
              <span style={{ fontSize: "clamp(10px, 2vw, 13px)", fontWeight: 500, color: "var(--text-muted)", marginLeft: "3px" }}>
                {hideCalories && m.label === "Calories" ? "" : `/ ${m.target.toLocaleString()} ${m.unit}`}
              </span>
            </p>
            <div className="macro-bar mt-1.5">
              <div className="macro-bar-fill" style={{ width: `${Math.min(100, Math.round((m.current / (m.target || 1)) * 100))}%`, background: m.color, boxShadow: `0 0 8px ${m.color}` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Water + Today's Focus row */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
        <div className="card" style={{ background: "var(--card-muted)" }}>
          <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Water</p>
          <p style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 750, color: "var(--water)", fontVariantNumeric: "tabular-nums" }}>
            {waterTotal}ml
          </p>
          <div className="macro-bar mt-1.5">
            <div className="macro-bar-fill" style={{ width: `${waterPct}%`, background: "var(--water)", boxShadow: "0 0 8px var(--water)" }} />
          </div>
          <div className="flex gap-1.5 mt-2">
            {[250, 500].map((ml) => (
              <button key={ml} onClick={async () => { const { saveWaterLog } = await import("@/db/queries"); await saveWaterLog({ amountMl: ml, loggedAt: new Date().toISOString() }); load(); }}
                className="flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors" style={{ background: "rgba(108,215,255,0.12)", color: "var(--water)" }}>+{ml}ml</button>
            ))}
          </div>
        </div>
        <div className="card" style={{ background: "linear-gradient(135deg, var(--teal-soft), var(--gold-soft))" }}>
          <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Today&apos;s Focus</p>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
            {daily.proteinG < (targets.proteinG * 0.4) ? "Start logging" :
             daily.proteinG < targets.proteinG ? `Hit your protein goal` :
             "Stay consistent"}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.3 }}>
            {daily.proteinG < (targets.proteinG * 0.4) ? "Log your first meal to build momentum." :
             daily.proteinG < targets.proteinG ? `You're ${targets.proteinG - Math.round(daily.proteinG)}g away from your daily protein target.` :
             "Protein is on track. Focus on water and recovery."}
          </p>
        </div>
      </div>

      {/* Coach Insight */}
      {insights.length > 0 && (
        <div className="space-y-2 mb-4">
          {filterBySerenity(insights, hasSafetyConcerns(insights) ? 3 : 1).map((insight: any) => {
            const isDanger = insight.severity === "danger";
            const isWarn = insight.severity === "warning";
            const isPos = insight.severity === "positive";
            const bg = isDanger ? "var(--error-soft)" : isWarn ? "var(--warning-soft)" : isPos ? "var(--success-soft)" : "var(--teal-soft)";
            const color = isDanger ? "var(--error)" : isWarn ? "var(--warning)" : isPos ? "var(--success)" : "var(--teal)";
            const icon = isDanger ? "\u26A0\uFE0F" : isWarn ? "\u26A0" : "\u2728";
            return (
              <div key={insight.id} className="card" style={{ background: bg, borderColor: bg }}>
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color, marginBottom: "0.125rem" }}>{insight.title}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{insight.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Scan", href: "/app/scan", svg: "M12 4v1m6 11h2m-6 0h-2m4 0v-2m-8 2v-2m4 0a4 4 0 11-8 0 4 4 0 018 0z" },
          { label: "Search", href: "/food/search", svg: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
          { label: "Add", href: "/food/manual", svg: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Weight", href: "/app/progress", svg: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
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
          <Link key={a.href} href={a.href} className="text-center py-2.5 rounded-xl text-xs font-semibold transition-colors" style={{ background: "var(--card-muted)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
