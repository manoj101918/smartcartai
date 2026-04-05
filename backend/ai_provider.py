import json
import re
from typing import Any, Protocol, List
from google import genai
from google.genai import types  # Added for JSON configuration
import os
from groq import Groq
from config import config

class AIProvider(Protocol):
    def generate_content(self, prompt: str, is_json: bool = True) -> dict[str, Any]:
        ...

def _parse_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^
http://googleusercontent.com/immersive_entry_chip/0

### What changed?
1. Added `from google.genai import types` at the top.
2. Swapped `genai.configure` and `genai.GenerativeModel` for `self.client = genai.Client(api_key=api_key)`.
3. Updated the `.generate_content()` call to use `self.client.models.generate_content()`, applying the strict JSON mode through the `config` parameter.

Just save this, commit it, and push it to GitHub. Render will auto-deploy the fix, and that deprecation warning will vanish for good!
