# N-finder Build Status

## Milestone 1: Inspect and Plan - DONE (commit 9ef6a48)
Backend skeleton: FastAPI app, GET /api/health, CORS via NFINDER_CORS_ORIGINS, 1 pytest test.

## Milestone 2: Frontend foundation - DONE (commit 83ad488)
Next.js 16.4.3 App Router, React 19.3.0, Tailwind 4.3.3, TypeScript ~5.9.3 (pinned: typescript-eslint
does not support TS 7), ESLint 9. Design tokens in `app/globals.css`, self-hosted OFL fonts
(`app/fonts/LICENSES.md`), UI primitives in `components/ui/`, header/footer in `components/layout/`.
Kokonut UI "Slide Text Button" effect adapted in `components/ui/button.tsx` (MIT, attributed).
React Bits (MIT + Commons Clause) and Obsidian UI were reviewed; nothing integrated.

## Milestone 3: Functional discovery on a sample catalogue - DONE (this commit)

### Features implemented (all verified in a real browser, see results below)
- **Sample catalogue** (`lib/movies/sample-movies.ts`): 44 real films. Titles, years and directors are
  general knowledge and are NOT verified against an external source. Synopses are original wording.
  Mood ratings and pacing are subjective curated demo classifications. The UI says all of this
  (Discover notice, detail dialog). No poster URLs are bundled (no reliable licensed source).
- **Mood engine**: five native range sliders, all live. Scale 0..100 per dimension (0 = low pole,
  100 = high pole, 50 = balanced), documented in `lib/mood-dimensions.ts`. Visible readout
  ("leaning hopeful . 70"), `aria-valuetext`, keyboard support from the native input, Reset button,
  collapsible panel on small screens.
- **Scoring** (`lib/scoring/mood-score.ts`, documented in the file header): per dimension
  closeness = 1 - |pref - rating|/100; weight = 1 + 2*|pref - 50|/50 (1..3); score = weighted mean x100.
  Deterministic; ties break by title then id. It is a RELATIVE compatibility score, not a probability,
  and the UI states that. Missing/non-finite film attributes are skipped; preferences are clamped
  and NaN becomes 50. Pacing and themes are displayed but NOT scored yet.
- **Explanations** (`lib/scoring/explain.ts`): built from the same per-dimension numbers as the score.
  Levels: close <=15, partial <=35, far >35 points apart. Detail view groups them into close matches,
  partial matches and potential mismatches, plus genre-filter matches.
- **Search + genre filter** (`lib/movies/filter.ts`): case- and accent-insensitive title search;
  genre chips with "any selected genre" semantics; combined with AND against search; ranking is computed
  first so filters never change the order. Empty state with a clear-filters action.
- **Movie cards** (`components/movies/`): generated fallback artwork (deterministic per id), title, year,
  up to two genres, compatibility meter, save button. `posterUrl` is supported (image hides itself on
  load error) but unused.
- **Detail view**: native `<dialog>` (focus trap, Escape, inert background, focus returns to opener),
  backdrop-click and close button, full-screen sheet on mobile, body scroll lock.
- **Watchlist** (`lib/watchlist/`): localStorage key `nfinder.watchlist.v1`, built on
  `useSyncExternalStore` so no browser API runs during server render. De-duplicated, restored on refresh,
  cross-tab `storage` events handled. Malformed data -> treated as empty with a notice (next save replaces
  it). Unavailable/blocked/over-quota storage -> in-memory fallback with a notice. Unknown (stale) ids are
  ignored with a note. `/watchlist` renders nothing for the list until hydrated, to avoid a wrong flash
  of "Nothing saved yet".
- Landing page copy updated to match what now works. No backend, auth, database or AI integration added.

### Files changed or added (frontend/)
New logic: `lib/movies/{types,sample-movies,filter,poster-art}.ts`, `lib/scoring/{mood-score,explain}.ts`,
`lib/watchlist/{storage,store,use-watchlist}.ts`. New tests next to each (`*.test.ts`, 7 files).
New UI: `components/movies/{movie-card,movie-poster,movie-detail-dialog,compatibility-meter,genre-filter}.tsx`,
`components/mood/mood-panel.tsx`, `components/discover/discover-view.tsx`,
`components/watchlist/{watchlist-view,watchlist-notice}.tsx`.
Modified: `lib/mood-dimensions.ts` (scale docs, `name`, preference types), `components/mood/mood-dimension-row.tsx`
(now live), `app/discover/page.tsx`, `app/watchlist/page.tsx`, `app/page.tsx` (copy only),
`package.json` (+vitest, @types/node ^22, scripts `test`), `vitest.config.mts`.
Backend untouched.

