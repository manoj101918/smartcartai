#!/bin/bash
# run_dev.sh
# This script starts both the backend (FastAPI) and the frontend (Next.js) simultaneously.

echo "🚀 Starting Backend (FastAPI) on port 8010..."
cd backend
if [ -d ".venv" ]; then
    source .venv/Scripts/activate
elif [ -d "venv" ]; then
    source venv/Scripts/activate
fi
uvicorn main:app --reload --port 8010 &
cd ..

sleep 2

echo "✨ Starting Frontend (Next.js)..."
npm run dev
