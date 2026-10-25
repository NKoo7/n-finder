from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

DimensionId = Literal["tone", "intensity", "realism", "focus", "predictability"]
DIMENSIONS: tuple[DimensionId, ...] = ("tone", "intensity", "realism", "focus", "predictability")


class MoodProfile(BaseModel):
    """Five 0..100 values. 0 = low pole, 100 = high pole, 50 = balanced (see frontend/lib/mood-dimensions.ts)."""

    model_config = ConfigDict(extra="forbid")

    tone: float = Field(50, ge=0, le=100)
    intensity: float = Field(50, ge=0, le=100)
    realism: float = Field(50, ge=0, le=100)
    focus: float = Field(50, ge=0, le=100)
    predictability: float = Field(50, ge=0, le=100)


class Movie(BaseModel):
    id: str
    title: str
    year: int
    directors: list[str] = []
    genres: list[str] = []
    synopsis: str = ""
    # Optional on purpose: the engine must cope with films that are missing ratings.
    mood: dict[str, float] = {}
    pacing: float | None = None
    themes: list[str] = []
    posterUrl: str | None = None


class RecommendationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    preferences: MoodProfile = MoodProfile()
    genres: list[str] = Field(default_factory=list, max_length=20, description="Preferred genres (any match).")
    excluded_genres: list[str] = Field(default_factory=list, max_length=20, description="Films with any of these are removed.")
    themes: list[str] = Field(default_factory=list, max_length=20, description="Preferred themes (any match).")
    limit: int = Field(12, ge=1, le=100)
    diversify: bool = True


class WildcardRequest(RecommendationRequest):
    seed: int = Field(0, ge=0, le=2**31 - 1, description="Same seed + same inputs = same pick.")


class DimensionReason(BaseModel):
    dimension: DimensionId
    preference: float
    rating: float
    difference: float
    level: Literal["close", "partial", "far"]
    summary: str


class Recommendation(BaseModel):
    movie: Movie
    # Relative compatibility, 0..100. NOT a probability that the user will enjoy the film.
    score: int
    attribute_match: float
    genre_match: float | None
    theme_match: float | None
    matched_genres: list[str]
    matched_themes: list[str]
    reasons: list[DimensionReason]
    explanation: str


class RecommendationResponse(BaseModel):
    results: list[Recommendation]
    total_candidates: int
    note: str = "Scores are relative compatibility with your settings, not a probability of enjoyment."


class WildcardResponse(BaseModel):
    pick: Recommendation | None
    strategy: str
    usual_genres: list[str]
    candidates_considered: int
    note: str = "Scores are relative compatibility with your settings, not a probability of enjoyment."
