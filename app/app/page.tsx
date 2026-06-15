"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getProfile } from "@/db/queries";
import LoadingState from "@/components/ui/LoadingState";

export default function AppRoot() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = createClient();

      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/auth/login");
          return;
        }
      }

      try {
        const profile = await getProfile();
        if (profile?.onboardingComplete) {
          router.replace("/app/dashboard");
        } else {
          router.replace("/onboarding");
        }
      } catch {
        router.replace("/onboarding");
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <LoadingState message="Loading..." />
    </div>
  );
}
