"""Deterministic recommendation engine. No machine learning, no randomness.

score = attribute_match (mood sliders)  [+ genre_match] [+ theme_match]  - exclusions applied as hard filters

Attribute match (identical to the frontend's lib/scoring/mood-score.ts):
    closeness_d = 1 - |pref - rating| / 100
    weight_d    = 1 + 2 * |pref - 50| / 50                (1..3: pushed sliders count more)
    attribute   = 100 * sum(weight*closeness) / sum(weight)   over dimensions the film actually has

Genre / theme match are only used when the user supplied genres / themes. Each is the fraction of the
user's choices that the film satisfies, scaled 0..100. Final score blends the available parts:
    attribute 0.80, genre 0.12, theme 0.08  (weights re-normalised over the parts that apply)

Excluded genres are a hard filter, never a soft penalty, so an excluded film can never appear.
Diversity: greedy re-rank that discounts films sharing genres with already-picked ones.
Ties break by title then id, so identical inputs always give identical output.
"""
from __future__ import annotations

import math
from collections import Counter
from dataclasses import dataclass

from app.schemas.movie import (
    DIMENSIONS,
    DimensionReason,
    Movie,
    MoodProfile,
    Recommendation,
    RecommendationRequest,
    WildcardRequest,
    WildcardResponse,
)

W_ATTRIBUTE, W_GENRE, W_THEME = 0.80, 0.12, 0.08
CLOSE_MAX, PARTIAL_MAX = 15, 35  # same thresholds as the frontend explanations
DIVERSITY_PENALTY = 6.0  # score points per already-picked film sharing a genre (max 2 counted)
WILDCARD_MIN_ATTRIBUTE = 60.0  # wildcard picks must still fit the mood
WILDCARD_POOL = 5

NAMES = {"tone": "Tone", "intensity": "Intensity", "realism": "Realism", "focus": "Story focus", "predictability": "Predictability"}
POLES = {
    "tone": ("dark", "hopeful"),
    "intensity": ("relaxing", "intense"),
    "realism": ("realistic", "surreal"),
    "focus": ("character-driven", "plot-driven"),
    "predictability": ("predictable", "unpredictable"),
}


def _norm(text: str) -> str:
    return text.strip().casefold()


def _clamp(value: float) -> float:
    if not math.isfinite(value):
        return 50.0
    return min(100.0, max(0.0, value))


def describe_position(dimension: str, value: float) -> str:
    low, high = POLES[dimension]
    if value <= 20:
        return f"very {low}"
    if value <= 40:
        return f"leaning {low}"
    if value < 60:
        return "balanced"
    if value < 80:
        return f"leaning {high}"
    return f"very {high}"


def level_for(diff: float) -> str:
    return "close" if diff <= CLOSE_MAX else "partial" if diff <= PARTIAL_MAX else "far"


@dataclass(frozen=True)
class _Scored:
    movie: Movie
    raw: float
    attribute: float
    genre: float | None
    theme: float | None
    matched_genres: tuple[str, ...]
    matched_themes: tuple[str, ...]
    reasons: tuple[DimensionReason, ...]


def attribute_match(movie: Movie, prefs: MoodProfile) -> tuple[float, list[DimensionReason]]:
    total_w = total = 0.0
    reasons: list[DimensionReason] = []
    for dim in DIMENSIONS:
        rating = movie.mood.get(dim)
        if rating is None or not math.isfinite(rating):
            continue  # missing attribute: skipped, never treated as zero
        pref = _clamp(getattr(prefs, dim))
        diff = abs(pref - rating)
        weight = 1 + 2 * abs(pref - 50) / 50
        total_w += weight
        total += weight * (1 - diff / 100)
        level = level_for(diff)
        verdict = {"close": "a close match", "partial": "a partial match", "far": "a clear mismatch"}[level]
        reasons.append(
            DimensionReason(
                dimension=dim, preference=pref, rating=rating, difference=diff, level=level,
                summary=(
                    f"{NAMES[dim]}: you chose {describe_position(dim, pref)} ({round(pref)}); "
                    f"this film is rated {describe_position(dim, rating)} ({round(rating)}). That is {verdict}."
                ),
            )
        )
    return (0.0 if total_w == 0 else 100 * total / total_w), reasons


def _overlap(wanted: list[str], have: list[str]) -> tuple[float | None, tuple[str, ...]]:
    wanted_n = {_norm(w) for w in wanted if w.strip()}
    if not wanted_n:
        return None, ()
    have_map = {_norm(h): h for h in have}
    hit = sorted(have_map[w] for w in wanted_n if w in have_map)
    return 100 * len(hit) / len(wanted_n), tuple(hit)


def score_movie(movie: Movie, req: RecommendationRequest) -> _Scored:
    attr, reasons = attribute_match(movie, req.preferences)
    genre, mg = _overlap(req.genres, movie.genres)
    theme, mt = _overlap(req.themes, movie.themes)
    parts = [(W_ATTRIBUTE, attr)]
    if genre is not None:
        parts.append((W_GENRE, genre))
    if theme is not None:
        parts.append((W_THEME, theme))
    raw = sum(w * v for w, v in parts) / sum(w for w, _ in parts)
    return _Scored(movie, raw, attr, genre, theme, mg, mt, tuple(reasons))


