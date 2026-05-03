import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Load environment variables (check root first, then backend)
load_dotenv(BASE_DIR.parent / ".env")
load_dotenv(BASE_DIR / ".env")

class Config:
    # Supabase
    SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").strip()
    SUPABASE_SERVICE_KEY = (os.getenv("SUPABASE_SERVICE_KEY") or "").strip()
    
    # Frontend
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # AI Provider: gemini | groq
    AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower()
    
    # Gemini
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    
    # Groq
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

config = Config()
