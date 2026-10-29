# Bolo – voice & text translator

Static frontend (`public/`) + one serverless function (`api/translate.js`) calling Gemini.

## Run locally
1. Install Node 18+.
2. Copy `.env.example` to `.env` and paste your key (https://aistudio.google.com/apikey).
3. `npm run dev` then open http://localhost:3000 (NOT index.html directly, NOT Live Server).

## Deploy (Vercel)
Push to GitHub, import in Vercel (Framework: Other), add env var `GEMINI_API_KEY`, deploy.
