#!/bin/sh
# Usage: run_updater.sh [daily|intraday|resolve-providers] [extra updater args]
#        (default: daily), e.g. run_updater.sh resolve-providers --recheck-all
MODE="${1:-daily}"
[ $# -gt 0 ] && shift

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

# Settings and secrets come from the environment (DB_URL, ALPACA_*, ...):
# arguments would show up in the process list.
updater --mode "$MODE" "$@"
