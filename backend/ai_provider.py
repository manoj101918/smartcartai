import json
import re
import os
from typing import Any, Protocol, Optional
import google.generativeai as genai
from groq import Groq
from config import config

class AIProvider(Protocol):
    def generate_content(self, prompt: str, is_json: bool = True) -> dict[str, Any]:
        ...

def _parse_json(text: str) -> dict[str, Any]:
    text = text.strip()
    # Remove markdown code blocks if present
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n", "", text)
        text = re.sub(r"\n```$", "", text)
    
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fallback: try to find the first { and last }
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        raise ValueError(f"Failed to parse AI response as JSON: {text[:100]}...")

class GeminiProvider:
    def __init__(self, api_key: str, model_name: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)

    def generate_content(self, prompt: str, is_json: bool = True) -> dict[str, Any]:
        generation_config = {}
        if is_json:
            generation_config["response_mime_type"] = "application/json"
        
        response = self.model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        if is_json:
            return _parse_json(response.text)
        return {"text": response.text}

class GroqProvider:
    def __init__(self, api_key: str, model_name: str):
        self.client = Groq(api_key=api_key)
        self.model_name = model_name

    def generate_content(self, prompt: str, is_json: bool = True) -> dict[str, Any]:
        response_format = {"type": "json_object"} if is_json else None
        
        completion = self.client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}],
            response_format=response_format
        )
        
        content = completion.choices[0].message.content
        if is_json:
            return _parse_json(content)
        return {"text": content}

def get_provider() -> AIProvider:
    if config.AI_PROVIDER == "groq":
        if not config.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not set")
        return GroqProvider(config.GROQ_API_KEY, config.GROQ_MODEL)
    else:
        if not config.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set")
        return GeminiProvider(config.GEMINI_API_KEY, config.GEMINI_MODEL)