def _eligible(movies: tuple[Movie, ...] | list[Movie], req: RecommendationRequest) -> list[Movie]:
    banned = {_norm(g) for g in req.excluded_genres}
    return [m for m in movies if not any(_norm(g) in banned for g in m.genres)]


def _order(scored: list[_Scored]) -> list[_Scored]:
    return sorted(scored, key=lambda s: (-s.raw, s.movie.title.casefold(), s.movie.id))


def _explain(s: _Scored, extra: str = "") -> str:
    if not s.reasons:
        base = "This film has no mood ratings, so it could not be compared with your sliders."
    else:
        close = [r for r in s.reasons if r.level == "close"]
        far = [r for r in s.reasons if r.level == "far"]
        base = (
            f"Mood match {round(s.attribute)}/100. "
            + (f"Closest on {', '.join(NAMES[r.dimension].lower() for r in close)}. " if close else "No dimension is a close match. ")
            + (f"Potential mismatch on {', '.join(NAMES[r.dimension].lower() for r in far)}." if far else "No clear mismatches.")
        )
    if s.matched_genres:
        base += f" Genre match: {', '.join(s.matched_genres)}."
    if s.matched_themes:
        base += f" Theme match: {', '.join(s.matched_themes)}."
    return (base + (" " + extra if extra else "")).strip()


def _to_rec(s: _Scored, extra: str = "") -> Recommendation:
    return Recommendation(
        movie=s.movie, score=round(s.raw), attribute_match=round(s.attribute, 2),
        genre_match=None if s.genre is None else round(s.genre, 2),
        theme_match=None if s.theme is None else round(s.theme, 2),
        matched_genres=list(s.matched_genres), matched_themes=list(s.matched_themes),
        reasons=list(s.reasons), explanation=_explain(s, extra),
    )


def recommend(movies: tuple[Movie, ...] | list[Movie], req: RecommendationRequest) -> tuple[list[Recommendation], int]:
    pool = _eligible(movies, req)
    ranked = _order([score_movie(m, req) for m in pool])
    if not req.diversify:
        return [_to_rec(s) for s in ranked[: req.limit]], len(pool)

    # Greedy diversity re-rank over the whole pool (deterministic).
    picked: list[_Scored] = []
    remaining = list(ranked)
    seen: dict[str, int] = {}
    while remaining and len(picked) < req.limit:
        def adjusted(s: _Scored) -> tuple[float, str, str]:
            repeats = min(2, sum(seen.get(_norm(g), 0) > 0 for g in s.movie.genres))
            return (-(s.raw - DIVERSITY_PENALTY * repeats), s.movie.title.casefold(), s.movie.id)
        best = min(remaining, key=adjusted)
        remaining.remove(best)
        picked.append(best)
        for g in best.movie.genres:
            seen[_norm(g)] = seen.get(_norm(g), 0) + 1
    return [_to_rec(s) for s in picked], len(pool)


def wildcard(movies: tuple[Movie, ...] | list[Movie], req: WildcardRequest) -> WildcardResponse:
    """A different strategy from `recommend`: step OUTSIDE the user's usual genres, but stay inside the mood.

    "Usual" = the genres they selected, or, if none, the genres that RECUR (appear in at least 2 of) their
    top-5 mood matches; if nothing recurs, the primary genre of the best match.
    Candidates must share no usual genre and still reach WILDCARD_MIN_ATTRIBUTE on the mood sliders.
    The pick is chosen from the best WILDCARD_POOL candidates using the seed, so repeated presses with
    different seeds vary, while the same seed always gives the same film.
    """
    pool = _eligible(movies, req)
    scored = _order([score_movie(m, req) for m in pool])
    if req.genres:
        usual = {_norm(g) for g in req.genres}
    else:
        counts = Counter(_norm(g) for s in scored[:5] for g in s.movie.genres)
        usual = {g for g, n in counts.items() if n >= 2}
        if not usual and scored and scored[0].movie.genres:
            usual = {_norm(scored[0].movie.genres[0])}
    usual_display = sorted({g for s in scored for g in s.movie.genres if _norm(g) in usual})

    candidates = [
        s for s in scored
        if s.attribute >= WILDCARD_MIN_ATTRIBUTE and not any(_norm(g) in usual for g in s.movie.genres)
    ]
    strategy = (
        "Outside your usual genres, inside your mood: candidates share no genre with "
        f"{', '.join(usual_display) or 'your usual picks'} and still fit the mood sliders."
    )
    if not candidates:
        return WildcardResponse(pick=None, strategy=strategy, usual_genres=usual_display, candidates_considered=0)
    top = candidates[:WILDCARD_POOL]
    chosen = top[req.seed % len(top)]
    extra = f"Wildcard: none of its genres ({', '.join(chosen.movie.genres)}) overlap your usual ({', '.join(usual_display)})."
    return WildcardResponse(
        pick=_to_rec(chosen, extra), strategy=strategy, usual_genres=usual_display,
        candidates_considered=len(candidates),
    )
