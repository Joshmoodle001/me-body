"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isIOS && !isStandalone) {
      setShowIOSPrompt(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt && !showIOSPrompt) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50">
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold text-stone-900 text-sm">Install Me Body</p>
              <p className="text-stone-500 text-xs mt-0.5">Get quick access and offline use</p>
            </div>
            <button onClick={handleInstall} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors">Install</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50">
      <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-4 animate-fade-in text-center">
        <p className="font-semibold text-stone-900 text-sm mb-1">Install Me Body</p>
        <p className="text-stone-500 text-xs">Tap <strong>Share</strong> then <strong>Add to Home Screen</strong></p>
      </div>
    </div>
  );
}
