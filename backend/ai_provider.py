import json
import re
from typing import Any, Protocol, List
import google.generativeai as genai
from groq import Groq
from config import config

class AIProvider(Protocol):
    def generate_content(self, prompt: str, is_json: bool = True) -> dict[str, Any]:
        ...

def _parse_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fallback for LLMs that might return slightly broken JSON
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except:
                pass
        return {}

class GeminiProvider:
    def __init__(self, api_key: str, model_name: str):
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name,
            generation_config={"response_mime_type": "application/json"}
        )

    def generate_content(self, prompt: str, is_json: bool = True) -> dict[str, Any]:
        response = self.model.generate_content(prompt)
        raw = response.text or "{}"
        return _parse_json(raw) if is_json else {"text": raw}

class GroqProvider:
    def __init__(self, api_key: str, model_name: str):
        if not api_key:
            raise ValueError("GROQ_API_KEY is not configured")
        self.client = Groq(api_key=api_key)
        self.model_name = model_name

    def generate_content(self, prompt: str, is_json: bool = True) -> dict[str, Any]:
        response = self.client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=self.model_name,
            response_format={"type": "json_object"} if is_json else None
        )
        raw = response.choices[0].message.content or "{}"
        return _parse_json(raw) if is_json else {"text": raw}

def get_provider() -> AIProvider:
    if config.AI_PROVIDER == "groq":
        return GroqProvider(config.GROQ_API_KEY, config.GROQ_MODEL)
    else:
        # Default to Gemini
        return GeminiProvider(config.GEMINI_API_KEY, config.GEMINI_MODEL)
