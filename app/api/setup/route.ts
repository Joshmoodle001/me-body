import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface AuthSettings {
  mailer_autoconfirm?: boolean;
  disable_signup?: boolean;
}

async function getAuthSettings(): Promise<AuthSettings> {
  if (!SUPABASE_URL || !SERVICE_KEY) return {};
  const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
  });
  if (!res.ok) return {};
  return res.json();
}

async function tryEnableSql(): Promise<string[]> {
  const results: string[] = [];
  if (!SUPABASE_URL || !SERVICE_KEY) return ["Supabase not configured"];

  const sql = `
-- Me Body Sync State
CREATE TABLE IF NOT EXISTS sync_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_pushed_at TIMESTAMPTZ,
  last_pulled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Me Body Profiles
CREATE TABLE IF NOT EXISTS mebody_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sex TEXT NOT NULL,
  birth_year INTEGER NOT NULL,
  height_cm DOUBLE PRECISION NOT NULL,
  current_weight_kg DOUBLE PRECISION NOT NULL,
  goal_weight_kg DOUBLE PRECISION,
  activity_level TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  training_days_per_week INTEGER DEFAULT 3,
  diet_preference TEXT DEFAULT 'any',
  units TEXT DEFAULT 'metric',
  calorie_visibility TEXT DEFAULT 'visible',
  day_type TEXT DEFAULT 'training',
  onboarding_complete BOOLEAN DEFAULT false,
  cycle_tracking BOOLEAN DEFAULT false,
  pregnancy_status TEXT DEFAULT 'none',
  chronic_conditions JSONB DEFAULT '[]',
  medications JSONB DEFAULT '[]',
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Me Body Targets
CREATE TABLE IF NOT EXISTS mebody_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein_g DOUBLE PRECISION NOT NULL,
  carbs_g DOUBLE PRECISION NOT NULL,
  fat_g DOUBLE PRECISION NOT NULL,
  fiber_g INTEGER DEFAULT 25,
  water_ml INTEGER DEFAULT 2500,
  calculation_method TEXT DEFAULT 'mifflin_st_jeor',
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Me Body Day Completions
CREATE TABLE IF NOT EXISTS mebody_day_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_type TEXT DEFAULT 'training',
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mebody_profiles_user ON mebody_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_targets_user ON mebody_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_day_completions_user ON mebody_day_completions(user_id, date);
`;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pgrest_exec`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        "Content-Type": "application/json",
        Prefer: "params=single-object",
      },
      body: JSON.stringify({ query: sql }),
    });
    if (res.ok) {
      results.push("Schema created successfully via RPC");
    }
  } catch {
    // RPC method not available, try direct method
  }

  results.push("Note: Run SQL manually at the Supabase dashboard if tables not created");
  results.push(`SQL Editor: https://supabase.com/dashboard/project/bdfyedvlkxhgaadwcfih/sql/new`);
  return results;
}

export async function GET() {
  const results: string[] = [];

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({
      status: "not_configured",
      message: "Supabase environment variables not set.",
    });
  }

  const authSettings = await getAuthSettings();
  results.push(`Email autoconfirm: ${authSettings.mailer_autoconfirm ? "ON (no verification)" : "OFF (verification required)"}`);
  results.push(`Signup enabled: ${!authSettings.disable_signup}`);

  const sqlResults = await tryEnableSql();
  results.push(...sqlResults);

  return NextResponse.json({
    status: "ok",
    projectUrl: SUPABASE_URL.replace(/\/$/, ""),
    sqlEditorUrl: "https://supabase.com/dashboard/project/bdfyedvlkxhgaadwcfih/sql/new",
    authSettingsUrl: "https://supabase.com/dashboard/project/bdfyedvlkxhgaadwcfih/settings/auth",
    message: "Disable 'Confirm email' in Authentication > Settings for simple signup.",
    details: results,
  });
}
