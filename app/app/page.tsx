"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getProfile } from "@/db/queries";
import LoadingState from "@/components/ui/LoadingState";

export default function AppRoot() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        if (profile?.onboardingComplete) {
          router.replace("/app/dashboard");
        } else {
          router.replace("/onboarding");
        }
      } catch (e) {
        console.error("[AppShell] DB error:", e);
        router.replace("/onboarding");
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message="Loading..." />
    </div>
  );
}
