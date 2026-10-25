import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_and_get_movies():
    r = client.get("/api/movies")
    assert r.status_code == 200 and r.json()["count"] == len(r.json()["movies"]) >= 30
    assert "not verified" in r.json()["label"]
    assert client.get("/api/movies/parasite-2019").json()["title"] == "Parasite"
    assert client.get("/api/movies/nope").status_code == 404


def test_recommendations_endpoint_ranks_by_preferences():
    r = client.post("/api/recommendations", json={"preferences": {"tone": 0, "intensity": 100}, "limit": 3})
    assert r.status_code == 200
    body = r.json()
    assert len(body["results"]) == 3
    scores = [x["score"] for x in body["results"]]
    assert scores == sorted(scores, reverse=True)
    assert "not a probability" in body["note"]


def test_recommendations_defaults_to_balanced_preferences():
    assert client.post("/api/recommendations", json={}).status_code == 200


@pytest.mark.parametrize("bad", [
    {"preferences": {"tone": 101}},
    {"preferences": {"tone": -1}},
    {"preferences": {"tone": "high"}},
    {"preferences": {"vibes": 5}},
    {"limit": 0},
    {"limit": 1000},
    {"genres": "Drama"},
    {"unknown_field": 1},
])
def test_invalid_input_is_rejected_with_422(bad):
    assert client.post("/api/recommendations", json=bad).status_code == 422


def test_wildcard_endpoint():
    r = client.post("/api/wildcard", json={"preferences": {"tone": 85}, "genres": ["Drama"], "seed": 2})
    assert r.status_code == 200
    body = r.json()
    assert body["pick"] and "Drama" not in body["pick"]["movie"]["genres"]
    assert client.post("/api/wildcard", json={"seed": -1}).status_code == 422


def test_cors_allows_local_frontend():
    r = client.options("/api/recommendations", headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST"})
    assert r.headers.get("access-control-allow-origin") == "http://localhost:3000"
