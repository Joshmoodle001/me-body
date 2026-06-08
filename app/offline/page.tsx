import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "You are offline | Me Body" };

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">You are offline</h1>
        <p className="text-stone-600 mb-6">Your core data is stored locally. You can still view your dashboard, food logs, water, weight, habits, and workouts.</p>
        <Link href="/app" className="block w-full py-3 px-6 bg-green-600 text-white rounded-xl font-semibold text-center mb-3 hover:bg-green-700">Go to Dashboard</Link>
        <Link href="/app/log" className="block w-full py-3 px-6 bg-white text-stone-700 rounded-xl font-semibold text-center border border-stone-300 hover:bg-stone-50">View Food Log</Link>
      </div>
    </div>
  );
}
