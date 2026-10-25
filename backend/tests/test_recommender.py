import pytest

from app.schemas.movie import DIMENSIONS, MoodProfile, Movie, RecommendationRequest, WildcardRequest
from app.services.catalogue import load_catalogue
from app.services.recommender import attribute_match, recommend, score_movie, wildcard

MOVIES = load_catalogue()[1]


def req(**kw) -> RecommendationRequest:
    prefs = kw.pop("prefs", {})
    return RecommendationRequest(preferences=MoodProfile(**prefs), limit=kw.pop("limit", 44), diversify=kw.pop("diversify", False), **kw)


def ids(recs):
    return [r.movie.id for r in recs]


def film(id_, mood, genres=("Drama",), title=None):
    return Movie(id=id_, title=title or id_, year=2000, genres=list(genres), mood=mood)


def test_catalogue_is_loaded_and_valid():
    assert 30 <= len(MOVIES) <= 50
    assert len({m.id for m in MOVIES}) == len(MOVIES)


@pytest.mark.parametrize("dim", DIMENSIONS)
def test_every_slider_changes_the_ranking(dim):
    low = ids(recommend(MOVIES, req(prefs={dim: 0}))[0])
    high = ids(recommend(MOVIES, req(prefs={dim: 100}))[0])
    assert low != high


@pytest.mark.parametrize("dim", DIMENSIONS)
def test_slider_pulls_matching_pole_to_top(dim):
    lo = recommend(MOVIES, req(prefs={dim: 0}))[0][0].movie.mood[dim]
    hi = recommend(MOVIES, req(prefs={dim: 100}))[0][0].movie.mood[dim]
    assert lo < hi


def test_perfect_and_opposite_scores():
    flat0 = film("a", dict.fromkeys(DIMENSIONS, 0))
    flat100 = film("b", dict.fromkeys(DIMENSIONS, 100))
    r = req(prefs=dict.fromkeys(DIMENSIONS, 0))
    assert round(score_movie(flat0, r).raw) == 100
    assert round(score_movie(flat100, r).raw) == 0


def test_known_value_matches_hand_calculation():
    # prefs: tone 0 (weight 3), others 50 (weight 1). Film: tone 20, others 50.
    # closeness: tone 0.8, others 1.0 -> (3*0.8 + 4*1) / 7 = 0.9142857 -> 91.43
    m = film("x", {"tone": 20, "intensity": 50, "realism": 50, "focus": 50, "predictability": 50})
    score, _ = attribute_match(m, MoodProfile(tone=0))
    assert score == pytest.approx(91.4286, abs=1e-3)


def test_deterministic_and_does_not_mutate_catalogue():
    before = [m.id for m in MOVIES]
    r = req(prefs={"tone": 10, "intensity": 90}, genres=["Thriller"], diversify=True, limit=10)
    a, b = recommend(MOVIES, r)[0], recommend(MOVIES, r)[0]
    assert ids(a) == ids(b)
    assert [m.id for m in MOVIES] == before


def test_excluded_genres_never_appear_even_with_matching_mood():
    r = req(prefs={"tone": 0, "intensity": 100}, excluded_genres=["horror", "THRILLER"])
    results, total = recommend(MOVIES, r)
    assert results and total < len(MOVIES)
    assert all(not ({"Horror", "Thriller"} & set(x.movie.genres)) for x in results)


def test_excluding_a_genre_overrides_requesting_it():
    results, _ = recommend(MOVIES, req(genres=["Horror"], excluded_genres=["Horror"]))
    assert all("Horror" not in x.movie.genres for x in results)


def test_genre_preference_boosts_matching_films():
    base = recommend(MOVIES, req())[0]
    boosted = recommend(MOVIES, req(genres=["Animation"]))[0]
    rank = lambda recs, id_: ids(recs).index(id_)
    assert rank(boosted, "coco-2017") < rank(base, "coco-2017")
    assert boosted[0].matched_genres  # top result actually matches


def test_theme_match_is_reported_and_used():
    r = req(themes=["grief"])
    top = recommend(MOVIES, r)[0][0]
    assert top.matched_themes == ["grief"]
    assert top.theme_match == 100


def test_missing_metadata_is_skipped_not_zeroed():
    partial = film("p", {"tone": 50, "intensity": 50})  # only two of five ratings
    s = score_movie(partial, req())
    assert len(s.reasons) == 2
    assert round(s.raw) == 100  # perfect on the two it has
    empty = film("e", {})
    assert score_movie(empty, req()).raw == 0
    results, _ = recommend([partial, empty], req())  # must not crash
    assert ids(results) == ["p", "e"]
    assert "no mood ratings" in results[1].explanation


