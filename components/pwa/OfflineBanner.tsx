"use client";

import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => { setIsOffline(!navigator.onLine); const on = () => setIsOffline(false); const off = () => setIsOffline(true); window.addEventListener("online", on); window.addEventListener("offline", off); return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); }; }, []);
  if (!isOffline) return null;
  return <div className="offline-banner" role="alert">You are offline. Core features still work.</div>;
}
