import json
from functools import lru_cache
from pathlib import Path

from app.schemas.movie import Movie

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "movies.json"


@lru_cache(maxsize=1)
def load_catalogue() -> tuple[str, tuple[Movie, ...]]:
    """Return (dataset label, movies). Shared with the frontend via scripts/export-catalogue.mjs."""
    raw = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    return raw["label"], tuple(Movie.model_validate(m) for m in raw["movies"])
