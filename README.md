# Restaurant Journal

A calm, mobile-first notebook for families to record which restaurants worked for their kids, so choosing on a Friday night takes about ten seconds.

Frontend only for now: React, TypeScript, Vite, React Router and plain CSS. Data is mock data saved in the browser.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # unit tests (filters, signal logic, color contrast)
npm run build      # typecheck + production build
```

> The npm scripts call Vite, TypeScript and Vitest through `node node_modules/...` on purpose. If the project folder's path contains a `:`, npm cannot find `node_modules/.bin`, and `vite.config.ts` relaxes Vite's file-serving check for the same reason. Renaming the folder lets you simplify both.

Sample data (about ten invented South Florida places) is loaded the first time the app opens. It is stored in your browser; clearing site data resets it.

## How the code is organized

| Folder | What lives there |
| --- | --- |
| `src/types` | Household, Member, Place, Visit, Photo, Rating |
| `src/data` | Repository interfaces, the swap point (`index.ts`), local implementation, seed data |
| `src/lib` | Pure functions (filtering, sorting, go-back signal, dates, contrast). No React, no storage. |
| `src/state` | `DataProvider` and small hooks |
| `src/styles` | `tokens.css` (all colors, type, spacing, radius), base and shell styles |
| `src/services` | Business rules that use the repositories (logging a visit, moving Want to try to Been) |
| `src/components`, `src/routes` | UI |

## Backend: Supabase

The app has two data modes behind the same repository interfaces. Components never know which is active.

| Mode | When | What it does |
| --- | --- | --- |
| Supabase | `.env.local` has both variables below | Real accounts (email and password), a shared household, data and photos in your Supabase project |
| Local | Variables not set | No sign-in; sample data and photos saved in the browser |

### Set it up

1. Copy `.env.example` to `.env.local` and fill in your project's URL and **publishable** key (Project Settings, API Keys). The publishable key is meant to be public; row level security protects the data. Never put a `service_role` or secret key in this app.
2. The schema is in `supabase/migrations/`. It has already been applied to the "Restaurant Journal" project. For a new project, run those files in order in the SQL editor (or with the Supabase CLI).
3. In the Supabase dashboard, open **Authentication, URL Configuration** and set the **Site URL** to `http://localhost:5173`, adding `http://localhost:5173/**` to the Redirect URLs. (Add your deployed address later.) This is where the confirmation link in the sign-up email sends people.
4. Optional for development: under **Authentication, Sign In / Providers, Email**, turn off **Confirm email** so a new account can sign in immediately. Leave it on for anything real.
5. Restart `npm run dev` after changing `.env.local`.

### How it works

- **Accounts:** each adult creates an account with email and password. After the first sign-in, one adult starts a household (this generates a code like `3F9A-C21B-7D04`) and the other joins with that code. A household has at most two adults.
- **Security:** every table has row level security keyed on household membership. People can only read or write their own household's places, visits and photos. Households and members can only be created through the `create_household` and `join_household` database functions.
- **Photos:** resized in the browser (about 1200px, JPEG), then stored in a **private** Supabase Storage bucket (`photos`), in a folder named after the household. They are shown through short-lived signed links.
- **Where the code lives:** `src/data/supabase/` is the Supabase implementation of the interfaces in `src/data/repositories.ts`. `src/data/index.ts` picks it when the environment variables are set.

### Known limits

- No password reset yet, and no live updates: the other adult's changes appear when you reload.
- Data saved in local mode is not copied to Supabase.
- Deleting a place with visits is not offered, so photo files are never orphaned. If you add that later, delete the photo files with the rows.
