import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sync | Me Body" };

export default function SyncSettingsPage() {
  return (
    <div className="app-container max-w-md mx-auto">
      <Link href="/app/settings" className="text-sm font-semibold mb-4 inline-block" style={{ color: "var(--brand)" }}>&larr; Back</Link>
      <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>Sync</h1>

      <div className="space-y-4">
        <div className="card">
          <h2 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>Local-first by design</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "0.75rem" }}>All your data is stored on your device. You can use Me Body fully offline without an account.</p>
          <Link href="/settings/data" className="text-sm font-semibold" style={{ color: "var(--brand)" }}>Manage Data &rarr;</Link>
        </div>

        <div className="card">
          <h2 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>Optional Account Sync</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Cloud sync with encrypted backup is planned. It will be completely optional.</p>
          <div className="rounded-xl px-4 py-3 text-center" style={{ background: "var(--card-muted)" }}><p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Coming in v1.3</p></div>
        </div>

        <div className="card">
          <h2 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>What sync will do</h2>
          <ul className="list-disc list-inside space-y-1" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            <li>Encrypted backup of your logs and settings</li>
            <li>Sync across your devices</li>
            <li>Restore from backup if you switch devices</li>
            <li>Share verified foods (optional)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
