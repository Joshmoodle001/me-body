import Link from "next/link";

export const metadata = { title: "Me Body - Private Body Intelligence" };

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="px-6 py-4 border-b border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-green-700">Me Body</span>
          <Link href="/app" className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Open App</Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">Your body,<br />your data,<br />your progress.</h1>
        <p className="text-lg text-stone-600 max-w-xl mx-auto mb-8">Private body intelligence, nutrition, habits, and progress tracking — without shame, ads, or confusing paywalls.</p>
        <Link href="/app" className="inline-block bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Get Started Free</Link>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "Track Nutrition", desc: "Log meals by search, barcode scan, or manual entry. View macros, calories, and nutrient breakdowns." },
            { title: "Build Habits", desc: "Create habits and track consistency. Get gentle coaching insights, not guilt-based streaks." },
            { title: "Monitor Progress", desc: "Log weight, measurements, sleep, and mood. See trends over time with accessible charts." },
            { title: "Stay Private", desc: "Your data stays on your device. No ads, no third-party analytics, no data sharing." },
            { title: "Works Offline", desc: "All core features work without internet. Log food, track habits, and view progress anytime." },
            { title: "Free Core Features", desc: "Barcode scanning, food logging, macro targets, data export — all free, no subscription needed." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-6 border border-stone-200">
              <h3 className="font-semibold text-stone-900 mb-2">{f.title}</h3>
              <p className="text-stone-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">Ready to start?</h2>
        <p className="text-stone-600 mb-6">No account required. No credit card. No catch.</p>
        <Link href="/app" className="inline-block bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Open the App</Link>
      </section>

      <footer className="max-w-4xl mx-auto px-6 py-8 border-t border-stone-200 text-center text-sm text-stone-500">
        <p className="mb-2">Me Body provides general wellness and nutrition tracking tools. It is not medical advice, diagnosis, or treatment. Speak to a qualified healthcare professional before making major diet, exercise, or health changes.</p>
        <p>This app avoids shame-based coaching. Missing a log or exceeding a target does not mean failure.</p>
      </footer>
    </div>
  );
}
