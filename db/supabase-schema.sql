-- Me Body Supabase Migration v2 (mebody_ prefix to avoid conflicts)
-- Copy all of this → paste into SQL Editor at:
-- https://supabase.com/dashboard/project/bdfyedvlkxhgaadwcfih/sql/new

-- Sync state
CREATE TABLE IF NOT EXISTS mebody_sync_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_pushed_at TIMESTAMPTZ,
  last_pulled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles
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

-- Targets
CREATE TABLE IF NOT EXISTS mebody_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein_g DOUBLE PRECISION NOT NULL,
  carbs_g DOUBLE PRECISION NOT NULL,
  fat_g DOUBLE PRECISION NOT NULL,
  fiber_g DOUBLE PRECISION NOT NULL,
  water_ml INTEGER NOT NULL,
  calculation_method TEXT DEFAULT 'mifflin_st_jeor',
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Foods
CREATE TABLE IF NOT EXISTS mebody_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT,
  source TEXT NOT NULL,
  source_id TEXT,
  serving_size_g DOUBLE PRECISION,
  calories_per_100g DOUBLE PRECISION,
  protein_per_100g DOUBLE PRECISION,
  carbs_per_100g DOUBLE PRECISION,
  fat_per_100g DOUBLE PRECISION,
  fiber_per_100g DOUBLE PRECISION,
  sugar_per_100g DOUBLE PRECISION,
  sodium_per_100g DOUBLE PRECISION,
  confidence_score INTEGER DEFAULT 50,
  nutrient_completeness DOUBLE PRECISION DEFAULT 0,
  locale_match DOUBLE PRECISION DEFAULT 0,
  portion_certainty DOUBLE PRECISION DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  raw_json TEXT,
  locale TEXT DEFAULT 'en-ZA',
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Food logs
CREATE TABLE IF NOT EXISTS mebody_food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  quantity_g DOUBLE PRECISION NOT NULL,
  serving_label TEXT,
  logged_at TIMESTAMPTZ NOT NULL,
  notes TEXT DEFAULT '',
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Water logs
CREATE TABLE IF NOT EXISTS mebody_water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL,
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Body metrics
CREATE TABLE IF NOT EXISTS mebody_body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg DOUBLE PRECISION,
  waist_cm DOUBLE PRECISION,
  sleep_hours DOUBLE PRECISION,
  mood_1_to_5 INTEGER,
  steps INTEGER,
  recorded_at TIMESTAMPTZ NOT NULL,
  notes TEXT DEFAULT '',
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Workouts
CREATE TABLE IF NOT EXISTS mebody_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'strength',
  started_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  perceived_effort_1_to_10 INTEGER,
  notes TEXT DEFAULT '',
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Workout sets
CREATE TABLE IF NOT EXISTS mebody_workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg DOUBLE PRECISION,
  notes TEXT DEFAULT '',
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Habits
CREATE TABLE IF NOT EXISTS mebody_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_frequency TEXT DEFAULT 'daily',
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Habit logs
CREATE TABLE IF NOT EXISTS mebody_habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  notes TEXT DEFAULT '',
  sync_status TEXT DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Safety flags
CREATE TABLE IF NOT EXISTS mebody_safety_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content items
CREATE TABLE IF NOT EXISTS mebody_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  slug TEXT NOT NULL,
  locale TEXT DEFAULT 'en-ZA',
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  source_refs JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provenance
CREATE TABLE IF NOT EXISTS mebody_provenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  authors TEXT,
  year TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Day completions
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

-- Row-Level Security
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'mebody_profiles','mebody_targets','mebody_foods','mebody_food_logs','mebody_water_logs',
      'mebody_body_metrics','mebody_workouts','mebody_workout_sets','mebody_habits','mebody_habit_logs',
      'mebody_safety_flags','mebody_content_items','mebody_provenance','mebody_sync_state','mebody_day_completions'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Users see own data" ON %I', tbl);
    EXECUTE format(
      'CREATE POLICY "Users see own data" ON %I FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)',
      tbl
    );
  END LOOP;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mebody_profiles_user ON mebody_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_targets_user ON mebody_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_targets_profile ON mebody_targets(profile_id);
CREATE INDEX IF NOT EXISTS idx_mebody_foods_user ON mebody_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_food_logs_user ON mebody_food_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_food_logs_date ON mebody_food_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_mebody_water_logs_user ON mebody_water_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_body_metrics_user ON mebody_body_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_workouts_user ON mebody_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_workout_sets_user ON mebody_workout_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_habits_user ON mebody_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_habit_logs_user ON mebody_habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_safety_flags_user ON mebody_safety_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_content_items_user ON mebody_content_items(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_provenance_user ON mebody_provenance(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_sync_state_user ON mebody_sync_state(user_id);
CREATE INDEX IF NOT EXISTS idx_mebody_day_completions_user ON mebody_day_completions(user_id, date);
