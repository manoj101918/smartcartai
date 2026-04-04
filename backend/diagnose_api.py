import os
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path

# Load env
base_dir = Path(__file__).resolve().parent
load_dotenv(base_dir / ".env")

def test_gemini():
    print("\n--- Testing Gemini ---")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY not found in .env")
        return
    
    try:
        genai.configure(api_key=api_key)
        print("Available Gemini Models:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as e:
        print(f"Gemini Error: {e}")

def test_groq():
    print("\n--- Testing Groq ---")
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("GROQ_API_KEY not found in .env")
        return
    
    try:
        client = Groq(api_key=api_key)
        print("Available Groq Models:")
        # Groq doesn't have a simple list_models() in the basic client, 
        # but we can try a simple request or check docs.
        # Actually, let's try to list via API if possible.
        models = client.models.list()
        for m in models.data:
            print(f" - {m.id}")
    except Exception as e:
        print(f"Groq Error: {e}")

if __name__ == "__main__":
    test_gemini()
    test_groq()
