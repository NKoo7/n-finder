from fastapi import APIRouter, HTTPException

from app.schemas.movie import (
    Movie,
    RecommendationRequest,
    RecommendationResponse,
    WildcardRequest,
    WildcardResponse,
)
from app.services.catalogue import load_catalogue
from app.services.recommender import recommend, wildcard

router = APIRouter()


@router.get("/movies", tags=["movies"])
def list_movies() -> dict:
    label, movies = load_catalogue()
    return {"label": label, "count": len(movies), "movies": movies}


@router.get("/movies/{movie_id}", response_model=Movie, tags=["movies"])
def get_movie(movie_id: str) -> Movie:
    for m in load_catalogue()[1]:
        if m.id == movie_id:
            return m
    raise HTTPException(status_code=404, detail="Movie not found")


@router.post("/recommendations", response_model=RecommendationResponse, tags=["recommendations"])
def recommendations(req: RecommendationRequest) -> RecommendationResponse:
    results, total = recommend(load_catalogue()[1], req)
    return RecommendationResponse(results=results, total_candidates=total)


@router.post("/wildcard", response_model=WildcardResponse, tags=["recommendations"])
def wildcard_pick(req: WildcardRequest) -> WildcardResponse:
    return wildcard(load_catalogue()[1], req)