def test_explanations_use_the_same_numbers_as_the_score():
    r = req(prefs={"tone": 10, "intensity": 90, "realism": 20, "predictability": 80})
    for rec in recommend(MOVIES, r)[0]:
        m = rec.movie
        assert len(rec.reasons) == len([d for d in DIMENSIONS if d in m.mood])
        for reason in rec.reasons:
            assert reason.rating == m.mood[reason.dimension]
            assert reason.difference == abs(reason.preference - reason.rating)
            assert f"({round(reason.rating)})" in reason.summary
            assert reason.level == ("close" if reason.difference <= 15 else "partial" if reason.difference <= 35 else "far")
        assert f"Mood match {round(rec.attribute_match)}/100" in rec.explanation


def test_score_is_clamped_to_0_100():
    for rec in recommend(MOVIES, req(prefs={"tone": 100, "intensity": 0}, genres=["Drama"], themes=["family"]))[0]:
        assert 0 <= rec.score <= 100


def test_diversity_reduces_genre_repetition_in_top_results():
    r_plain = req(prefs={"tone": 0, "intensity": 100}, limit=8)
    r_div = req(prefs={"tone": 0, "intensity": 100}, limit=8, diversify=True)
    def distinct(recs):
        return len({g for x in recs for g in x.movie.genres})
    assert distinct(recommend(MOVIES, r_div)[0]) >= distinct(recommend(MOVIES, r_plain)[0])


def test_limit_is_respected():
    assert len(recommend(MOVIES, req(limit=5))[0]) == 5


# ---- wildcard ----

def wreq(seed=0, **kw):
    prefs = kw.pop("prefs", {})
    return WildcardRequest(preferences=MoodProfile(**prefs), seed=seed, **kw)


def test_wildcard_is_outside_usual_genres_but_inside_the_mood():
    res = wildcard(MOVIES, wreq(genres=["Drama"], prefs={"tone": 85, "intensity": 30}))
    assert res.pick is not None
    assert "Drama" not in res.pick.movie.genres
    assert res.pick.attribute_match >= 60
    assert "Wildcard" in res.pick.explanation


def test_wildcard_without_genres_avoids_the_recurring_genres_of_top_matches():
    from collections import Counter
    prefs = {"tone": 0, "intensity": 100}
    top5 = recommend(MOVIES, req(prefs=prefs, limit=5))[0]
    counts = Counter(g for x in top5 for g in x.movie.genres)
    recurring = {g for g, n in counts.items() if n >= 2}
    assert recurring  # the case is meaningful
    res = wildcard(MOVIES, wreq(prefs=prefs))
    assert res.pick is not None
    assert not (recurring & set(res.pick.movie.genres))
    assert set(res.usual_genres) == recurring
    assert res.pick.attribute_match >= 60


def test_wildcard_is_seeded_and_varies_across_seeds():
    picks = {wildcard(MOVIES, wreq(seed=s, genres=["Drama"], prefs={"tone": 85})).pick.movie.id for s in range(10)}
    again = wildcard(MOVIES, wreq(seed=3, genres=["Drama"], prefs={"tone": 85})).pick.movie.id
    assert again == wildcard(MOVIES, wreq(seed=3, genres=["Drama"], prefs={"tone": 85})).pick.movie.id
    assert len(picks) > 1


def test_wildcard_differs_from_top_recommendation():
    r = wreq(genres=["Drama"], prefs={"tone": 85, "intensity": 30})
    top = recommend(MOVIES, req(genres=["Drama"], prefs={"tone": 85, "intensity": 30}))[0][0]
    assert wildcard(MOVIES, r).pick.movie.id != top.movie.id


def test_wildcard_respects_exclusions_and_handles_no_candidates():
    res = wildcard(MOVIES, wreq(genres=["Drama"], excluded_genres=["Animation", "Fantasy", "Family"], prefs={"tone": 85}))
    if res.pick:
        assert not ({"Animation", "Fantasy", "Family"} & set(res.pick.movie.genres))
    only_drama = [film("d", dict.fromkeys(DIMENSIONS, 50), ("Drama",))]
    empty = wildcard(only_drama, wreq(genres=["Drama"]))
    assert empty.pick is None and empty.candidates_considered == 0
