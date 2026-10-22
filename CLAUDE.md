# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev         # Vite dev server (http://localhost:5173, falls back to the next free port)
npm run build       # tsc --noEmit, then vite build
npm run typecheck   # tsc --noEmit only
npm run test        # vitest run (all tests)
node node_modules/vitest/vitest.mjs run src/lib/lib.test.ts            # one test file
node node_modules/vitest/vitest.mjs run -t "name fragment"             # one test by name
```

There is no linter configured. Tests are node-environment unit tests under `src/**/*.test.ts` (filters, go-back signal logic, WCAG contrast of design tokens); there are no component or browser tests.

The project path contains a `:`, which breaks npm's `node_modules/.bin` PATH lookup. That is why scripts call tools via `node node_modules/...` and why `vite.config.ts` sets `server.fs.strict: false`. Keep that style when adding scripts.

## Architecture

React + TypeScript + Vite + React Router, plain CSS (no UI or CSS library). Mobile-first notebook where a family logs restaurant visits (thumbs, optional detail ratings, photos) and later filters for a quick Friday-night pick.

**Two data modes behind one interface.** `src/data/repositories.ts` defines async `PlaceRepository`, `VisitRepository`, `PhotoRepository`, `HouseholdRepository`. `src/data/index.ts` is the single swap point: if `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set (`.env.local`, see `.env.example`) it uses `src/data/supabase/` (real accounts, shared household, private photo bucket); otherwise `src/data/local/` (localStorage for records, hand-written IndexedDB wrapper for photo blobs, seeded from `src/data/seed.ts`). Components and `src/state` must never know which is active. Restart the dev server after changing env vars.

**Layering** (dependencies point down):
- `src/routes`, `src/components`: UI. `AuthGate` wraps the app and only gates in Supabase mode (sign-in, password reset via `NewPassword`, then `HouseholdSetup`).
- `src/state`: `DataProvider` and hooks (`useAsync`, `useSession`, `useHousehold`, `usePlaceSummaries`).
- `src/services`: business rules that span repositories (e.g. logging a visit to a Want-to-try place moves it to Been).
- `src/lib`: pure functions only (filtering, sorting, go-back signal, dates, image resize, contrast). No React, no storage. This is where tests live.
- `src/styles/tokens.css`: all colors, type, spacing, radius. A test checks every text/background token pair against WCAG AA, so changing a color can fail `npm run test`.

**Domain rules worth knowing before editing** (rationale in `DECISIONS.md`):
- Ratings are 1–3, where 3 is always the best outcome.
- The go-back signal is derived from a place's latest visit, never stored. A thumbs-up with an adult "no" vote shows "Mixed".
- "Roomy"/"Short wait" filters use the latest visit that rated that dimension; "Good for newborns/toddlers" requires a thumbs-up visit tagged with that age. Filters combine with AND.
- Dates are `YYYY-MM-DD` strings, not timestamps.
- Cuisine belongs to `Place`, not `Visit`; a visit to a place without cuisine fills it in.
- Children are tagged only by age, never by name.
- A visit's `photoIds` are derived from the photos table in Supabase mode, not stored twice.

**Supabase backend** (`supabase/migrations/`, applied in order): row level security on every table keyed on household membership (max two adults per household); households and members are created only via the `create_household` / `join_household` DB functions; composite foreign keys (id + household id) stop cross-household references; the membership helper lives in a non-exposed `private` schema; photos go to a private `photos` bucket (folder per household) and are shown via short-lived signed URLs. Only the publishable key belongs in the app, never a `service_role` key. Password-reset redirects require the deployed/local origin to be in Supabase Auth Redirect URLs.

**Deployment:** Vercel; `vercel.json` rewrites everything to `index.html` so deep links work in the SPA.

`DECISIONS.md` is a running log of what was built, why, and what was deliberately left out; append to it when making a notable product or design decision. `README.md` has full Supabase setup steps.
