# Decisions

A running log of what was built, why, and what was deliberately left out.

## Phase 1: setup, types, data layer, shell

**Built**
- Vite + React + TypeScript + React Router, plain CSS. No UI library or CSS framework, to keep the design system small and fully understood.
- Domain types for Household, Member, Place, Visit, Photo and Rating.
- Repository interfaces (`PlaceRepository`, `VisitRepository`, `PhotoRepository`, `HouseholdRepository`) with a local implementation: localStorage for small JSON records, IndexedDB for photo blobs. One file (`src/data/index.ts`) decides which implementation the app uses.
- Seed data: 11 invented places (8 been, 3 want to try), including a visit where the two adults disagree and a place that recovered after a bad first visit.
- Design tokens in one file; a test checks every text/background pair against WCAG AA.
- App shell: bottom navigation on phones, left rail from 768px.

**Why**
- *Async repositories even though local storage is synchronous.* A Supabase implementation is async, so making the contract async now avoids touching every component later.
- *Ratings are 1 to 3 where 3 is always the best outcome.* One simple scale makes filters like "Roomy" and "Short wait" a single comparison, and three taps-to-choose steps suit one-handed use.
- *"Noise and air" is one rating,* not two, to keep the optional details short.
- *The go-back signal is derived from the latest visit, never stored.* A place can recover after a bad night. A thumbs up with an adult "no" vote shows as "Mixed" so disagreement stays honest.
- *Dates are YYYY-MM-DD strings,* not timestamps, so "last visit" never shifts across time zones.
- *Hand-written IndexedDB wrapper (about 40 lines)* instead of a library, to keep dependencies minimal.

**Not built (on purpose)**
- Supabase client, accounts, auth, public reviews, social feed, importing, discovery or search APIs, payments.
- Children's names anywhere. Kids are only tagged by age at the time of the visit.

**Tooling note**
- The project folder's path contains a `:`, which breaks `npm run` (PATH delimiter) and Vite's file-serving check. Scripts call tools through `node node_modules/...` and `vite.config.ts` sets `server.fs.strict: false` (dev server only).

## Phase 2: quick log and photos

**Built**
- One-screen log: place name (native autocomplete from existing places), two large thumbs buttons with words, date defaulting to today. Minimum entry is name + thumb.
- Optional details sit behind a collapsed "Add details": five tap ratings, kids' age tags, a would-go-back vote per adult, a one-line note, photos. Details can be added later from the place page.
- Photos: camera button (`capture`) plus library button, resized in the browser to 1200px on the long edge and re-encoded as JPEG (0.8), stored as blobs in IndexedDB behind `PhotoRepository`. A hint asks for food and space over close-ups of kids.
- Logging a visit for a place on the Want to try list moves it to Been (`src/services/visits.ts`, one function, no UI involvement).

**Why**
- *Radio inputs and `aria-pressed` buttons* instead of custom widgets, so keyboard and screen readers work without extra code.
- *Tap-again-to-clear on ratings,* since every detail is optional and a mis-tap should be reversible.
- *Inline error message, not a disabled Save button,* so the reason is always visible and announced.

## Phase 3: Friday-night view

**Built**
- Home lists places you've been, most recent visit first. Cards show photo (or neutral placeholder), name, go-back signal, last visit date, and nothing else.
- Filter chips (Roomy, Short wait, Good for newborns, Good for toddlers, Would go back) combine with AND. On phones they are one swipeable row so the list starts higher.
- Place page: signal, visit history, who logged each visit, each adult's vote, ratings in words, photos.

**Why**
- *"Roomy" and "Short wait" use the latest visit that rated that dimension,* so a quick log without details doesn't hide an earlier rating.
- *"Good for newborns/toddlers" needs a thumbs-up visit tagged with that age,* so a bad night doesn't count as a recommendation.
- *"Mixed" is shown instead of "We'd go back"* when an adult voted no on the latest visit.

## Phase 4: Want to try, household, polish

**Built**
- Want to try: add a name and optional "where did you find it"; "We went" opens the log form for that place; remove with a confirm.
- Household: who-are-you picker, editable names for both adults, household code, and a reset-to-sample-data button. All local.
- Responsive: bottom nav and floating "Log a visit" on phones; left rail and two-column cards from 768px.

**Why**
- *No separate first-run household gate.* The seed creates a household with the code `SAMPLE`, so the app is usable immediately; the code and picker live on the Us screen. A real gate belongs with real invites and accounts.
- *Native `window.confirm` for destructive actions,* the simplest accessible option for a prototype.

**Not built (on purpose)**
- Editing or deleting places that have visits, deleting visits, search, sorting options, sharing, notifications, streaks, badges, or any reminder.
- Automated browser tests; verification was manual plus unit tests for the logic and color contrast.

## Cuisine type (added after Phase 4)

**Built**
- Optional `cuisine` on a place, from ten plain options (American, Mexican, Italian, Asian, Seafood, Latin, Barbecue, Breakfast, Cafe, Other), each with a simple line icon.
- Shown on every card as a small icon plus the word, next to the last visit date. Set it in "Add details" when logging a new place, when saving a place to Want to try, or later from the place page.

