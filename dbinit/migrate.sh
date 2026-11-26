#!/bin/sh
set -eu

# Applies dbinit/migrations/ files to an EXISTING database, in the order given,
# as the superuser, and stops at the first failure. Runs inside the compose
# db-init service (dbinit/ is mounted at /init/dbinit, PG* env is set), so the
# \ir includes of the migrations resolve:
#
#   prod:  sudo -iu finanzquest finanzquest-ctl compose run --rm -T db-init \
#            sh /init/dbinit/migrate.sh 2026-12-05_tutorial_progress.sql 2026-12-06_...sql
#   dev:   docker compose -f compose.dev.yml run --rm -T db-init \
#            sh /init/dbinit/migrate.sh 2026-12-10_etfs_after_introduction.sql
#
# Arguments are file names (looked up in migrations/) or paths. Back up first;
# there is no migrations table, so pass only files the database has not got
# yet. Most migrations are re-runnable, but the header of each says so.

DIR="$(dirname "$0")/migrations"

[ $# -gt 0 ] || { echo "usage: migrate.sh <migration.sql>..." >&2; exit 2; }

initialised=$(psql -Atc "SELECT to_regclass('depots.depots') IS NOT NULL")
[ "$initialised" = "t" ] || { echo "error: database is not initialised (use the manifest)" >&2; exit 1; }

# check every file before touching the database
for f in "$@"; do
  case "$f" in */*) path="$f" ;; *) path="$DIR/$f" ;; esac
  [ -f "$path" ] || { echo "error: no such migration: $f" >&2; exit 2; }
done

for f in "$@"; do
  case "$f" in */*) path="$f" ;; *) path="$DIR/$f" ;; esac
  echo "==> $f"
  psql -v ON_ERROR_STOP=1 -q -f "$path"
done
echo "Applied $# migration(s)."
