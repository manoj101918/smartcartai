# SmartCart AI

Mobile-first AI grocery assistant: scan barcodes, get Gemini-powered insights (health, swaps, combos, deals), then checkout with a QR code — no queue.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, lucide-react
- **Backend:** Python FastAPI on Render (`backend/main.py`)
- **Database:** Supabase (Postgres + Realtime)
- **AI:** Google Gemini `gemini-1.5-flash` (JSON mode) — **API key only on the server**

## Setup (10 steps)

1. **Clone** this repository and open the `smartcart-ai` folder.
2. **Install frontend deps:** `npm install`
3. **Supabase:** In the SQL Editor, run `data/seed.sql` (creates tables, seeds 25 products, enables Realtime).
4. **Frontend env:** Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_API_BASE` (local or deployed API URL).
5. **Backend deps ([uv](https://docs.astral.sh/uv/)):** Install uv, then from `backend` run `uv sync --extra dev` (runtime-only: `uv sync`). Uses `uv.lock` + `.python-version` (Python 3.13).
6. **Backend env:** Copy `backend/.env.example` to `backend/.env` and add `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_KEY` (service role — server only).
7. **Run FastAPI locally:** from `backend`, run `uv run uvicorn main:app --reload` (default `http://127.0.0.1:8000`).
8. **Point the app at your API:** Set `NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000` in `.env.local` while developing.
9. **Run Next.js:** from the project root, `npm run dev` and open `http://localhost:3000`.
10. **Deploy:** Push to GitHub → deploy the app folder to **Vercel** (frontend) and `backend` to **Render** using `backend/render.yaml` (Render **Root Directory** = `backend`); set the same env vars in each dashboard and update `NEXT_PUBLIC_API_BASE` to your Render URL.

## Security

- Never commit real `GEMINI_API_KEY` or Supabase **service** keys.
- If a key was shared in chat or committed, **rotate it** in Google AI Studio and Supabase immediately.

## Demo barcodes

| Barcode       | Product              |
| ------------- | -------------------- |
| 1000000000001 | Lays Classic Chips   |
| 1000000000002 | Coca Cola 750ml      |
| 1000000000003 | Britannia Bread      |
| 1000000000004 | Amul Full Cream Milk |
| 1000000000005 | Yoga Bar Protein Oats |

## Backend tests

From the `backend` folder (uses mocks; no real Gemini or Supabase calls):

```bash
cd backend
uv sync --extra dev
uv run pytest tests/ -v
```

## Scripts

- `npm run dev` — Next.js development server
- `npm run build` — Production build
- `npm run start` — Production server
- `npm run lint` — ESLint

update

## Payments

Checkout uses a **mock** sandbox flow (`USE_REAL_PAYMENT = false` in `src/app/checkout/page.tsx`). Replace with Razorpay when you are ready for real charges.
