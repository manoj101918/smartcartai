# run_dev.ps1
# This script starts both the backend (FastAPI) and the frontend (Next.js) simultaneously.

# Ensure we are in the root directory

# 1. Start the Backend (FastAPI)
Write-Host "🚀 Starting Backend (FastAPI) on port 8010..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; if (Test-Path .venv) { .\.venv\Scripts\activate }; if (Test-Path venv) { .\venv\Scripts\activate }; uvicorn main:app --reload --port 8010"

# 2. Wait a moment for the backend to initialize
Start-Sleep -Seconds 2

# 3. Start the Frontend (Next.js)
Write-Host "✨ Starting Frontend (Next.js)..." -ForegroundColor Green
npm run dev
