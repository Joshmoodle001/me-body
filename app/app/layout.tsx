"use client";

import BottomNav from "@/components/ui/BottomNav";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import InstallPrompt from "@/components/pwa/InstallPrompt";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <OfflineBanner />
      <div className="has-bottom-nav pb-6">
        {children}
      </div>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
