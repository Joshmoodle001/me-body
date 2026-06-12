# Me Body

**Private body intelligence, nutrition, habits, and progress tracking.**

Track food, habits, workouts, body metrics, and progress without shame, ads, or confusing paywalls. Your data stays local on your device by default.

---

## Features

- **Privacy-first** — All data stored locally via IndexedDB (Dexie.js). No account required.
- **Works offline** — Core logging, dashboard, and coaching work without internet.
- **Free barcode scanning** — Look up foods by barcode through Open Food Facts. No subscription.
- **Evidence-based targets** — Mifflin-St Jeor calculations with adaptive adjustment from trend data.
- **Calm coaching** — Rule-based insights. No guilt, no shame, no aggressive targets.
- **Health-aware** — Medication, chronic condition, pregnancy, and cycle-aware guidance.
- **South African support** — Local foods, meal templates, portion guides for SA users.
- **Food confidence scoring** — Every food entry shows its data quality: Verified, Good, Estimate, or Low confidence.
- **Calorie-hidden mode** — Option to track without calorie/macro numbers, focusing on meal balance and habits.
- **Installable PWA** — Add to your phone's home screen. Works like a native app.
- **Export/delete anytime** — One-tap export your data as JSON. Delete everything locally.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS custom properties |
| State | Zustand + React hooks |
| Forms | React Hook Form + Zod |
| Local DB | Dexie.js (IndexedDB wrapper) |
| Charts | Recharts |
| Icons | Lucide React |
| Hosting | Vercel |
| Optional sync | Supabase (future) |

## Setup

```bash
# Clone
git clone https://github.com/joshmule/me-body.git
cd me-body

# Install
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Run locally
npm run dev
# Open http://localhost:3000
```

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm run typecheck # TypeScript type checking
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_APP_NAME="Me Body"
OPEN_FOOD_FACTS_BASE_URL="https://world.openfoodfacts.org"
OPEN_FOOD_FACTS_USER_AGENT="MeBody/0.2 (your-email@example.com)"
USDA_FDC_API_KEY="DEMO_KEY"
```

Optional Supabase (for future cloud sync):
```env
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```

## Vercel Deployment

1. Push to GitHub.
2. Connect the repository to Vercel.
3. Add environment variables in Vercel Project Settings.
4. Deploy.

The app uses Next.js API routes to proxy USDA and Open Food Facts requests, so API keys stay server-side.

## PWA Installation

### Android / Chrome
1. Open the app in Chrome.
2. Tap the menu (three dots).
3. Tap "Add to Home screen".

### iOS / Safari
1. Open the app in Safari.
2. Tap the Share button.
3. Scroll down and tap "Add to Home Screen".

## Free Data Sources

- **Open Food Facts** — Barcode/package food lookup (ODbL, no auth for reads)
- **USDA FoodData Central** — Core nutrient database (CC0, DEMO_KEY for prototype)
- **SAFOODS / FoodFinder** — South African food composition (architecture ready, licensing TBD)

No paid APIs. No Nutritionix. No Edamam.

## Privacy

- All food logs, body metrics, and profile data stay on your device via IndexedDB.
- Food search requests go to Open Food Facts or USDA API routes (server-side proxied).
- No ads. No third-party analytics. No data sharing.
- Export your data as JSON anytime.
- Delete all local data with one tap.

## Research Corpus

The `content/research/` directory contains structured evidence:

- `source-registry.json` — 13 canonical sources with evidence tiers
- `evidence-map.json` — 11 evidence domains with app implications
- `body-ontology.json` — 40+ nodes mapping body systems, metrics, triggers
- `coaching-rules.json` — 14 evidence-based coaching rules
- `safety-rules.json` — 8 clinical red-flag rules
- `food-confidence-rules.json` — Confidence scoring model
- `starter-meal-templates.json` — 10 SA-focused meal templates
- `starter-fact-cards.json` — 25 evidence-based fact cards

## Disclaimer

**Me Body provides general wellness and nutrition tracking tools. It is not medical advice, diagnosis, or treatment.** Speak to a qualified healthcare professional before making major diet, exercise, or health changes, especially if you have a medical condition, are pregnant, have a history of eating disorders, or take medication.

This app avoids shame-based coaching. Missing a log or exceeding a target does not mean failure.

## Project Structure

```
me-body/
  app/                  # Next.js App Router pages
    layout.tsx          # Root layout with PWA meta
    page.tsx            # Public landing page
    globals.css         # Vital Ember theme + Midnight Ember dark mode
    app/                # App shell (bottom nav)
      dashboard/        # Main dashboard
      log/ progress/ scan/ coach/ settings/
    onboarding/         # goals, body, health, preferences, visibility, summary
    food/               # search, manual, [id], recipe
    api/                # USDA, Open Food Facts proxy routes
  components/           # UI, nutrition, scanner, progress, coach, PWA
  lib/                  # calculations, coaching, safety, foodConfidence, validation, contentSeed
  db/                   # Dexie localDb, schema, queries
  content/research/     # Evidence corpus JSON files
  public/               # Manifest, service worker, icons
```

## License

Private project. Not licensed for redistribution.

## Production URL

[Vercel Production URL — updated on deploy]
