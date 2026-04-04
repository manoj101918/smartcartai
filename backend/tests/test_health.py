"""Health endpoint — no external services required."""

from fastapi.testclient import TestClient


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model"] == "gemini-1.5-flash"


def test_health_is_get_only(client: TestClient) -> None:
    assert client.post("/api/health").status_code == 405
