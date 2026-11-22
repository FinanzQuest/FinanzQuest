#!/bin/sh
# Usage: run_updater.sh [daily|intraday]   (default: daily)
MODE="${1:-daily}"

# Settings persisted by startup.sh (cron jobs do not inherit the container env).
[ -f /etc/updater.env ] && . /etc/updater.env

# One run per mode at a time: a slow run makes the next cron tick skip
# instead of piling up a second, concurrent updater.
LOCK="/tmp/updater-$MODE.lock"
exec 9>"$LOCK"
if ! flock -n 9; then
  echo "updater ($MODE) already running, skipping"
  exit 0
fi

updater \
  --mode "$MODE" \
  --db-url "$DB_URL" \
  --alpaca-secret-key "$ALPACA_SECRET_KEY" \
  --alpaca-key-id "$ALPACA_KEY_ID" \
  --yf-timeout "$YF_TIMEOUT" \
  --alpaca-timeout "$ALPACA_TIMEOUT" \
  --batch-size "$BATCH_SIZE" \
  --fetch-chunk-size "$FETCH_CHUNK_SIZE"
