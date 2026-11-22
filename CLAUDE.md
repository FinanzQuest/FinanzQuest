# FinanzQuest

Web app that teaches students long-term investing: a neobroker-style UI where
they invest **virtual money** in stocks/ETFs, plus tutorials.

## Repo map (each area has its own CLAUDE.md, loaded only when you work there)
- `frontend/` — Next.js app (App Router, React, Shadcn, Tailwind, Recharts)
- `dbinit/` — Postgres schema, RLS, functions; source of truth for the DB.
  Applied in `manifest.txt` order; existing DBs upgraded via `dbinit/migrations/`
- `updater/` — Rust ingestion service that writes market data into `api.assets`
- `docs/` — design notes (e.g. `docs/intraday-pricing.md`)
- Infra (rarely relevant): `compose*.yml`, `Caddyfile*`, `nginx*`, `nixos/`, `flake.nix`

Backend: self-hosted Supabase-like stack (Postgres + PostgREST + GoTrue fork),
frontend talks to it with supabase-js. Data flow: `dbinit` schema →
generated types in `frontend/database/` → frontend.

## Cross-cutting rules
- Virtual money only. Flag anything drifting toward real payments/trading.
- `api.assets` (real EOD OHLCV data) is written only by `updater/`; it is
  read-only for the frontend and needs no frontend write policies.
- Rounding/formatting for display lives in `frontend/lib/util.ts`; don't add a
  second source of truth (DB or frontend).
- Ask before adding dependencies or Postgres extensions.
- Persistent decisions live in the memory MCP server: check it before major
  schema/architecture work, record decisions there afterwards.

## Working efficiently
- Agent roles and model routing: `.claude/agents/` (the main session runs as
  `coordinator`).
- Don't read lockfiles, build output, `dbinit/assets.csv` or binary assets.
  Search `frontend/database/types.ts` (70 KB, generated) with Grep instead of
  reading it whole.
- Prefer Grep/Glob plus targeted line ranges over reading whole files.
