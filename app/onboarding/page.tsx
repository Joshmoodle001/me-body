import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Welcome | Me Body" };

export default function OnboardingStart() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 text-center">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Welcome to Me Body</h1>
        <p className="text-stone-600 mb-8">Privacy-first body intelligence, nutrition, habits, and progress tracking.</p>

        <div className="space-y-4 mb-8 text-left">
          {[
            { title: "Your data stays local", desc: "Nothing leaves your device unless you choose to sync." },
            { title: "No ads, no paywalls", desc: "Core features including barcode scanning are all free." },
            { title: "Evidence-based targets", desc: "Calculated using Mifflin-St Jeor, then you adjust." },
            { title: "Shame-free coaching", desc: "Gentle insights, not guilt-based streaks." },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="text-green-600 text-lg shrink-0">&#10003;</span>
              <div>
                <p className="font-semibold text-stone-900 text-sm">{item.title}</p>
                <p className="text-stone-500 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-stone-500 text-xs mb-6">This app is not medical advice. Speak to a qualified professional before making major changes.</p>

        <Link href="/onboarding/goals" className="block w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold text-center hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Get Started</Link>
      </div>
    </div>
  );
}
