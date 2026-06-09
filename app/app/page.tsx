"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getProfile } from "@/db/queries";
import LoadingState from "@/components/ui/LoadingState";

export default function AppRoot() {
  const router = useRouter();

  useEffect(() => {
    getProfile().then((profile) => {
      if (profile?.onboardingComplete) {
        router.replace("/app/dashboard");
      } else {
        router.replace("/onboarding");
      }
    }).catch(() => {
      router.replace("/onboarding");
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message="Loading..." />
    </div>
  );
}
