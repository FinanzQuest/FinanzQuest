# Project: <name>

## What this is
Frontend for a web app teaching students long-term investing. Provides a
neobroker-like interface for students to invest virtual money into stocks
and ETFs. Also contains tutorials/educational content.

## Architecture
- Frontend: Next.js (App Router), React, Shadcn, Tailwind, Recharts
- Backend: self-hosted Supabase-like setup (Postgres, PostgREST, GoTrue fork),
  accessed via supabase-js REST client
- Database: Postgres via PostgREST
- Auth: Supabase Auth (GoTrue fork)
- Deployment: <where/how>

Key folders:
- `app/` — App Router pages, route-specific and single-use components
- `components/` — reused components
- `database/` — auto-generated DB types (see "Do NOT")
- `lib/` — utilities and non-component code

## Commands
- Dev server: `yarn dev`
- Run tests: none yet — will be added later, skip for now
- Lint/format: `biome check`. Run `biome` directly — it is Nix-provided on
  PATH. Do NOT use `npx biome`; `npx` fetches an unrelated ancient version
  (0.3.x) from npm instead of the project's.
- Type check: `node_modules/.bin/tsc --noEmit`. `biome` is a linter, not a
  type checker. Note: the repo currently has pre-existing tsc errors (base-ui
  `asChild` typing, `components/charts/tree.tsx`, `displays/tab_view.tsx`,
  etc.) — don't assume they were introduced by a change.
- Build: `yarn build`
- Regenerate DB types: <exact command, e.g. `supabase gen types typescript ...`>

## Domain rules (money & market data)
- Virtual money only — no real money, payments, or real trading is ever
  involved anywhere in this app. Flag anything that looks like it's building
  toward real payment/transaction logic.
- Price/market data: real end-of-day daily OHLCV data, inserted into
  `api.assets` by a separate, self-written ingestion service (not part of
  this frontend repo) — treat this table as read-only from the frontend
- Rounding/formatting: always use the defined formatters in `lib/util.ts`
  for displaying money and prices — never inline custom rounding/toFixed
  logic

## Styling & UI
- Always reach for a Shadcn component first before writing custom markup —
  check `components/ui/` before building a new primitive (button, dialog,
  input, card, table, etc.)
- Never hardcode colors (hex/rgb) in components or Tailwind arbitrary values
  — use the semantic tokens defined in `globals.css` / `tailwind.config`
  (e.g. `bg-background`, `text-muted-foreground`, `border-border`,
  `bg-primary`) so theming/dark mode stays consistent
- If a needed color/variant doesn't exist yet, add it as a token in
  `globals.css` first, don't inline a one-off value in a component
- Prefer composing Shadcn primitives (e.g. `Card` + `CardHeader` +
  `CardContent`) over recreating their layout with raw divs
- Match existing Shadcn variant/size props (`variant="outline"`,
  `size="sm"`, etc.) rather than overriding with custom classes when a
  built-in variant already covers the case
- Only drop to custom Tailwind styling for layout/spacing that Shadcn
  doesn't own — component-level look and feel should stay native to the
  Shadcn theme

## Conventions
- Naming: camelCase for functions, PascalCase for components/types,
  snake_case for variables, snake_case for filenames
- Error handling: Result-style objects, e.g. `{ res, error, failed? }`;
  prefer early returns over nested conditionals
- State management: cookies for cross-page state, `useState` for single-page/local state
- Testing: no automated tests currently — to be added later
- Commits: <format expected, if any>

## Do NOT
- Hand-edit generated files in `database/` or `utils/` — regenerate instead
  (see Commands)
- Add new dependencies without checking they're reasonable (maintained,
  reasonably sized, not redundant with something already in use) — if in
  doubt, ask before adding
- Bypass `<validation layer / auth check / etc, if applicable>`

## Useful context
- File hierarchy is not 100% settled yet; some code is overly abstracted —
  don't assume existing patterns are the "correct" template to copy
- <link to design doc / ADRs folder, if any>
- <other known tech debt worth flagging>

## Memory
Persistent decisions and rationale are tracked in the memory MCP server
(`.claude/memory.json`). Before starting significant work, check memory for
prior decisions on this area. After making an architectural decision, record
it there rather than only in chat.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
