"""Shared fixtures for API tests."""

import json
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture
def client() -> TestClient:
    return TestClient(main.app)


def sample_product(barcode: str = "1000000000001") -> dict:
    return {
        "barcode": barcode,
        "name": "Test Chips",
        "brand": "TestBrand",
        "price": 100,
        "price_benchmark": 72,
        "category": "Snacks",
        "aisle": 3,
        "calories": 536,
        "protein_g": 7,
        "fat_g": 34,
        "sugar_g": 2,
        "tags": ["junk", "high-salt"],
        "combo_pairs": ["Test Cola"],
    }


def sample_gemini_scan_json() -> str:
    return json.dumps(
        {
            "warning": "High salt for your weight-loss goal.",
            "swap": {
                "name": "Store Brand Chips",
                "price": 70,
                "reason": "Lower sodium",
                "aisle": 3,
            },
            "combo_offer": "Add cola for 10% off both.",
            "deal_alert": None,
            "reminder": None,
        }
    )


def make_mock_supabase(insert_data: list | None = None):
    if insert_data is None:
        insert_data = [{"id": "550e8400-e29b-41d4-a716-446655440000"}]
    mock_exec = MagicMock()
    mock_exec.data = insert_data
    mock_insert = MagicMock()
    mock_insert.execute.return_value = mock_exec
    mock_table = MagicMock()
    mock_table.insert.return_value = mock_insert
    mock_sb = MagicMock()
    mock_sb.table.return_value = mock_table
    return mock_sb


@pytest.fixture
def scan_mocks(monkeypatch):
    """Patches Gemini model, fetch_product, and Supabase for a successful /api/scan."""
    monkeypatch.setattr(main, "GEMINI_API_KEY", "test-gemini-key")
    mock_model = MagicMock()
    mock_model.generate_content.return_value.text = sample_gemini_scan_json()
    monkeypatch.setattr(main, "model", mock_model)
    monkeypatch.setattr(
        main,
        "fetch_product",
        lambda barcode: sample_product(barcode),
    )
    mock_sb = make_mock_supabase()
    monkeypatch.setattr(main, "get_supabase", lambda: mock_sb)
    return {"model": mock_model, "supabase": mock_sb}
