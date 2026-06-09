"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const supabase = createClient();

  if (!supabase) {
    return (
      <div className="card" style={{ background: "var(--warning-soft)", borderColor: "rgba(255,197,107,0.25)" }}>
        <p className="font-semibold" style={{ color: "var(--warning)" }}>Setup Required</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Supabase environment variables are not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel deployment.
        </p>
        <Link href="/app" className="btn btn-primary mt-4 inline-block text-sm">Continue without account</Link>
      </div>
    );
  }

  const errorParam = searchParams.get("error");
  if (errorParam && !message) {
    setMessage("Authentication failed. Please try again.");
    setIsError(true);
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage(""); setIsError(false);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setMessage(error.message); setIsError(true); } else { router.push("/app"); }
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault(); if (!email.trim()) return; setLoading(true); setMessage(""); setIsError(false);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    if (error) { setMessage(error.message); setIsError(true); } else { setMessage("Check your email for the magic link."); setIsError(false); setMagicLinkSent(true); }
    setLoading(false);
  };

  return (
    <div className="card mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      {message && (
        <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: isError ? "var(--error-soft)" : "var(--success-soft)", color: isError ? "var(--error)" : "var(--success)" }}>{message}</div>
      )}
      {!magicLinkSent ? (
        <>
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div><label className="input-label">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" autoFocus required /></div>
            <div><label className="input-label">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="input" required /></div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">Sign In</button>
          </form>
          <div className="flex items-center gap-3 my-4"><div className="flex-1" style={{ height: "1px", background: "var(--border)" }} /><span style={{ fontSize: "12px", color: "var(--text-muted)" }}>or</span><div className="flex-1" style={{ height: "1px", background: "var(--border)" }} /></div>
          <button onClick={handleMagicLink} disabled={loading || !email.trim()} className="btn btn-secondary w-full">Send Magic Link</button>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: "var(--success-soft)" }}><svg className="w-6 h-6" fill="none" stroke="var(--success)" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Check your email</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>We sent a magic link to {email}</p>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, rgba(255,107,61,0.25), rgba(255,197,107,0.18))", border: "1px solid rgba(255,197,107,0.25)" }}>
            <svg className="w-7 h-7" fill="none" stroke="url(#lgGrad)" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round">
              <defs><linearGradient id="lgGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFC56B"/><stop offset="100%" stopColor="#FF6B3D"/></linearGradient></defs>
              <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Welcome back</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Sign in to your Me Body account</p>
        </div>
        <Suspense fallback={<div className="card mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "2rem", textAlign: "center" }}><p style={{ color: "var(--text-muted)" }}>Loading...</p></div>}>
          <LoginForm />
        </Suspense>
        <p className="text-center" style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Don&apos;t have an account? <Link href="/auth/signup" style={{ color: "var(--gold)", fontWeight: 600 }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
