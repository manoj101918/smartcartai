import json
import os
import re
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import Client, create_client

from config import config
from ai_provider import get_provider, AIProvider

app = FastAPI(title="SmartCart AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_supabase: Optional[Client] = None
_ai_provider: Optional[AIProvider] = None

def get_supabase() -> Client:
    global _supabase
    if not config.SUPABASE_URL or not config.SUPABASE_SERVICE_KEY:
        raise HTTPException(
            status_code=500,
            detail="Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.",
        )
    if _supabase is None:
        _supabase = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY)
    return _supabase

def get_ai() -> AIProvider:
    global _ai_provider
    if _ai_provider is None:
        try:
            _ai_provider = get_provider()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Provider error: {e!s}")
    return _ai_provider

class ScanBody(BaseModel):
    cart_item_id: str
    barcode: str
    session_id: str
    budget: float
    diet_goal: str
    cart_total: float

class CartLine(BaseModel):
    barcode: str
    name: str
    price: float
    quantity: int = 1

class OptimiseBody(BaseModel):
    budget: float
    diet_goal: str
    cart: list[CartLine] = Field(default_factory=list)

@app.get("/api/health")
def health() -> dict[str, str]:
    return {
        "status": "ok", 
        "provider": config.AI_PROVIDER,
        "model": config.GROQ_MODEL if config.AI_PROVIDER == "groq" else config.GEMINI_MODEL
    }

def fetch_product(barcode: str) -> dict[str, Any]:
    sb = get_supabase()
    res = sb.table("products").select("*").eq("barcode", barcode).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return res.data[0]

def build_scan_prompt(product: dict[str, Any], body: ScanBody) -> str:
    tags = product.get("tags") or []
    combo_pairs = product.get("combo_pairs") or []
    tags_s = ", ".join(tags) if isinstance(tags, list) else str(tags)
    pairs_s = ", ".join(combo_pairs) if isinstance(combo_pairs, list) else str(combo_pairs)
    return f"""You are SmartCart AI — a real-time grocery shopping assistant in India.
A customer just scanned a product. Analyse it and respond with ONLY a JSON object with exactly these 5 keys:

{{
  "warning": "string or null — flag if tags include high-sugar or junk AND diet_goal is weight-loss. Include specific nutrient. Example: High Sugar: 28g — exceeds your weight-loss goal. Max 20 words.",
  "swap": {{"name": "string", "price": number, "reason": "string", "aisle": number}} or null — suggest only if saves >=15% or clearly healthier. Use real Indian grocery brands.,
  "combo_offer": "string or null — natural pairs only (bread+peanut butter, tea+milk, pasta+sauce). Format: Add [item] for 10% off both. Max 15 words.",
  "deal_alert": "string or null — if price > price_benchmark by 15%+: Paying X% more than store brand. Save ₹Y with [brand name].",
  "reminder": "string or null — if combo_pairs has items not in cart. Format: Don't forget [item] — pairs well with [current item]."
}}

Product: {product.get("name")} | Price: ₹{product.get("price")} | Benchmark: ₹{product.get("price_benchmark")}
Nutrition: {product.get("calories")}cal, protein {product.get("protein_g")}g, sugar {product.get("sugar_g")}g
Tags: {tags_s} | Aisle: {product.get("aisle")} | Combo pairs: {pairs_s}
Budget: ₹{body.budget} | Spent so far: ₹{body.cart_total} | Diet goal: {body.diet_goal}

At least one field must be non-null. Be concise. Max 20 words per field."""

@app.post("/api/scan")
async def scan(body: ScanBody) -> dict[str, Any]:
    provider = get_ai()
    try:
        product = fetch_product(body.barcode)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Database error: {e!s}") from e

    prompt = build_scan_prompt(product, body)

    try:
        parsed = provider.generate_content(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI error ({config.AI_PROVIDER}): {e!s}") from e

    warning = parsed.get("warning")
    swap = parsed.get("swap") if isinstance(parsed.get("swap"), dict) else None
    combo_offer = parsed.get("combo_offer")
    deal_alert = parsed.get("deal_alert")
    reminder = parsed.get("reminder")

    swap_name = swap.get("name") if swap else None
    swap_price = swap.get("price") if swap else None
    swap_reason = swap.get("reason") if swap else None
    swap_aisle = swap.get("aisle") if swap else None

    if swap_aisle is not None:
        try:
            swap_aisle = int(swap_aisle)
        except (TypeError, ValueError):
            swap_aisle = None

    row: dict[str, Any] = {
        "cart_item_id": body.cart_item_id,
        "warning": warning,
        "swap_name": swap_name,
        "swap_price": swap_price,
        "swap_reason": swap_reason,
        "swap_aisle": swap_aisle,
        "combo_offer": combo_offer,
        "deal_alert": deal_alert,
        "reminder": reminder,
    }

    try:
        sb = get_supabase()
        ins = sb.table("ai_suggestions").insert(row).execute()
        suggestion_id = None
        if ins.data and len(ins.data) > 0:
            suggestion_id = ins.data[0].get("id")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to save suggestion: {e!s}") from e

    return {
        "id": suggestion_id,
        "cart_item_id": body.cart_item_id,
        "warning": warning,
        "swap": swap,
        "combo_offer": combo_offer,
        "deal_alert": deal_alert,
        "reminder": reminder,
        "product": {
            "barcode": product.get("barcode"),
            "name": product.get("name"),
            "brand": product.get("brand"),
            "price": float(product.get("price") or 0),
            "category": product.get("category"),
            "aisle": product.get("aisle"),
        },
    }

@app.post("/api/optimise-cart")
async def optimise_cart(body: OptimiseBody) -> dict[str, Any]:
    provider = get_ai()
    lines = [
        f"{c.name} (₹{c.price} x {c.quantity}) [{c.barcode}]" for c in body.cart
    ]
    cart_desc = "\n".join(lines) if lines else "(empty cart)"
    total = sum(c.price * c.quantity for c in body.cart)

    prompt = f"""You are SmartCart AI. The customer must fit their cart under budget ₹{body.budget}.
Current total: ₹{total}. Diet goal: {body.diet_goal}.

Cart:
{cart_desc}

Respond with ONLY valid JSON: {{"suggestions": [{{"action": "remove"|"swap", "item": "exact product name from cart", "reason": "max 25 words"}}]}}
Provide 0–5 suggestions. If already under budget and appropriate for diet, return {{"suggestions": []}}."""

    try:
        parsed = provider.generate_content(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI error ({config.AI_PROVIDER}): {e!s}") from e

    suggestions = parsed.get("suggestions")
    if not isinstance(suggestions, list):
        suggestions = []

    return {"suggestions": suggestions, "cart_total": total, "budget": body.budget}

