import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "You are offline | Me Body" };

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--background)" }}>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "var(--warning-soft)" }}>
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: "var(--warning)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414" />
          </svg>
        </div>
        <h1 className="mb-2" style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)" }}>You are offline</h1>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Your core data is stored locally. You can still view your dashboard, food logs, water, weight, habits, and workouts.</p>
        <Link href="/app" className="block w-full py-3.5 rounded-[var(--radius-button)] font-semibold text-center text-white mb-3" style={{ background: "var(--brand)" }}>Go to Dashboard</Link>
        <Link href="/app/log" className="block w-full py-3.5 rounded-[var(--radius-button)] font-semibold text-center" style={{ background: "var(--card-muted)", color: "var(--text-secondary)" }}>View Food Log</Link>
      </div>
    </div>
  );
}
