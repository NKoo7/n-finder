"""Writes frontend/lib/scoring/parity-fixture.json: Python's scores for fixed slider settings.
The frontend test asserts the TypeScript scorer matches. Run from backend/: PYTHONPATH=. python scripts/make_parity_fixture.py"""
import json
from pathlib import Path

from app.schemas.movie import MoodProfile, RecommendationRequest
from app.services.catalogue import load_catalogue
from app.services.recommender import score_movie

CASES = [
    {},
    {"tone": 0, "intensity": 100},
    {"tone": 85, "intensity": 30, "realism": 10},
    {"tone": 100, "intensity": 0, "realism": 100, "focus": 0, "predictability": 100},
    {"focus": 100, "predictability": 100},
    {"tone": 33, "intensity": 67, "realism": 41, "focus": 59, "predictability": 12},
]
movies = load_catalogue()[1]
out = []
for prefs in CASES:
    req = RecommendationRequest(preferences=MoodProfile(**prefs))
    out.append({"preferences": prefs, "scores": {m.id: round(score_movie(m, req).raw, 6) for m in movies}})
target = Path(__file__).resolve().parents[2] / "frontend" / "lib" / "scoring" / "parity-fixture.json"
target.write_text(json.dumps(out, indent=1) + "\n")
print(f"wrote {target.name}: {len(out)} cases x {len(movies)} films")
