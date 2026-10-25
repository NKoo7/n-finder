# N-finder: Find your next obsession.

A movie discovery prototype. Instead of picking a genre, you set five mood sliders
(Dark/Hopeful, Relaxing/Intense, Realistic/Surreal, Character/Plot-driven, Predictable/Unpredictable)
and the films re-rank, each with a plain-language explanation of why it fits. **Wildcard** picks one film
outside your usual genres that still matches your mood.

## Run it (two terminals)

Needs Python 3.12+ and Node 22+.

```bash
# 1. Backend (FastAPI) on http://localhost:8000
cd backend
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000

# 2. Frontend (Next.js) on http://localhost:3000
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. API docs: http://localhost:8000/docs.
The frontend still works if the backend is down (it ranks with a built-in copy of the scorer and says so),
but Wildcard needs the backend.

Config: copy `backend/.env.example` and `frontend/.env.example` if you need non-default URLs.
`NFINDER_CORS_ORIGINS` (backend) must include the frontend's origin; `NEXT_PUBLIC_API_URL` (frontend)
must point at the backend. Neither holds secrets.

## Tests and checks

```bash
cd backend  && . .venv/bin/activate && python -m pytest -q
cd frontend && npm test && npm run typecheck && npm run lint && npm run build
```

## What is real, and what is not

- **Sample data only.** 44 films in `backend/app/data/movies.json` (generated from
  `frontend/lib/movies/sample-movies.ts` by `node scripts/export-catalogue.mjs`). Titles, years and
  directors are from general knowledge and are not verified. **Mood ratings are subjective, curated demo
  classifications, not facts.** No TMDB or other API is connected; no posters (generated art is used).
- **Scores are relative compatibility** between your sliders and the demo ratings. They are not a
  probability that you will enjoy a film.
- **No machine learning.** The engine is deterministic weighted attribute matching plus genre/theme
  overlap (`backend/app/services/recommender.py`, formula documented in its header).
- **Watchlist** is stored in your browser's localStorage. There are no accounts and no database.
- The scorer exists in Python (source of truth) and TypeScript (offline fallback). A test compares them;
  regenerate the fixture with `cd backend && PYTHONPATH=. python scripts/make_parity_fixture.py` after
  changing scoring.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | liveness |
| GET | `/api/movies`, `/api/movies/{id}` | catalogue |
| POST | `/api/recommendations` | ranked films for `preferences`, optional `genres`, `excluded_genres`, `themes`, `limit`, `diversify` |
| POST | `/api/wildcard` | one film outside the usual genres, seeded (`seed`) |

## Known limitations

Demo catalogue; themes/genres are only used by the API (the UI sends the mood sliders and a genre hint to
Wildcard); no excluded-genre or theme controls in the UI; preferences/filters reset on reload;
no authentication; not tested in Firefox/Safari or with a screen reader.
