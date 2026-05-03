"""POST /api/scan — mocked Supabase + Gemini."""

import json
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

import main
from tests.conftest import make_mock_supabase, sample_gemini_scan_json, sample_product


def test_scan_success(client: TestClient, scan_mocks: dict) -> None:
    body = {
        "cart_item_id": "11111111-1111-1111-1111-111111111111",
        "barcode": "1000000000001",
        "session_id": "sess-test",
        "budget": 500,
        "diet_goal": "weight-loss",
        "cart_total": 150,
    }
    response = client.post("/api/scan", json=body)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["cart_item_id"] == body["cart_item_id"]
    assert data["warning"] is not None
    assert data["swap"] is not None
    assert data["swap"]["name"] == "Store Brand Chips"
    assert data["product"]["name"] == "Test Chips"
    assert data["product"]["barcode"] == "1000000000001"
    scan_mocks["model"].generate_content.assert_called_once()


def test_scan_requires_gemini(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(main, "GEMINI_API_KEY", None)
    monkeypatch.setattr(main, "model", None)
    body = {
        "cart_item_id": "11111111-1111-1111-1111-111111111111",
        "barcode": "1000000000001",
        "session_id": "sess",
        "budget": 500,
        "diet_goal": "balanced",
        "cart_total": 0,
    }
    response = client.post("/api/scan", json=body)
    assert response.status_code == 500
    assert "GEMINI_API_KEY" in response.json()["detail"]


def test_scan_product_not_found(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(main, "GEMINI_API_KEY", "x")
    monkeypatch.setattr(main, "model", MagicMock())

    def _not_found(_barcode: str) -> None:
        raise HTTPException(status_code=404, detail="Product not found")

    monkeypatch.setattr(main, "fetch_product", _not_found)

    body = {
        "cart_item_id": "11111111-1111-1111-1111-111111111111",
        "barcode": "9999999999999",
        "session_id": "sess",
        "budget": 500,
        "diet_goal": "balanced",
        "cart_total": 0,
    }
    response = client.post("/api/scan", json=body)
    assert response.status_code == 404


def test_scan_invalid_body(client: TestClient) -> None:
    response = client.post("/api/scan", json={"barcode": "123"})
    assert response.status_code == 422


def test_scan_gemini_invalid_json(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(main, "GEMINI_API_KEY", "x")
    mock_model = MagicMock()
    mock_model.generate_content.return_value.text = "not json {{{"
    monkeypatch.setattr(main, "model", mock_model)
    monkeypatch.setattr("main.fetch_product", lambda b: sample_product(b))
    monkeypatch.setattr(main, "get_supabase", lambda: make_mock_supabase())

    body = {
        "cart_item_id": "11111111-1111-1111-1111-111111111111",
        "barcode": "1000000000001",
        "session_id": "sess",
        "budget": 500,
        "diet_goal": "balanced",
        "cart_total": 0,
    }
    response = client.post("/api/scan", json=body)
    assert response.status_code == 502
    assert "AI error" in response.json()["detail"]


def test_scan_swap_non_dict_treated_as_null(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(main, "GEMINI_API_KEY", "x")
    payload = json.loads(sample_gemini_scan_json())
    payload["swap"] = "invalid-not-an-object"
    mock_model = MagicMock()
    mock_model.generate_content.return_value.text = json.dumps(payload)
    monkeypatch.setattr(main, "model", mock_model)
    monkeypatch.setattr("main.fetch_product", lambda b: sample_product(b))
    monkeypatch.setattr(main, "get_supabase", lambda: make_mock_supabase())

    body = {
        "cart_item_id": "11111111-1111-1111-1111-111111111111",
        "barcode": "1000000000001",
        "session_id": "sess",
        "budget": 500,
        "diet_goal": "balanced",
        "cart_total": 0,
    }
    response = client.post("/api/scan", json=body)
    assert response.status_code == 200
    assert response.json()["swap"] is None
