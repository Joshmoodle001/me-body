"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    if (isIOS && !window.matchMedia("(display-mode: standalone)").matches) setShowIOS(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt && !showIOS) return null;

  const doInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };

  const inner = prompt ? (
    <>
      <p style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)" }}>Install Me Body</p>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "0.125rem" }}>Get quick access and offline use</p>
      <button onClick={doInstall} className="ml-3 px-5 py-2.5 rounded-[var(--radius-button)] text-sm font-semibold transition-colors shrink-0" style={{ background: "var(--brand)", color: "white" }}>Install</button>
    </>
  ) : (
    <div className="text-center w-full">
      <p style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)", marginBottom: "0.25rem" }}>Install Me Body</p>
      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Tap <strong>Share</strong> then <strong>Add to Home Screen</strong></p>
    </div>
  );

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50">
      <div className="card animate-fade-in flex items-center" style={{ background: "var(--card)" }}>
        {inner}
      </div>
    </div>
  );
}
