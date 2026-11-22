# dbinit (Postgres schema)

Source of truth for the database; `frontend/database/` types are downstream.

## Layout
One object per file, in numbered folders applied in `manifest.txt` order
(repo root): `00-preauth` (pre-GoTrue, run by `init.sh` only), `01-schema`,
`02-types`, `03-tables/<schema>/`, `04-functions/<schema>/`,
`05-materialized-views`, `06-views`, `07-triggers`, `08-roles`, `09-policies`,
`10-grants`, `11-config`, `12-jobs`, `seed/`.
Schemas: `api`, `depots`, `users` (+ `auth` from GoTrue).

- New object → new file in the right folder **and** add it to `manifest.txt`
  in dependency order (the order comes only from the manifest).
- Existing DBs never re-run the manifest. Every schema change also needs a
  migration file in `migrations/` (rules load from `.claude/rules/db-migrations.md`).
- RLS/roles/grants rules load from `.claude/rules/db-security.md`.

## Commands
- Fresh init: `docker compose up` runs `init.sh` (phase 1), then
  `apply_manifest.sh` (phase 2; `FORCE_MANIFEST=1` to re-apply)
- Smoke test after init: `psql -f dbinit/verify_schema.sql`
- Feature tests: `psql -f dbinit/tests/<area>.sql` (`security.sql` for RLS)
- Regenerate frontend types afterwards: `cd frontend && nu gen_types.nu`

## Conventions
- snake_case everywhere (tables, columns, functions, files)
- Money/price columns use `numeric`, never float types
- Name anything money-like unambiguously as virtual (e.g. `virtual_balance`)
- Keep file moves, renames and logic changes in separate commits
