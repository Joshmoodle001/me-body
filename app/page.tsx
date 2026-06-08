import Link from "next/link";

export const metadata = { title: "Me Body — Your Private Body Intelligence App" };

export default function LandingPage() {
  return (
    <div>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-[var(--background)]/80 backdrop-blur-lg border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold" style={{ color: "var(--brand)" }}>Me Body</span>
          <Link href="/app" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-button)] font-semibold text-sm transition-all" style={{ background: "var(--brand)", color: "white" }}>
            Open App
            <span>&rarr;</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="mb-6 mx-auto max-w-3xl" style={{ fontSize: "clamp(36px, 6vw, 56px)", lineHeight: 1.12, fontWeight: 750, letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
            Your private body intelligence app.
          </h1>
          <p style={{ fontSize: "18px", lineHeight: "30px", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 2.5rem" }}>
            Track food, habits, workouts, and progress without shame, ads, or confusing paywalls.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/app" className="inline-flex items-center gap-2 px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base transition-all" style={{ background: "var(--brand)", color: "white", boxShadow: "0 8px 30px rgba(47, 111, 94, 0.25)" }}>
              Open Me Body
            </Link>
            <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>No account required</span>
          </div>
        </div>
      </section>

      {/* Product Preview Card */}
      <section className="max-w-xl mx-auto px-6 pb-20">
        <div className="rounded-[var(--radius-card)] p-6 shadow-lg" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Today</p>
              <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--brand-soft)" }}>
              <span className="text-xl font-bold" style={{ color: "var(--brand)" }}>MB</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Calories", value: "1,843", target: "2,100", color: "var(--calories)", bg: "rgba(47,111,94,0.08)" },
              { label: "Protein", value: "118g", target: "140g", color: "var(--protein)", bg: "rgba(59,130,160,0.08)" },
              { label: "Carbs", value: "192g", target: "210g", color: "var(--carbs)", bg: "rgba(217,130,75,0.08)" },
              { label: "Fat", value: "58g", target: "65g", color: "var(--fat)", bg: "rgba(200,169,106,0.08)" },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-2xl" style={{ background: m.bg }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</p>
                <p style={{ fontSize: "22px", fontWeight: 700, color: m.color, fontVariantNumeric: "tabular-nums" }}>{m.value}<span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginLeft: "4px" }}>/ {m.target}</span></p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl mb-3" style={{ background: "var(--brand-soft)" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--brand-dark)" }}>Coach</p>
            <p style={{ fontSize: "13px", color: "var(--brand)" }}>Add a protein anchor to your next meal to support fullness and muscle retention.</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl" style={{ background: "var(--card-muted)" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>Weight</span>
            <span>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>72.4</span>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "4px" }}>kg</span>
            </span>
            <span className="badge badge-success" style={{ fontSize: "11px", padding: "0.125rem 0.5rem" }}>— 0.4kg</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-3 display" style={{ color: "var(--text-primary)" }}>Built different.</h2>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", textAlign: "center", maxWidth: "500px", margin: "0 auto 3rem" }}>
            Free features that competitors lock behind subscriptions.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Works offline", desc: "Your data stays on your device. Log food, track habits, and view progress without internet." },
              { title: "Free barcode scanning", desc: "Look up foods by barcode through Open Food Facts. No subscription required." },
              { title: "Beyond body weight", desc: "Track waist, sleep, mood, steps, and measurements — not just a number on the scale." },
              { title: "Calm coaching", desc: "Gentle rule-based insights. No guilt, no shame, no aggressive targets." },
              { title: "Private, local-first", desc: "No ads. No third-party analytics. Your health data is not advertising inventory." },
              { title: "Install on your phone", desc: "Full Progressive Web App. Works offline. Add to your home screen." },
            ].map((f) => (
              <div key={f.title} className="rounded-[var(--radius-card)] p-5" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>{f.title}</h3>
                <p style={{ fontSize: "14px", lineHeight: "22px", color: "var(--text-secondary)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Promise */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto rounded-[var(--radius-card)] p-8 md:p-12" style={{ background: "var(--brand-dark)", color: "white" }}>
          <h2 className="mb-4" style={{ fontSize: "28px", fontWeight: 700, color: "white" }}>Your health data should not be treated like advertising inventory.</h2>
          <p style={{ fontSize: "16px", lineHeight: "28px", color: "rgba(255,255,255,0.7)", marginBottom: "2rem" }}>
            Me Body stores your data locally on your device. No cloud sync unless you choose it. No ads. No analytics. No data sharing. Just you and your progress.
          </p>
          <div className="flex flex-wrap gap-3">
            {["Local-first", "No ads", "No tracking", "Free core features", "Export anytime"].map((t) => (
              <span key={t} className="px-4 py-2 rounded-[var(--radius-pill)]" style={{ background: "rgba(255,255,255,0.1)", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 text-center">
        <h2 className="mb-3 display">Ready to start?</h2>
        <p style={{ fontSize: "16px", color: "var(--text-secondary)", marginBottom: "2rem" }}>No account. No credit card. No catch.</p>
        <Link href="/app" className="inline-flex items-center gap-2 px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base transition-all" style={{ background: "var(--brand)", color: "white", boxShadow: "0 8px 30px rgba(47, 111, 94, 0.25)" }}>
          Open Me Body &rarr;
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ fontSize: "13px", lineHeight: "20px", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            Me Body provides general wellness and nutrition tracking tools. It is not medical advice, diagnosis, or treatment.
            Speak to a qualified healthcare professional before making major diet, exercise, or health changes.
          </p>
          <p style={{ fontSize: "13px", lineHeight: "20px", color: "var(--text-muted)" }}>
            This app avoids shame-based coaching. Missing a log or exceeding a target does not mean failure.
            The goal is awareness, consistency, and sustainable progress.
          </p>
        </div>
      </footer>
    </div>
  );
}
