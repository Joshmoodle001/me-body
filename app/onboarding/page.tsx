import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Welcome | Me Body" };

export default function OnboardingStart() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--background)" }}>
      <div className="max-w-md text-center">
        <h1 className="mb-3" style={{ fontSize: "36px", fontWeight: 750, letterSpacing: "-0.04em", lineHeight: 1.15, color: "var(--text-primary)" }}>Welcome to Me Body</h1>
        <p style={{ fontSize: "16px", color: "var(--text-secondary)", marginBottom: "2rem" }}>Privacy-first body intelligence, nutrition, habits, and progress tracking.</p>
        <div className="text-left space-y-4 mb-8">
          {[
            { title: "Your data stays local", desc: "Nothing leaves your device unless you choose to sync." },
            { title: "No ads, no paywalls", desc: "Core features including barcode scanning are all free." },
            { title: "Evidence-based targets", desc: "Calculated using Mifflin-St Jeor, then you adjust." },
            { title: "Shame-free coaching", desc: "Gentle insights, not guilt-based streaks." },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="shrink-0 mt-0.5 text-lg font-bold" style={{ color: "var(--brand)" }}>&#10003;</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "1.5rem" }}>This app is not medical advice.</p>
        <Link href="/onboarding/goals" className="block w-full py-3.5 rounded-[var(--radius-button)] font-semibold text-center text-white" style={{ background: "var(--brand)" }}>Get Started</Link>
      </div>
    </div>
  );
}
