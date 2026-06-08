import Link from "next/link";

export const metadata = { title: "Me Body — Your Private Body Intelligence App" };

export default function LandingPage() {
  return (
    <div>
      <header className="fixed top-0 left-0 right-0 z-30" style={{ background: "var(--background)/80", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <span className="text-lg sm:text-xl font-bold" style={{ color: "var(--brand)" }}>Me Body</span>
          <Link href="/app" className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-[var(--radius-button)] font-semibold text-xs sm:text-sm transition-all" style={{ background: "var(--brand)", color: "white" }}>
            Open App <span className="hidden sm:inline">&rarr;</span>
          </Link>
        </div>
      </header>

      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="mb-4 sm:mb-6 mx-auto max-w-3xl" style={{ fontSize: "clamp(28px, 8vw, 56px)", lineHeight: 1.1, fontWeight: 750, letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
            Your private body intelligence app.
          </h1>
          <p style={{ fontSize: "clamp(15px, 2.5vw, 18px)", lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: "560px", margin: "0 auto 1.5rem", padding: "0 0.5rem" }}>
            Track food, habits, workouts, and progress without shame, ads, or confusing paywalls.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <Link href="/app" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-[var(--radius-button)] font-semibold text-sm sm:text-base transition-all w-full sm:w-auto justify-center" style={{ background: "var(--brand)", color: "white", boxShadow: "0 8px 30px rgba(47, 111, 94, 0.25)" }}>
              Open Me Body
            </Link>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>No account required</span>
          </div>
        </div>
      </section>

      <section className="max-w-xl mx-auto px-4 pb-12 sm:pb-20">
        <div className="rounded-[var(--radius-card)] p-4 sm:p-6 shadow-lg" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Today</p>
              <p className="text-base sm:text-xl font-bold" style={{ color: "var(--text-primary)" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center" style={{ background: "var(--brand-soft)" }}>
              <span className="text-base sm:text-xl font-bold" style={{ color: "var(--brand)" }}>MB</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {[
              { label: "Calories", value: "1,843", target: "2,100", color: "var(--calories)", bg: "rgba(47,111,94,0.08)" },
              { label: "Protein", value: "118g", target: "140g", color: "var(--protein)", bg: "rgba(59,130,160,0.08)" },
              { label: "Carbs", value: "192g", target: "210g", color: "var(--carbs)", bg: "rgba(217,130,75,0.08)" },
              { label: "Fat", value: "58g", target: "65g", color: "var(--fat)", bg: "rgba(200,169,106,0.08)" },
            ].map((m) => (
              <div key={m.label} className="p-2.5 sm:p-3 rounded-2xl" style={{ background: m.bg }}>
                <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</p>
                <p style={{ fontSize: "clamp(16px, 3.5vw, 22px)", fontWeight: 700, color: m.color, fontVariantNumeric: "tabular-nums" }}>{m.value}<span style={{ fontSize: "clamp(10px, 2vw, 13px)", fontWeight: 500, color: "var(--text-muted)", marginLeft: "3px" }}>/ {m.target}</span></p>
              </div>
            ))}
          </div>
          <div className="p-3 sm:p-4 rounded-2xl mb-3" style={{ background: "var(--brand-soft)" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--brand-dark)" }}>Coach</p>
            <p style={{ fontSize: "12px", color: "var(--brand)" }}>Add a protein anchor to your next meal to support fullness and muscle retention.</p>
          </div>
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl" style={{ background: "var(--card-muted)" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Weight</span>
            <span><span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>72.4</span><span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "4px" }}>kg</span></span>
            <span className="badge badge-success" style={{ fontSize: "10px", padding: "0.125rem 0.5rem" }}>−0.4kg</span>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-2 sm:mb-3" style={{ fontSize: "clamp(24px, 6vw, 40px)", fontWeight: 750, letterSpacing: "-0.04em", color: "var(--text-primary)" }}>Built different.</h2>
          <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "var(--text-secondary)", textAlign: "center", maxWidth: "480px", margin: "0 auto 2rem sm:margin-bottom:3rem" }}>
            Free features that competitors lock behind subscriptions.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { title: "Works offline", desc: "Your data stays on your device. Log food, track habits, and view progress without internet." },
              { title: "Free barcode scanning", desc: "Look up foods by barcode through Open Food Facts. No subscription required." },
              { title: "Beyond body weight", desc: "Track waist, sleep, mood, steps, and measurements — not just a number on the scale." },
              { title: "Calm coaching", desc: "Gentle rule-based insights. No guilt, no shame, no aggressive targets." },
              { title: "Private, local-first", desc: "No ads. No third-party analytics. Your health data is not advertising inventory." },
              { title: "Install on your phone", desc: "Full Progressive Web App. Works offline. Add to your home screen." },
            ].map((f) => (
              <div key={f.title} className="rounded-[var(--radius-card)] p-4 sm:p-5" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.375rem" }}>{f.title}</h3>
                <p style={{ fontSize: "13px", lineHeight: "21px", color: "var(--text-secondary)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="max-w-3xl mx-auto rounded-[var(--radius-card)] p-6 sm:p-10" style={{ background: "var(--brand-dark)", color: "white" }}>
          <h2 className="mb-3 sm:mb-4" style={{ fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 700, color: "white" }}>Your health data should not be treated like advertising inventory.</h2>
          <p style={{ fontSize: "clamp(14px, 2vw, 16px)", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem" }}>
            Me Body stores your data locally on your device. No cloud sync unless you choose it. No ads. No analytics. No data sharing. Just you and your progress.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Local-first", "No ads", "No tracking", "Free core features", "Export anytime"].map((t) => (
              <span key={t} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-[var(--radius-pill)]" style={{ background: "rgba(255,255,255,0.1)", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:pb-20 text-center">
        <h2 className="mb-2 sm:mb-3" style={{ fontSize: "clamp(24px, 6vw, 40px)", fontWeight: 750, letterSpacing: "-0.04em", color: "var(--text-primary)" }}>Ready to start?</h2>
        <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>No account. No credit card. No catch.</p>
        <Link href="/app" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-[var(--radius-button)] font-semibold text-sm sm:text-base transition-all w-full sm:w-auto justify-center" style={{ background: "var(--brand)", color: "white", boxShadow: "0 8px 30px rgba(47, 111, 94, 0.25)" }}>
          Open Me Body &rarr;
        </Link>
      </section>

      <footer className="px-4 sm:px-6 py-6 sm:py-8 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ fontSize: "12px", lineHeight: "18px", color: "var(--text-muted)", marginBottom: "0.375rem" }}>
            Me Body provides general wellness and nutrition tracking tools. It is not medical advice.
            Speak to a qualified healthcare professional before making major diet, exercise, or health changes.
          </p>
          <p style={{ fontSize: "12px", lineHeight: "18px", color: "var(--text-muted)" }}>
            This app avoids shame-based coaching. Missing a log or exceeding a target does not mean failure.
          </p>
        </div>
      </footer>
    </div>
  );
}
