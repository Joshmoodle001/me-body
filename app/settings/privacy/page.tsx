import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy | Me Body" };

export default function PrivacyPage() {
  return (
    <div className="p-6 pb-8 max-w-md mx-auto">
      <Link href="/app/settings" className="text-green-600 text-sm font-medium mb-4 inline-block hover:underline">&larr; Back to Settings</Link>
      <h1 className="text-2xl font-bold text-stone-900 mb-4">Privacy</h1>

      <div className="space-y-4 text-sm text-stone-600">
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <h2 className="font-semibold text-stone-900 mb-2">Your data is local-first</h2>
          <p>All your tracking data — profile, food logs, body metrics, habits, workouts — is stored on your device using IndexedDB. Nothing leaves your device unless you explicitly choose to export or sync.</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <h2 className="font-semibold text-stone-900 mb-2">No ads, no tracking</h2>
          <p>Me Body has no ads. We do not use third-party analytics, tracking pixels, or advertising SDKs. Your health data is never sold or shared.</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <h2 className="font-semibold text-stone-900 mb-2">Food search</h2>
          <p>When you search for foods or scan barcodes, your query is sent to Open Food Facts or USDA FoodData Central to look up nutrition data. These are free public databases. No account or personal information is shared.</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <h2 className="font-semibold text-stone-900 mb-2">Cloud sync (future)</h2>
          <p>Optional cloud sync may be added in a future version. If enabled, encrypted data will sync between your devices. You will always be able to use the app without an account. Local data remains the source of truth.</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <h2 className="font-semibold text-stone-900 mb-2">App is not medical advice</h2>
          <p>Me Body provides general wellness and nutrition tracking tools. It is not medical advice, diagnosis, or treatment. Speak to a qualified healthcare professional before making major diet, exercise, or health changes.</p>
        </div>
      </div>
    </div>
  );
}
