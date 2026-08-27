#!/bin/bash
set -euo pipefail

# Phase 1 (PRE-GoTrue): apply only the auth_admin block that GoTrue needs to
# start. Everything else (01-schema -> seed) is applied POST-GoTrue by the
# db-init service, which walks manifest.txt (see apply_manifest.sh).
# Do NOT add more files here — 00-preauth/ is the only pre-GoTrue phase.

psql -v AUTH_ADMIN_PASSWORD="$AUTH_ADMIN_PASSWORD" \
     -U "$POSTGRES_USER" \
     -d "$POSTGRES_DB" \
     -f /init/00-preauth/01_auth_admin.sql
