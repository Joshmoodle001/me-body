"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(""); setIsError(false);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setMessage(error.message);
      setIsError(true);
    } else {
      setMessage("Account created! Check your email to confirm.");
      setIsError(false);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, rgba(255,107,61,0.25), rgba(255,197,107,0.18))", border: "1px solid rgba(255,197,107,0.25)" }}>
            <svg className="w-7 h-7" fill="none" stroke="url(#signupGrad)" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round">
              <defs><linearGradient id="signupGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFC56B"/><stop offset="100%" stopColor="#FF6B3D"/></linearGradient></defs>
              <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Create your account</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Private body intelligence starts here</p>
        </div>

        <div className="card mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {message && (
            <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: isError ? "var(--error-soft)" : "var(--success-soft)", color: isError ? "var(--error)" : "var(--success)" }}>
              {message}
            </div>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="input-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" autoFocus required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" className="input" minLength={8} required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">Create Account</button>
          </form>
        </div>

        <p className="text-center" style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--gold)", fontWeight: 600 }}>Sign In</Link>
        </p>

        <div className="card mt-4" style={{ background: "var(--card-muted)" }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Your data stays on your device by default. Cloud sync is optional. No ads. No tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
