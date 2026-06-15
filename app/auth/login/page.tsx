"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--background)" }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, rgba(255,107,61,0.25), rgba(255,197,107,0.18))" }}>
              <svg className="w-7 h-7" fill="none" stroke="var(--gold)" viewBox="0 0 24 24" strokeWidth={2}><path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Setup Required</h1>
          </div>
          <div className="card" style={{ background: "var(--warning-soft)" }}>
            <p className="font-semibold" style={{ color: "var(--warning)" }}>Supabase not configured</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel deployment.</p>
            <Link href="/app" className="btn btn-primary mt-4 inline-block text-sm">Continue without account</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError("");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else {
      router.push("/app");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, rgba(255,107,61,0.25), rgba(255,197,107,0.18))", border: "1px solid rgba(255,197,107,0.25)" }}>
            <svg className="w-7 h-7" fill="none" stroke="var(--gold)" viewBox="0 0 24 24" strokeWidth={2}><path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Welcome back</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Sign in to your account</p>
        </div>

        <div className="card mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: "var(--error-soft)", color: "var(--error)" }}>{error}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="input-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" autoFocus required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="input" required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center" style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Don&apos;t have an account? <Link href="/auth/signup" style={{ color: "var(--gold)", fontWeight: 600 }}>Create one</Link>
        </p>
        <div className="text-center mt-4">
          <Link href="/app" className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Continue without account</Link>
        </div>
      </div>
    </div>
  );
}
