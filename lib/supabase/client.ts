import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let warned = false;

function createPersistentClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (!warned) {
      console.warn("[Supabase] Env vars not set. Auth disabled.");
      warned = true;
    }
    return null;
  }

  try {
    const isPWA = typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;
    const storageKey = `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;

    return createBrowserClient(url, key, {
      auth: {
        storageKey,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== "undefined" ? {
          getItem: (k: string) => {
            try { return window.localStorage.getItem(k); } catch { return null; }
          },
          setItem: (k: string, v: string) => {
            try { window.localStorage.setItem(k, v); } catch {}
          },
          removeItem: (k: string) => {
            try { window.localStorage.removeItem(k); } catch {}
          },
        } : undefined,
      },
    });
  } catch (e) {
    console.error("[Supabase] Failed to create client:", e);
    return null;
  }
}

export function createClient(): SupabaseClient | null {
  return createPersistentClient();
}