### Dependencies
Added dev-only: `vitest` 5.0.5. Bumped `@types/node` ^20 -> ^22 (vitest peer requirement; matches the
Node 22 runtime). No new UI or runtime libraries.

### Commands run and actual results (final code)
- `npm test` (vitest): 7 files, 63 tests passed
- `npm run typecheck`: exit 0
- `npm run lint`: exit 0, no output
- `npm run build`: exit 0; /, /_not-found, /discover, /watchlist all static
- backend `python -m pytest -q`: 1 passed, 1 warning (unchanged)
- Test-suite sanity: deliberately ignoring the `focus` slider in the scorer made exactly 3 tests fail;
  restored afterwards and all pass.
- Browser run (Playwright/Chromium against `next start`, 56 checks, 56 passed): 44 cards; every slider
  reorders results via keyboard (Home/End) and the top film moves toward the chosen pole; reset restores
  the default order; identical inputs give identical order; search, genre, combined filters and empty
  state; dialog open/close via click, Enter, Escape, close button and backdrop, focus moves in, is
  trapped, and returns to the opener; save/remove, no duplicates, persistence across reload, watchlist
  page; malformed storage and blocked localStorage both handled without errors; no horizontal overflow
  at 1366/820/390 px; mobile dialog fills the viewport; mobile mood panel collapses; no console errors.
  The browser script lives in /tmp and is NOT committed (no e2e framework added).
- NOT run: automated accessibility audit (axe/Lighthouse), Firefox/Safari, a real screen reader,
  real touch devices. Colour contrast is hand-calculated.

### Problems found and fixed this milestone
- vitest peer conflict with `@types/node@^20`: fixed by aligning to ^22 (no `--force`).
- Slider readout overflowed the panel on long labels; card meters misaligned across rows; chips touched
  the search field; "rated leans X" wording was ungrammatical. All fixed and re-measured.
- One of my own e2e assertions was wrong (CSS uppercase vs DOM text); verified against the DOM, fixed.

## Known limitations
- Catalogue is 44 films of demo data; metadata is unverified; no real posters (all films use generated art).
- Themes and pacing are shown but do not affect ranking. No genre/theme similarity yet.
- Mood preferences, search and filters are not persisted or URL-addressable (reset on reload).
- Scoring runs in the browser only. There is no backend recommendation endpoint, no Wildcard mode, no
  excluded-genre or "unwanted attribute" controls, and no diversity logic yet.
- TS types (`Movie`, `MoodPreferences`) are not yet mirrored by Pydantic schemas.
- Watchlist is per-browser; saved ids that leave the catalogue are ignored, not cleaned up.
- After removing a film from the Watchlist page, keyboard focus is not moved to a sensible neighbour.
- Starlette TestClient deprecation warning (backend). `frontend/README.md` is still scaffold boilerplate.
- Shell is /bin/sh: use `bash -c` for PIPESTATUS; start servers with `setsid nohup ... &` and stop them
  by exact PID (never `pkill -f` with a pattern that appears in your own command).

## Next recommended milestone: Milestone 4 - backend recommendation engine
1. Pydantic schemas mirroring `Movie`/`MoodPreferences`; move the sample catalogue to a shared JSON data
   file (or generate the TS file from it) so frontend and backend cannot drift.
2. Implement the deterministic Python engine reproducing the documented scoring, plus genre and theme
   matching, excluded genres, diversity, and a distinct Wildcard strategy. pytest coverage for ranking,
   exclusions, missing metadata, wildcard and explanation accuracy. Port-parity test against the TS scores.
3. FastAPI endpoints: GET /api/movies, POST /api/recommendations (validated), wildcard endpoint.
4. A small typed API client in the frontend with real loading/error states (network calls are genuinely
   async then), keeping the local scoring as a documented fallback only if it is clearly labelled.
