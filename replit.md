# Hannah Brooks Creator Platform

A dual-system creator fan platform. The public-facing fan app lives at `/` and the private creator admin portal lives at `/admin`.

## Run & Operate

- `PORT=8081 BASE_PATH=/ pnpm --filter @workspace/hannah-brooks run dev` — run the fan frontend (port 8081)
- `PORT=8080 pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + shadcn/ui + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Payments: Flutterwave
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/hannah-brooks/src/pages/` — all frontend pages
- `artifacts/hannah-brooks/src/pages/admin.tsx` — private creator portal (password protected)
- `artifacts/api-server/src/routes/social.ts` — TikTok + X sync logic + GitHub push
- `lib/db/src/schema/` — database schema (posts, chat, calls, messages, requests, tips)
- `lib/api-spec/openapi.yaml` — source of truth for API contracts

## Architecture decisions

- The admin panel is part of the same frontend bundle at `/admin` — it's password-protected and not linked from public nav
- Social sync uses X API v2 (bearer token) for Twitter/X and RapidAPI TikTok Scraper for TikTok (no watermarks)
- Auto-sync runs an in-memory scheduler on the API server (set `enabled: true` via admin UI)
- Dark/Light mode uses CSS class toggling on `<html>` (`dark` / `light`) with localStorage persistence
- Watermarks are only applied to manually uploaded custom content, not to synced platform content

## Product

- **Public fan app**: Home, Feed, Messages (chat with Hannah), Calls (booking), Store (tips/requests), Members (VIP subscription)
- **Creator admin portal** (`/admin`): Dashboard, Messages (reply to fans), Calls, Requests, Tips, Feed Manager, Social Sync, GitHub push
- **Social Sync**: Manually or automatically import posts from X/Twitter and TikTok — no watermarks
- **VIP system**: Mix of free and locked content. Fans subscribe via Flutterwave (monthly/quarterly/lifetime)
- **Dark/Light mode**: Toggle in top nav, persisted in localStorage

## Secrets required

- `DATABASE_URL` — PostgreSQL connection string (set automatically by Replit DB)
- `ADMIN_PASSWORD` — Admin panel password (default: `hannah2024!`)
- `X_BEARER_TOKEN` — X/Twitter API v2 Bearer Token (get at developer.twitter.com)
- `RAPIDAPI_KEY` — RapidAPI key for TikTok scraper (subscribe to "TikTok Scraper" at rapidapi.com)
- `GITHUB_REMOTE` — Full GitHub remote URL with token: `https://TOKEN@github.com/user/repo.git`

## User preferences

- Platform name: Hannah Brooks
- Two separate experiences: public fan platform + private admin portal
- No watermarks on TikTok/X synced content
- Dark and light mode both supported
- Adult content is private/VIP-locked (OnlyFans-style)
- Auto-sync + manual sync for social content
- GitHub push from admin panel
