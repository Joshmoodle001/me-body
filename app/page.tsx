import Link from "next/link";

export const metadata = { title: "Me Body — Premium Body Intelligence" };

export default function LandingPage() {
  return (
    <div style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30" style={{ background: "rgba(15, 26, 23, 0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(255,107,61,0.25), rgba(255,197,107,0.18))", border: "1px solid rgba(255,197,107,0.25)" }}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="url(#logoGradient)" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <defs><linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFC56B"/><stop offset="100%" stopColor="#FF6B3D"/></linearGradient></defs>
                <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight" style={{ color: "var(--gold)", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              Me Body
            </span>
          </div>
          <Link href="/app" className="btn btn-primary" style={{ fontSize: "13px", padding: "0.5rem 1.25rem" }}>
            Open App
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left column */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ background: "var(--gold-soft)", border: "1px solid rgba(255,197,107,0.20)", fontSize: "12px", fontWeight: 600, color: "var(--gold)" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 8px var(--gold)" }} />
              Midnight Ember
            </div>
            <h1 className="mb-4" style={{ fontSize: "clamp(32px, 7vw, 52px)", lineHeight: 1.1, fontWeight: 750, letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
              Powerful insights.<br />
              <span className="gold-text">Private by design.</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 2.5vw, 18px)", lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: "480px", marginBottom: "2rem" }}>
              Track food, workouts, body metrics, recovery, and progress in one premium body intelligence app.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link href="/app" className="btn btn-primary w-full sm:w-auto" style={{ fontSize: "15px", padding: "0.875rem 2rem" }}>
                Open Me Body
              </Link>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>No account required</span>
            </div>

            {/* Feature bullets */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {[
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Private & Secure", desc: "Your data stays yours." },
                { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", label: "Smart Coaching", desc: "Guidance that understands." },
                { icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", label: "Nutrition First", desc: "Real food. Real results." },
                { icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", label: "Beautiful Insights", desc: "Clarity that motivates." },
              ].map((f) => (
                <div key={f.label} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--brand-soft)" }}>
                    <svg className="w-4 h-4" fill="none" stroke="var(--brand)" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d={f.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{f.label}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — Phone mockup */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="w-64 rounded-[2.5rem] overflow-hidden shadow-2xl" style={{ background: "var(--card)", border: "2px solid var(--border-strong)" }}>
                <div className="h-8 flex items-center justify-center" style={{ background: "var(--card)" }}>
                  <div className="w-16 h-1 rounded-full" style={{ background: "var(--border)" }} />
                </div>
                <div className="p-4 space-y-3">
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Dashboard</div>
                  <div className="flex items-center justify-center">
                    <div className="wellness-ring-container">
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                        <circle cx="60" cy="60" r="52" fill="none" stroke="url(#mockupGrad)" strokeWidth="8" strokeDasharray="326.7" strokeDashoffset="65.3" strokeLinecap="round" transform="rotate(-90 60 60)" />
                        <defs><linearGradient id="mockupGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2DD4BF"/><stop offset="100%" stopColor="#FFC56B"/></linearGradient></defs>
                      </svg>
                      <div className="wellness-ring-value" style={{ fontSize: "28px" }}>84</div>
                      <span style={{ position: "absolute", bottom: "16px", fontSize: "9px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em" }}>WELLNESS</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ l: "Calories", v: "1,842", t: "2,250", c: "#FFC56B" }, { l: "Protein", v: "142g", t: "160g", c: "#2DD4BF" }, { l: "Carbs", v: "184g", t: "225g", c: "#A4D96C" }, { l: "Fat", v: "68g", t: "75g", c: "#FF8F6B" }].map((m) => (
                      <div key={m.l} className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <div style={{ fontSize: "8px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>{m.l}</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: m.c }}>{m.v}<span style={{ fontSize: "9px", color: "var(--text-muted)", marginLeft: "2px" }}>/ {m.t}</span></div>
                        <div className="macro-bar mt-1"><div className="macro-bar-fill" style={{ width: "80%", background: m.c }} /></div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl p-2.5" style={{ background: "var(--teal-soft)" }}>
                    <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--teal)" }}>Coach insight</p>
                    <p style={{ fontSize: "9px", color: "var(--teal)", opacity: 0.8, lineHeight: 1.4 }}>You&apos;re consistent this week. Add protein to your next meal.</p>
                  </div>
                </div>
              </div>
              {/* Glow behind mockup */}
              <div style={{ position: "absolute", inset: "-20px", background: "radial-gradient(ellipse at 50% 30%, rgba(255,107,61,0.15), transparent 70%)", borderRadius: "60px", zIndex: -1 }} />
            </div>
          </div>
        </div>
      </section>

      {/* PWA Trust Strip */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="trust-strip">
            {[
              { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label: "Secure by design" },
              { icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4", label: "Installable" },
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", label: "Fast & Reliable" },
              { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", label: "Always Improving" },
            ].map((t) => (
              <div key={t.label} className="trust-item">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d={t.icon} />
                </svg>
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 sm:px-6 pb-14 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-2 sm:mb-3" style={{ fontSize: "clamp(24px, 6vw, 40px)", fontWeight: 750, letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
            Built different.
          </h2>
          <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "var(--text-muted)", textAlign: "center", maxWidth: "480px", margin: "0 auto 2.5rem" }}>
            Free features that competitors lock behind subscriptions.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { title: "Works offline", desc: "Your data stays on your device. Log food, track habits, and view progress without internet." },
              { title: "Free barcode scanning", desc: "Look up foods by barcode through Open Food Facts. No subscription required." },
              { title: "Beyond body weight", desc: "Track waist, sleep, mood, steps, and measurements — not just a number on the scale." },
              { title: "Calm coaching", desc: "Evidence-based rule insights. No guilt, no shame, no aggressive targets." },
              { title: "Private, local-first", desc: "No ads. No third-party analytics. Your health data is not advertising inventory." },
              { title: "Install on your phone", desc: "Full Progressive Web App. Works offline. Add to your home screen." },
            ].map((f) => (
              <div key={f.title} className="card card-interactive">
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.375rem" }}>{f.title}</h3>
                <p style={{ fontSize: "13px", lineHeight: "21px", color: "var(--text-muted)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy promise */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="max-w-3xl mx-auto rounded-[var(--radius-panel)] p-6 sm:p-10" style={{ background: "var(--card-muted)", border: "1px solid var(--border-strong)" }}>
          <h2 className="mb-3 sm:mb-4" style={{ fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 700, color: "var(--text-primary)" }}>
            Your health data should not be treated like advertising inventory.
          </h2>
          <p style={{ fontSize: "clamp(14px, 2vw, 16px)", lineHeight: 1.7, color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Me Body stores your data locally on your device. No cloud sync unless you choose it. No ads. No analytics. No data sharing. Just you and your progress.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Local-first", "No ads", "No tracking", "Free core features", "Export anytime"].map((t) => (
              <span key={t} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-[var(--radius-pill)]" style={{ background: "var(--gold-soft)", border: "1px solid rgba(255,197,107,0.15)", fontSize: "12px", fontWeight: 600, color: "var(--gold)" }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-12 sm:pb-20 text-center">
        <h2 className="mb-2 sm:mb-3" style={{ fontSize: "clamp(24px, 6vw, 40px)", fontWeight: 750, letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
          Ready to start?
        </h2>
        <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "var(--text-muted)", marginBottom: "1.5rem" }}>No account. No credit card. No catch.</p>
        <Link href="/app" className="btn btn-primary" style={{ fontSize: "16px", padding: "1rem 2.5rem" }}>
          Open Me Body &rarr;
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-6 sm:py-8 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ fontSize: "12px", lineHeight: "18px", color: "var(--text-muted)", marginBottom: "0.375rem" }}>
            Me Body provides general wellness and nutrition tracking tools. It is not medical advice. Speak to a qualified healthcare professional before making major diet, exercise, or health changes.
          </p>
          <p style={{ fontSize: "12px", lineHeight: "18px", color: "var(--text-muted)" }}>
            Midnight Ember theme &middot; Private by design &middot; This app avoids shame-based coaching.
          </p>
        </div>
      </footer>
    </div>
  );
}
