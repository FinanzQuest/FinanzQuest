#!/bin/sh
set -eu

# Applies dbinit/migrations/ files to an EXISTING database as the superuser,
# in file-name order, and records every applied file in public.schema_migrations
# so it is never applied twice. Stops at the first failure. Runs inside the
# compose db-init service (dbinit/ is mounted at /init/dbinit, PG* env is set),
# so the \ir includes of the migrations resolve:
#
#   prod:  sudo -iu finanzquest finanzquest-ctl compose run --rm -T db-init sh /init/dbinit/migrate.sh [...]
#   dev:   docker compose --env-file .env.local -f compose.dev.yml run --rm -T db-init sh /init/dbinit/migrate.sh [...]
#          (the dev stack's secrets are in .env.local; without --env-file compose reads .env
#          and recreates the containers it depends on with those secrets)
#
#   migrate.sh                      apply all pending migrations
#   migrate.sh <file.sql>...        apply these, in the given order (skips applied ones)
#   migrate.sh --status             list applied / pending
#   migrate.sh --baseline <file>    record <file> and all before it as applied WITHOUT
#                                   running them (once, on a database that has them
#                                   already: look at which one was applied last)
#   migrate.sh --baseline-all       record every file as applied (a database freshly
#                                   built from the manifest has them all; apply_manifest.sh
#                                   calls this)
#
# Back up first. Without a baseline (empty table) nothing is applied unasked:
# a database that predates this script would otherwise re-run old migrations.

DIR="$(dirname "$0")/migrations"
export PGOPTIONS="${PGOPTIONS:-} -c client_min_messages=warning"
q() { psql -Atq -v ON_ERROR_STOP=1 -c "$1"; }

die() { echo "error: $*" >&2; exit 1; }

[ "$(q "SELECT to_regclass('depots.depots') IS NOT NULL")" = "t" ] \
  || die "database is not initialised (use the manifest)"

q "CREATE TABLE IF NOT EXISTS public.schema_migrations (
     name       text        PRIMARY KEY,
     applied_at timestamptz NOT NULL DEFAULT now()
   );
   ALTER TABLE public.schema_migrations ENABLE ROW LEVEL SECURITY;
   REVOKE ALL ON public.schema_migrations FROM PUBLIC;"

files() { (cd "$DIR" && ls -1 ./*.sql 2>/dev/null | sed 's|^\./||' | sort); }
path_of() { case "$1" in */*) echo "$1" ;; *) echo "$DIR/$1" ;; esac; }
applied() { [ "$(q "SELECT EXISTS (SELECT 1 FROM public.schema_migrations WHERE name = '$1')")" = "t" ]; }
record() { q "INSERT INTO public.schema_migrations (name) VALUES ('$1') ON CONFLICT DO NOTHING"; }

case "${1:-}" in
  --status)
    for f in $(files); do
      if applied "$f"; then echo "applied  $f"; else echo "pending  $f"; fi
    done
    exit 0 ;;
  --baseline-all)
    for f in $(files); do record "$f"; done
    echo "Recorded $(files | wc -l | tr -d ' ') migration(s) as applied."
    exit 0 ;;
  --baseline)
    [ -n "${2:-}" ] || die "usage: migrate.sh --baseline <migration.sql>"
    last="$(basename "$2")"
    files | grep -qx "$last" || die "no such migration: $last"
    n=0
    for f in $(files); do
      record "$f"; n=$((n + 1))
      [ "$f" = "$last" ] && break
    done
    echo "Recorded $n migration(s) up to $last as applied (not run)."
    exit 0 ;;
esac

if [ $# -gt 0 ]; then
  list="$*"
else
  [ "$(q "SELECT count(*) FROM public.schema_migrations")" -gt 0 ] \
    || die "no migration is recorded yet: run --baseline <last migration this database already has> first (see --status)"
  list="$(files)"
fi

# check every file before touching the database
for f in $list; do
  [ -f "$(path_of "$f")" ] || die "no such migration: $f"
done

n=0
for f in $list; do
  name="$(basename "$f")"
  if applied "$name"; then echo "-- $name (already applied)"; continue; fi
  echo "==> $name"
  psql -v ON_ERROR_STOP=1 -q -f "$(path_of "$f")"
  record "$name"
  n=$((n + 1))
done
echo "Applied $n migration(s)."
