import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let warned = false;

export function createClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (!warned) {
      console.warn("[Supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Auth disabled.");
      warned = true;
    }
    return null;
  }

  try {
    return createBrowserClient(url, key);
  } catch (e) {
    console.error("[Supabase] Failed to create browser client:", e);
    return null;
  }
}
