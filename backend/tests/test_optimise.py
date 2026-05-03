"""POST /api/optimise-cart — mocked Gemini only."""

import json
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

import main


def test_optimise_cart_success(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(main, "GEMINI_API_KEY", "x")
    mock_model = MagicMock()
    mock_model.generate_content.return_value.text = json.dumps(
        {
            "suggestions": [
                {
                    "action": "remove",
                    "item": "Soda",
                    "reason": "Over budget and high sugar.",
                }
            ]
        }
    )
    monkeypatch.setattr(main, "model", mock_model)

    body = {
        "budget": 200,
        "diet_goal": "weight-loss",
        "cart": [
            {"barcode": "1", "name": "Soda", "price": 60, "quantity": 2},
            {"barcode": "2", "name": "Bread", "price": 45, "quantity": 1},
        ],
    }
    response = client.post("/api/optimise-cart", json=body)
    assert response.status_code == 200
    data = response.json()
    assert data["budget"] == 200
    assert data["cart_total"] == 165
    assert len(data["suggestions"]) == 1
    assert data["suggestions"][0]["action"] == "remove"


def test_optimise_cart_empty_suggestions(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(main, "GEMINI_API_KEY", "x")
    mock_model = MagicMock()
    mock_model.generate_content.return_value.text = json.dumps({"suggestions": []})
    monkeypatch.setattr(main, "model", mock_model)

    response = client.post(
        "/api/optimise-cart",
        json={"budget": 1000, "diet_goal": "balanced", "cart": []},
    )
    assert response.status_code == 200
    assert response.json()["suggestions"] == []
    assert response.json()["cart_total"] == 0


def test_optimise_malformed_ai_response_defaults_to_empty_list(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(main, "GEMINI_API_KEY", "x")
    mock_model = MagicMock()
    mock_model.generate_content.return_value.text = json.dumps({"suggestions": "not-a-list"})
    monkeypatch.setattr(main, "model", mock_model)

    response = client.post(
        "/api/optimise-cart",
        json={"budget": 100, "diet_goal": "balanced", "cart": []},
    )
    assert response.status_code == 200
    assert response.json()["suggestions"] == []


def test_optimise_requires_gemini(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(main, "GEMINI_API_KEY", None)
    monkeypatch.setattr(main, "model", None)

    response = client.post(
        "/api/optimise-cart",
        json={"budget": 100, "diet_goal": "balanced", "cart": []},
    )
    assert response.status_code == 500
    assert "GEMINI_API_KEY" in response.json()["detail"]
