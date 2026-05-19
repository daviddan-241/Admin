# Hannah Brooks Creator Platform

Three connected web experiences: public fan app, private creator admin portal, and AI Persona Studio.

## GitHub Repo

**https://github.com/daviddan-241/Hannah-brooks-love**

Push from the Admin portal → GitHub tab, or trigger `POST /api/social/github/push` directly.
The `GITHUB_PERSONAL_ACCESS_TOKEN` secret is used automatically — no extra config needed.

## Quick Start (after cloning)

```bash
bash scripts/setup.sh   # installs deps + pushes DB schema (run once)
```

On Replit: click **Run** — all three apps start automatically in parallel.

## Run & Operate

- `PORT=8080 pnpm --filter @workspace/api-server run dev` — API server (port 8080)
- `PORT=5000 BASE_PATH=/ pnpm --filter @workspace/hannah-brooks run dev` — Fan app (port 5000)
- `PORT=8082 pnpm --filter @workspace/ai-persona run dev` — AI Persona Studio (port 8082)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 20+, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + shadcn/ui + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Payments: Flutterwave
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/hannah-brooks/src/pages/` — all fan frontend pages
- `artifacts/hannah-brooks/src/pages/admin.tsx` — private creator portal (password protected)
- `artifacts/ai-persona/src/pages/` — AI Persona Studio pages
- `artifacts/ai-persona/src/lib/api.ts` — AI Persona → API client (admin endpoints)
- `artifacts/api-server/src/routes/chat.ts` — chat sessions, messages, AI suggest endpoint
- `artifacts/api-server/src/routes/social.ts` — TikTok + X sync + GitHub push
- `lib/db/src/schema/` — database schema (posts, chat, calls, messages, requests, tips)
- `scripts/setup.sh` — first-run setup script
- `scripts/post-merge.sh` — runs automatically after merges

## Three Experiences

### 1. Fan App (port 5000)
Public-facing platform at `/`. Home, Feed, Messages (chat with Hannah), Calls (book a session), Boutique (tips/requests), Members (VIP subscription).

### 2. Admin Portal (`/admin` on port 5000)
Private creator control center — password protected.
- **Dashboard** — live stats, real-time activity feed
- **Messages** — all fan chat sessions, send text/voice/file replies
- **Calls** — manage bookings, approve/decline
- **Requests** — custom content requests
- **Tips** — tip history
- **Feed** — publish/delete posts (VIP or public)
- **Social Sync** — import from X/Twitter, TikTok, Instagram (no watermarks)
- **GitHub** — push all code to `github.com/daviddan-241/Hannah-brooks-love`
- **Settings** — all platform config (prices, bio, social handles, API keys)

### 3. AI Persona Studio (port 8082)
AI digital avatar control platform.
- **Dashboard** — live platform stats from real DB
- **Chat Control** — all real fan sessions, AI-suggested replies per fan message, send/approve from here
- **Persona Manager** — configure multiple AI personas (personality prompts, reply modes)
- **Training** — upload videos/audio to train face/voice models (GPU-accelerated, requires GPU deployment)
- **Social Feed** — real synced posts, manual sync buttons per platform
- **Analytics** — live charts of messages, calls, revenue
- **Settings** — platform config + social sync config + API key status

## Architecture decisions

- Admin panel is at `/admin` in the same frontend bundle — password-protected, not linked from public nav
- AI Persona Studio runs on port 8082 with its own Vite dev server, proxies `/api` to port 8080
- AI suggest endpoint (`POST /api/chat/admin/:id/ai-suggest`) is context-aware — reads fan message history
- Social sync uses X API v2 (bearer token) for Twitter/X and RapidAPI TikTok Scraper for TikTok (no watermarks)
- Auto-sync runs an in-memory scheduler on the API server
- Dark/Light mode uses CSS class toggling on `<html>` with localStorage persistence
- GitHub push auto-constructs remote URL from `GITHUB_PERSONAL_ACCESS_TOKEN` + hardcoded repo

## Secrets required

- `DATABASE_URL` — PostgreSQL connection string (set automatically by Replit DB)
- `ADMIN_PASSWORD` — Admin panel password (default: `hannah2024!`)
- `GITHUB_PERSONAL_ACCESS_TOKEN` — GitHub token with `repo` scope (push to daviddan-241/Hannah-brooks-love)
- `X_BEARER_TOKEN` — X/Twitter API v2 Bearer Token (developer.twitter.com)
- `RAPIDAPI_KEY` — RapidAPI key for TikTok scraper (rapidapi.com → "TikTok Scraper")
- `FLUTTERWAVE_SECRET_KEY` — Flutterwave secret key for payment verification

## AI Persona Studio — GPU Features

The face transformation, voice conversion, and real-time avatar features described in the product spec require GPU hardware:
- **Face swap**: LivePortrait + InsightFace + ONNX Runtime (requires NVIDIA GPU)
- **Voice conversion**: XTTS v2 / RVC v2 (requires GPU for real-time, CPU for batch)
- **LLM replies**: OpenAI-compatible API (configure API key in Settings → LLM Model)

For GPU deployment, use RunPod, Vast.ai, or a cloud VM with NVIDIA GPU. The UI is fully ready — wire the GPU worker URLs into the Settings page.

## User preferences

- Platform name: Hannah Brooks
- Three separate experiences: public fan platform + private admin portal + AI Persona Studio
- No watermarks on TikTok/X synced content
- Dark and light mode both supported
- Adult content is private/VIP-locked (OnlyFans-style)
- Auto-sync + manual sync for social content
- GitHub push from admin panel to daviddan-241/Hannah-brooks-love
