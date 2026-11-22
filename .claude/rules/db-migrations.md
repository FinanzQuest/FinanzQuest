---
paths:
  - "dbinit/migrations/**"
  - "manifest.txt"
---

# DB migrations

- Existing databases are upgraded only via `dbinit/migrations/`. A schema
  change goes in two places: the object file (+ `manifest.txt` for new
  objects) and a migration.
- Name files `YYYY-MM-DD_<topic>.sql`, dated after the newest existing file.
  The names define apply order, so they may lie in the future.
- Never edit a migration that may have been applied. Add a new one, even for
  typos.
- Migrations should be idempotent where feasible (`IF NOT EXISTS`,
  `CREATE OR REPLACE`) and leave the DB matching a fresh manifest init.
