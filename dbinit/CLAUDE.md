# Project: <name> — DB Initialization

## What this is
Database schema/initialization repo for a web app teaching students
long-term investing (neobroker-style interface, virtual money, stocks/ETFs).
Defines the Postgres schema, RLS policies, views, and functions consumed by
the frontend via PostgREST/supabase-js. This repo is the source of truth for
the database — the frontend's `database/` folder of generated types is
downstream of this, not the other way around.

**Current state: the reorganization into one object per file is done.**
The schema lives in the numbered folders (`01-schema` … `12-jobs`, `seed`),
applied in the order of `manifest.txt` (repository root) on an empty
database; existing databases are upgraded with `migrations/`. The old
monolith files (`init.sql`, `functions.sql`, `permissions.sql`, …) were
removed after checking that every object they created is either in the
manifest or was deliberately dropped.

## Target file structure
One database object per file, organized by kind (actual folders are
numbered, e.g. `03-tables/<schema>/<table>.sql`):

- `tables/<table_name>.sql` — one table definition per file (columns,
  constraints, indexes on that table)
- `policies/<table_name>.sql` — RLS policies for that table, one file per
  table (matches the table file name)
- `functions/<function_name>.sql` — one function per file
- `views/<view_name>.sql` — one view per file
- `seed/<table_name>.sql` — seed data, if any, one file per table

<adjust naming/folder scheme above to whatever you actually want — this is
a proposed default>

Migration order files still need to be composed/run in dependency order
(tables before policies that reference them, etc.) — <state how this is
handled: a numbered manifest file, migration tool ordering, naming
convention with numeric prefixes, etc.>

## Reorg rules
- When splitting a monolith file, move objects out **verbatim** first (no
  behavior changes bundled with the move) — refactor logic in a separate
  step so file-move diffs stay reviewable
- One PR/commit per logical chunk of the migration (e.g. "split
  policies out of schema.sql"), not one giant commit for the whole reorg
- After splitting, verify nothing was dropped — cross-check object counts
  before/after (e.g. `\dt`, `\df`, `\dv` in psql, or equivalent) before
  considering a split done
- Don't rename tables/functions/views *while* moving them into the new
  structure — separate the move from any renaming, so it's two reviewable
  changes instead of one

## Architecture
- Database: Postgres, exposed via PostgREST (self-hosted Supabase-like
  setup, with a GoTrue-fork auth layer)
- Migrations: <tool — e.g. plain SQL files, supabase CLI, sqitch, etc.>
- Schema organization: <e.g. one schema per domain (`api`, `auth`, etc.) — describe your actual layout>
- RLS: enabled per-table, policies live alongside table definitions (see Conventions)

Key folders (target — see "Target file structure" above for what's still mid-migration):
- `tables/` — one table per file
- `functions/` — one function per file
- `policies/` — one file per table's RLS policies
- `views/` — one view per file
- `seed/` — seed/fixture data, if any

## Commands
- Apply migrations locally: `<cmd>`
- Reset local DB: `<cmd>`
- Generate a new migration: `<cmd>`
- Spin up local Postgres instance: `<cmd / connection details>`
- Regenerate frontend types from this schema: `<cmd — note this is a
  downstream step consumed by the frontend repo>`

## Domain rules (money & market data)
- Virtual money only — no real money, payments, or real trading anywhere in
  this schema. Any table/column that could be mistaken for real
  payment/transaction infrastructure should be named unambiguously
  (e.g. `virtual_balance`, not `balance`) and flagged if it looks like it's
  drifting toward real payment logic.
- Money/price columns: <state the actual type — e.g. `numeric(12,2)`, never
  `float`/`double precision`, for anything representing currency>
- `api.assets` holds real end-of-day daily OHLCV market data, inserted by a
  separate, self-written ingestion service (not this repo, not the
  frontend) — this repo owns the table's schema/constraints, not its
  contents. Don't add write policies here assuming the frontend inserts
  into it.
- Rounding/precision at the DB layer should stay consistent with what
  `lib/util.ts` in the frontend expects for display — don't introduce a
  second source of truth for rounding rules.

## Conventions
- Naming: snake_case for tables, columns, functions, files
- RLS: every table with user-facing data must have RLS enabled; default-deny,
  explicit policies per operation (select/insert/update/delete) — never rely
  on "no policy = no access" without also explicitly running
  `ENABLE ROW LEVEL SECURITY` and verifying it
- Functions: <naming/security convention — e.g. `SECURITY DEFINER` usage rules, if any>
- Views: <naming convention, e.g. prefix with `v_`, if used>
- Migrations: <forward-only? reversible? one logical change per file?>
- Comments: <expectation for `COMMENT ON TABLE/COLUMN`, if any>

## Do NOT
- Write RLS policies that are permissive by default — always start from
  deny and add explicit allow policies per operation
- Add new extensions or dependencies without checking they're reasonable
  (maintained, actually needed) — if in doubt, ask before adding
- Modify or hand-edit already-applied migrations — add a new migration
  instead, even for typo fixes
- Grant broader Postgres roles/privileges than a feature actually needs
- Expose internal/admin-only tables or columns through a view or RLS policy
  without a deliberate decision to do so
- Assume the frontend repo's conventions apply here without checking — this
  repo has its own rules above
- Bundle a file-structure move together with a behavior change, rename, or
  logic edit in the same commit — see "Reorg rules"
- Do a full repo-wide reorg unprompted — migrate incrementally unless
  explicitly asked to do it all at once

## Useful context
- **This repo is mid-reorganization** — see "What this is" and "Reorg
  rules" above. If you see one giant file doing five things, that's the
  known current state, not a design choice to preserve.
- Frontend repo consuming this schema: <link/path, if useful to reference>
- <link to design doc / ERD / ADRs, if any>
- <known schema debt or areas mid-refactor, beyond the file-structure reorg>

## Memory
Persistent decisions and rationale are tracked in the memory MCP server
(`.claude/memory.json`). Before starting significant schema or policy work,
check memory for prior decisions in this area — especially RLS policy
rationale and any schema change with downstream frontend impact. After
making a decision, record it there rather than only in chat.
