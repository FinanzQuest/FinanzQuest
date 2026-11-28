#!/usr/bin/env bash
# Initialise a throwaway database exactly like production does (db -> GoTrue ->
# db-init applying manifest.txt), then run the schema smoke test and the
# feature tests in dbinit/tests/.
#
# Run from the repo root. Works locally next to a running dev stack:
#     bash .github/scripts/db-test.sh
set -euo pipefail

PROJECT="${COMPOSE_PROJECT:-fq-ci-db}"
ENV_FILE="$(mktemp)"
compose() {
  docker compose -p "$PROJECT" --env-file "$ENV_FILE" \
    -f compose.core.yml -f .github/ci/compose.ci.yml "$@"
}

cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    echo "::group::Container logs"
    compose logs --no-color db auth db-init || true
    echo "::endgroup::"
  fi
  compose down -v --remove-orphans >/dev/null 2>&1 || true
  rm -f "$ENV_FILE"
  exit "$status"
}
trap cleanup EXIT

rand() { openssl rand -hex 24; }
cat > "$ENV_FILE" <<EOF
POSTGRES_PASSWORD=$(rand)
AUTH_ADMIN_PASSWORD=$(rand)
AUTHENTICATOR_PASSWORD=$(rand)
SERVICE_WORKER_PASSWORD=$(rand)
JWT_SECRET=$(rand)
SITE_URL=http://localhost:3000
EOF

echo "==> Starting db, auth and db-init"
compose up -d db auth db-init

echo "==> Waiting for db-init to apply manifest.txt"
# `compose wait` exits with the container's exit code
if ! compose wait db-init; then
  echo "db-init failed" >&2
  exit 1
fi

echo "==> migrate.sh as the deploy runs it (fresh init is baselined: applies nothing)"
compose run --rm -T db-init sh /init/dbinit/migrate.sh --if-initialised
compose run --rm -T db-init sh /init/dbinit/migrate.sh --status | grep -q '^pending' \
  && { echo "fresh database has pending migrations" >&2; exit 1; }

run_sql() {
  echo "==> $1"
  compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q -f - < "$1"
}

run_sql dbinit/verify_schema.sql
for f in dbinit/tests/*.sql; do
  # *_perf.sql are timing experiments that leave thousands of rows behind
  case "$f" in *_perf.sql) continue ;; esac
  run_sql "$f"
done

echo "All database checks passed."
