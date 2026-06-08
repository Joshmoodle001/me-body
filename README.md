# Me Body

**Private body intelligence, nutrition, habits, and progress tracking.**

A privacy-first, installable Progressive Web App for body recomposition and health tracking. Works offline, stores data locally, and has no ads or subscription paywalls.

**Live:** [https://me-body.vercel.app](https://me-body.vercel.app)

## Product Philosophy

Me Body helps you understand food, habits, workouts, body measurements, and progress — without shame, ads, confusing paywalls, or unnecessary data sharing.

- Your data stays on your device (local-first IndexedDB)
- No ads, no third-party analytics
- Free barcode scanning (unlike competitors)
- Gentle coaching insights, not guilt-based streaks
- Evidence-based targets you can adjust
- Works offline for core features

**This app is not medical advice.** Speak to a qualified healthcare professional before making major diet, exercise, or health changes.

## Features

- **Onboarding** — Set goals, body metrics, and get calculated macro targets (Mifflin-St Jeor)
- **Dashboard** — See daily nutrition progress vs targets with macro bars and quick water add
- **Food Logging** — Log meals by search, barcode scan, or manual entry
- **Barcode Scanning** — Look up foods via Open Food Facts (manual input fallback)
- **Food Search** — Search USDA FoodData Central and local foods
- **Manual Food Entry** — Create custom foods with full nutrition data
- **Water Tracking** — Quick-add buttons + custom amount logging
- **Habit Tracker** — Create daily habits, check them off with one tap
- **Workout Tracking** — Log workouts with type, duration, effort, and notes
- **Progress Tracking** — Log weight, waist, sleep, mood, steps with trends
- **Coaching** — Rule-based local coaching insights (no paid AI)
- **Data Export/Import** — Export all data as JSON, import backups
- **Privacy Controls** — Detailed privacy page explaining data handling
- **PWA** — Installable to home screen, works offline

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React, TypeScript |
| Styling | Tailwind CSS, mobile-first responsive |
| State | Zustand, React state |
| Forms | React Hook Form + Zod |
| Storage | Dexie.js (IndexedDB) |
| Charts | Lightweight SVG custom |
| PWA | Web Manifest, Service Worker |
| Hosting | Vercel |
| Food Data | Open Food Facts (free), USDA FoodData Central (free) |
| Optional Sync | Supabase (future, architecture ready) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
git clone https://github.com/Joshmoodle001/me-body.git
cd me-body
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm run start
```

### Type Check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | Yes | App name |
| `OPEN_FOOD_FACTS_BASE_URL` | Yes | Open Food Facts API URL |
| `OPEN_FOOD_FACTS_USER_AGENT` | Yes | Custom User-Agent for Open Food Facts |
| `USDA_FDC_API_KEY` | Yes | USDA FoodData Central API key (use `DEMO_KEY` for prototyping) |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase URL (for future sync) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key (server only) |

**Never commit `.env.local` or real API keys.**

## Vercel Deployment

1. Fork or clone the repository
2. Import the project on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel Project Settings
4. Deploy — the project auto-detects Next.js

The `vercel.json` configures:
- Framework: Next.js
- Build command: `npm run build`
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Service worker headers

## PWA Installation

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home screen"
4. Or use the in-app Install button when prompted

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

The app will open in standalone mode and work offline for core features.

## Offline Support

Core features work without internet:
- Dashboard viewing
- Food logs (existing)
- Manual food creation
- Water logs
- Weight/body metrics
- Habit logs
- Workouts
- Local coaching insights
- Settings
- Data export

Internet required for:
- New barcode lookup
- USDA food search
- Open Food Facts lookup

## Free Data Sources

### Open Food Facts
- Free, open database of food products worldwide
- Used for barcode/package food lookup
- Data is crowdsourced — check confidence scores
- Custom User-Agent required, no auth

### USDA FoodData Central
- US government food nutrition database
- Use `DEMO_KEY` for prototyping (1000 req/hour)
- Get a production key at [fdc.nal.usda.gov/api-key-signup.html](https://fdc.nal.usda.gov/api-key-signup.html)
- API calls proxied through Next.js server routes (key never exposed to browser)

## Privacy

- All tracking data stored locally in IndexedDB
- No cloud sync unless you enable it (future feature)
- No ads, no third-party analytics
- Food search queries go to Open Food Facts/USDA — no personal data shared
- Export/delete your data anytime

Read the full privacy information in the app under Settings > Privacy.

## Data Export / Import

- Export: Settings > Data > Export JSON
- Import: Settings > Data > Choose JSON File
- Delete all: Settings > Data > Delete All Data (with confirmation)

Backup your data regularly. Me Body is local-first — if you clear browser storage without exporting, your data will be lost.

## Optional Supabase Sync (Future)

Architecture is ready for optional cloud sync:

- `lib/supabaseClient.ts` and `lib/supabaseServer.ts` (not yet created)
- `db/syncQueue.ts` (not yet created)
- `supabase/migrations/` directory (not yet populated)
- App works fully without Supabase

When implemented:
- Optional login via Supabase Auth
- Encrypted sync of logs and settings
- Shared verified foods
- Cross-device sync
- RL S policies on every user-owned table

## Project Structure

```
me-body/
  app/                    # Next.js App Router
    layout.tsx            # Root layout
    page.tsx              # Landing page
    app/                  # App shell (with bottom nav)
      dashboard/          # Main dashboard
      log/                # Daily food log
      scan/               # Barcode scanner
      progress/           # Progress tracking
      coach/              # Coaching insights
      settings/           # Settings
    onboarding/           # Onboarding flow
      goals/              # Goal selection
      body/               # Body metrics
      preferences/        # Activity, diet
      summary/            # Target summary
    food/                 # Food pages
      search/             # Food search
      manual/             # Manual food creation
      [id]/               # Food detail + logging
      recipe/             # Recipe builder (future)
    settings/             # Settings sub-pages
      privacy/            # Privacy policy
      data/               # Data export/import
      targets/            # Edit targets
      sync/               # Sync settings
    api/                  # API routes (server-only)
      food/usda/search/   # USDA search proxy
      food/usda/[fdcId]/  # USDA detail proxy
      food/open-food-facts/[barcode]/  # OFF barcode proxy
      health/             # Health check
    offline/              # Offline fallback page
  components/             # React components
    ui/                   # UI primitives
    pwa/                  # PWA components
  lib/                    # Utility libraries
    calculations.ts       # Macro/target calculations
    coaching.ts           # Coaching engine
    confidence.ts         # Food confidence scoring
    constants.ts          # App constants
    validation.ts         # Zod schemas
    foodApiClient.ts      # Frontend API client
    foodApiServer.ts      # Server API normalization
    utils.ts              # Re-exports
  db/                     # Database layer
    localDb.ts            # Dexie.js setup
    schema.ts             # Type exports
    queries.ts            # CRUD operations
    exportData.ts         # Import/export utilities
  public/                 # Static assets
    sw.js                 # Service worker
    manifest.webmanifest  # PWA manifest
    icons/                # App icons (SVG)
```

## Known Limitations

- **USDA DEMO_KEY**: Limited to 1,000 requests/hour. Get a production key for real usage.
- **Open Food Facts**: Crowdsourced data — verify critical nutrition values.
- **Barcode scanning**: Uses manual input (browser camera scanning with free libraries is complex on all browsers).
- **Charts**: Text summaries with basic trend display; full Recharts integration for v1.1.
- **Supabase sync**: Not yet implemented; local-only for MVP.
- **Workout builder**: Basic logging implemented (type, duration, effort, notes). Exercise sets/reps in v1.1.
- **Habit tracker**: Daily check-off implemented. Streaks and stats in v1.1.
- **Recipe builder**: Placeholder; planned for v1.2.
- **iOS PWA**: Install instructions provided; works in standalone mode once added to home screen.

## Roadmap

### v1.1
- South African food support improvements
- Copy yesterday's meals
- Frequent foods list
- Meal templates  
- Full workout tracking
- Habit tracking UI
- Improved charts with Recharts
- Weekly review screen

### v1.2
- Recipe builder
- Grocery list
- Budget-friendly meal planning
- Workout templates
- Body measurement routines

### v1.3
- Optional Supabase auth + encrypted sync
- Web dashboard
- Trainer/coach dashboard

### v2
- Android Health Connect integration
- Apple HealthKit integration
- Wearable steps/sleep
- Progress photo timeline
- Advanced analytics

### v3
- Premium features (barcode scanning stays free):
  - Advanced meal planning
  - Encrypted cloud sync
  - Structured programs
  - Trainer dashboards
  - Family/team features

## Health Disclaimer

Me Body provides general wellness and nutrition tracking tools. It is not medical advice, diagnosis, or treatment. Speak to a qualified healthcare professional before making major diet, exercise, or health changes, especially if you have a medical condition, are pregnant, have a history of eating disorders, or take medication.

This app avoids shame-based coaching. Missing a log or exceeding a target does not mean failure. The goal is awareness, consistency, and sustainable progress.

## License

MIT

## Production URL

[https://me-body.vercel.app](https://me-body.vercel.app)

## GitHub Repository

[https://github.com/Joshmoodle001/me-body](https://github.com/Joshmoodle001/me-body)
