import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sync | Me Body" };

export default function SyncSettingsPage() {
  return (
    <div className="p-6 pb-8 max-w-md mx-auto">
      <Link href="/app/settings" className="text-green-600 text-sm font-medium mb-4 inline-block hover:underline">&larr; Back to Settings</Link>
      <h1 className="text-2xl font-bold text-stone-900 mb-4">Sync</h1>

      <div className="bg-white rounded-xl p-5 border border-stone-200 mb-4">
        <h2 className="font-semibold text-stone-900 mb-2">Local-first by design</h2>
        <p className="text-sm text-stone-500 mb-3">All your data is stored on your device. You can use Me Body fully offline without an account. Export your data as JSON for backup.</p>
        <Link href="/settings/data" className="text-green-600 text-sm font-medium hover:underline">Manage Data &rarr;</Link>
      </div>

      <div className="bg-white rounded-xl p-5 border border-stone-200 mb-4">
        <h2 className="font-semibold text-stone-900 mb-2">Optional Account Sync</h2>
        <p className="text-sm text-stone-500 mb-3">Cloud sync with encrypted backup is planned for a future update. It will be completely optional. The app will always work without an account.</p>
        <div className="bg-stone-100 rounded-lg px-4 py-3 text-center">
          <p className="text-sm text-stone-500">Coming in v1.3</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-stone-200">
        <h2 className="font-semibold text-stone-900 mb-2">What sync will do</h2>
        <ul className="list-disc list-inside text-sm text-stone-500 space-y-1">
          <li>Encrypted backup of your logs and settings</li>
          <li>Sync across your devices (phone, tablet, desktop)</li>
          <li>Restore from backup if you switch devices</li>
          <li>Share verified foods with the community (optional)</li>
        </ul>
      </div>
    </div>
  );
}
