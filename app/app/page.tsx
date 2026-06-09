"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getProfile } from "@/db/queries";
import LoadingState from "@/components/ui/LoadingState";

export default function AppRoot() {
  const router = useRouter();

  useEffect(() => {
    console.log("[AppShell] Starting database check...");
    getProfile().then((profile) => {
      console.log("[AppShell] Profile loaded:", profile?.id ?? "none");
      if (profile?.onboardingComplete) {
        router.replace("/app/dashboard");
      } else {
        router.replace("/onboarding");
      }
    }).catch((e) => {
      console.error("[AppShell] Failed to load profile:", e?.message, e?.name, e?.stack);
      router.replace("/onboarding");
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message="Loading..." />
    </div>
  );
}
