#!/bin/sh
set -eu

# Phase 2 (POST-GoTrue): apply every file in manifest.txt EXCEPT the
# 00-preauth block, which already ran in the docker-entrypoint (phase 1,
# dbinit/init.sh). Order comes strictly from manifest.txt — never find | sort.
#
# Expected env (set by the compose db-init service):
#   MANIFEST  path to manifest.txt                       (default /init/manifest.txt)
#   BASE      prefix applied to each relative path in it (default /init)
#   AUTHENTICATOR_PASSWORD / SERVICE_WORKER_PASSWORD     (psql -v, used by 08-roles/)
#   AUTH_ADMIN_PASSWORD                                  (passed for safety; 00-preauth is skipped)

MANIFEST="${MANIFEST:-/init/manifest.txt}"
BASE="${BASE:-/init}"

# db-init runs on every `docker compose up`. The manifest builds a fresh
# database; re-applying it over an existing (possibly older) schema half-applies
# the new objects. Existing databases are upgraded with dbinit/migrations/.
# FORCE_MANIFEST=1 re-applies anyway (e.g. after an init that failed midway).
initialised=$(psql -Atc "SELECT to_regclass('depots.depots') IS NOT NULL")   # set -e: stop if unreachable
if [ "${FORCE_MANIFEST:-0}" != "1" ] && [ "$initialised" = "t" ]; then
  echo "Database already initialised (depots.depots exists): skipping manifest."
  echo "Apply pending files from dbinit/migrations/ to upgrade an existing database."
  exit 0
fi

while IFS= read -r line; do
  # skip blank lines and comments
  case "$line" in
    ''|\#*) continue ;;
  esac
  # skip the pre-GoTrue block — already applied in phase 1
  case "$line" in
    *00-preauth*) continue ;;
  esac
  echo "==> $line"
  psql \
    -v AUTH_ADMIN_PASSWORD="$AUTH_ADMIN_PASSWORD" \
    -v AUTHENTICATOR_PASSWORD="$AUTHENTICATOR_PASSWORD" \
    -v SERVICE_WORKER_PASSWORD="$SERVICE_WORKER_PASSWORD" \
    -f "$BASE/$line"
done < "$MANIFEST"
