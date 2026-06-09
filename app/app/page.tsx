"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getProfile } from "@/db/queries";
import LoadingState from "@/components/ui/LoadingState";

export default function AppRoot() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth/login");
        return;
      }

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
      setChecking(false);
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message="Loading..." />
    </div>
  );
}