**Why**
- *Cuisine belongs to the place, not the visit,* so it is stored on `Place`. Logging a visit to an existing place that has no cuisine fills it in.
- *Icon and word together,* so it never relies on a picture alone. Labels are one or two words so a card stays to three short lines.
- *It's optional and tucked into the details,* so the 15-second quick log is unchanged.
- This is a small step beyond the original brief, which kept cards to photo, name, signal and date. Say if you'd rather keep it off the card surface.

**Not built**
- Places with more than one cuisine.
- A migration for data saved before this change. Existing places simply show no cuisine until set; "Reset sample data" on the Us screen loads sample data that includes cuisines.

## Cuisine filter

**Built**
- One "Cuisine" chip at the start of the Friday-night filter row. Tapping it reveals a second row of cuisine chips (single choice). Once one is chosen, the chip shows that cuisine's icon and name. It combines with the other chips (AND) and "Clear filters" resets it.
- The second row lists only cuisines you have actually logged, so it never offers an empty result.

**Why**
- *One chip that expands, not ten more chips.* The main row stays short for the ten-second Friday decision; cuisine is there when you want it.
- *Single choice.* A place has one cuisine, so picking two would always return nothing.
- The filter logic (`applyFilters`, `cuisinesPresent` in `src/lib/filters.ts`) is a plain function with unit tests, like the other filters.

## Cuisine filter on Want to try

**Built**
- A row of cuisine chips (icon and word, single choice) just above the Want to try list. Tap one to narrow the list, tap it again to clear.
- The row lists only cuisines that are on the list, and appears only when there are at least two to choose between. With one cuisine, or none set, a filter would do nothing, so it stays hidden.

**Why**
- *A plain row, not an expanding chip as on the home screen.* This screen has no other filter chips competing for space, so showing the options directly saves a tap.
- *A selected cuisine is ignored once its last place leaves the list* (marked as visited or removed), so the list never gets stuck empty.
- Shares the `CuisinePicker` component and the `orderedCuisines` helper with the other cuisine controls.

## Smaller filter pills

Filter pills (home chips, the cuisine row, and the Want to try cuisine filter) are now 36px tall with 14px text, down from 48px and 16px. Form chips (age tags, cuisine picker while logging) stay at the full 48px.

**Why:** filters are a glance-and-tap control that should take less room, so more of the list shows on a phone. 36px is still above the WCAG 2.2 minimum target size of 24px. This trades a little of the original "large tap targets" goal on one control, on request.

## Connecting the Supabase backend

**Built**
- The Supabase implementation of every repository (`src/data/supabase/`), chosen automatically when `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set. Without them the app runs on local sample data, as before. No component changed to make this work, apart from the new sign-in screens.
- Schema, security rules and a private photos bucket, kept in `supabase/migrations/` so they can be reproduced.
- Email and password accounts, then a household step: one adult starts a household and gets a code; the other joins with it.

**Why**
- *Email and password, not magic links or anonymous sign-in,* by request. It is the most familiar flow and needs no email round trip to sign in.
- *Row level security on every table, keyed on household membership.* The key in the website is public by design, so the database, not the app, has to decide who sees what. This matters because the data includes photos taken near young children.
- *Households and members are created only by two database functions,* so nobody can add themselves to a household they were not invited to. The code is 12 random hex characters.
- *Composite foreign keys (id plus household id)* so a visit or photo can never point at another household's place or visit, even if someone tries.
- *Private photo bucket and signed links* instead of public URLs: a photo link stops working after an hour and can't be guessed.
- *The membership helper lives in a `private` schema,* so it is not callable through the public API.
- *"Who are you" is the account, not a picker.* The Us screen drops the Adult 1 / Adult 2 switch when connected, because signing in already says who is holding the phone.
- *A visit's photos are their own table;* a visit's `photoIds` are derived from it rather than stored twice.

**Verified**
- A database test ran as three throwaway users in a transaction that was rolled back. It confirmed that an outsider can't see, write, join, upload into, or re-point anything in someone else's household, that signed-out callers can't touch the tables or functions, and that a legitimate second adult can join and log a visit.

**Not built (on purpose)**
- Password reset, email change, account deletion, and live updates between the two phones.
- Importing the local sample data or a browser's saved data into Supabase.
- Rate limiting on household codes beyond what Supabase provides by default.

**Worth knowing**
- The project already contained a function called `rls_auto_enable()` that this app did not create. Supabase's security checker flags it as callable by signed-out users. It was left untouched; consider reviewing it.
- Sign-up emails use the confirmation link, so the Site URL and redirect URLs in the Supabase dashboard must match where the app runs.

## Sign-in header, from the Figma design

The top of the sign-in screen now follows the new Figma design (frame "Frame 2"): a fork-and-knife icon, the headline "Your dining story starts here" and a short line below, all centered. The email and password form underneath is unchanged.

- **Serif headline.** The design sets the headline in Playfair Display Bold, which is the app's only serif. It is installed from `@fontsource/playfair-display` (bold weight only), so the font is served with the app rather than fetched from Google at runtime. The rest of the app keeps its single sans-serif family.
- **New tokens.** `--color-hero-title`, `--color-hero-text`, `--font-display` and `--text-hero` hold the design's values, and both new colors are checked for WCAG AA contrast on the page background in the token test.
- **Icon** is the SVG exported from the design, used as is.
- **Headline size** is 40px as designed, scaling down slightly on very narrow phones so it stays on two lines.
- **Copy** is exactly as written in the design, including "for you family" (probably meant "your family") and the repeated "Your dining story".
