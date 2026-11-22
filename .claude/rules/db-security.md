---
paths:
  - "dbinit/03-tables/**"
  - "dbinit/04-functions/**"
  - "dbinit/06-views/**"
  - "dbinit/05-materialized-views/**"
  - "dbinit/08-roles/**"
  - "dbinit/09-policies/**"
  - "dbinit/10-grants/**"
---

# DB security (RLS, roles, grants, definer functions)

- Every table with user-facing data: `ENABLE ROW LEVEL SECURITY`, default
  deny, one explicit policy per operation (select/insert/update/delete).
  Never rely on "no policy = no access" without verifying RLS is enabled.
- Grant the narrowest role/privilege a feature needs.
- Don't expose internal or admin-only tables/columns through views, policies
  or grants without an explicit decision (record it in memory).
- `SECURITY DEFINER` functions must pin `search_path` (see migration
  `2026-11-27_definer_search_path.sql`).
- `api.assets` is written by the updater's service role only. Add no
  frontend/user write policies.
- After changes, run `dbinit/tests/security.sql`.
