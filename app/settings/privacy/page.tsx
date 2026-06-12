import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy | Me Body" };

export default function PrivacyPage() {
  return (
    <div className="app-container max-w-md mx-auto">
      <Link href="/app/settings" className="text-sm font-semibold mb-4 inline-block" style={{ color: "var(--brand)" }}>&larr; Back to Settings</Link>
      <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>Privacy</h1>
      <div className="space-y-4">
        {[
          { title: "Your data is local-first", body: "All your tracking data — profile, food logs, body metrics, habits, workouts — is stored on your device using IndexedDB. Nothing leaves your device unless you choose to export or sync." },
          { title: "No ads, no tracking", body: "Me Body has no ads. We do not use third-party analytics, tracking pixels, or advertising SDKs. Your health data is never sold or shared." },
          { title: "Food search", body: "When you search for foods or scan barcodes, your query is sent to Open Food Facts or USDA FoodData Central. These are free public databases. No personal information is shared." },
          { title: "Cloud sync (future)", body: "Optional cloud sync may be added in a future version. You will always be able to use the app without an account. Local data remains the source of truth." },
          { title: "App is not medical advice", body: "Me Body provides general wellness and nutrition tracking tools. It is not medical advice, diagnosis, or treatment. Speak to a qualified healthcare professional before making major changes." },
        ].map((item) => (
          <div key={item.title} className="card">
            <h2 className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>{item.title}</h2>
            <p style={{ fontSize: "14px", lineHeight: "22px", color: "var(--text-secondary)" }}>{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
