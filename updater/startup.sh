#!/bin/sh
# crond starts jobs with an empty environment; persist the updater's settings
# so run_updater.sh can load them when invoked from cron.
ENV_FILE=/etc/updater.env
: > "$ENV_FILE"
chmod 600 "$ENV_FILE"
for var in DB_URL ALPACA_SECRET_KEY ALPACA_KEY_ID YF_TIMEOUT ALPACA_TIMEOUT BATCH_SIZE FETCH_CHUNK_SIZE DETAILS_DELAY_MS; do
  eval "val=\${$var}"
  # unset in the container: leave it out, so the updater uses its default
  # (an empty value would be passed and rejected)
  [ -n "$val" ] || continue
  printf "export %s='%s'\n" "$var" "$(printf '%s' "$val" | sed "s/'/'\\\\''/g")" >> "$ENV_FILE"
done

echo "Starting cron daemon..."
crond -f -l 2 &
echo "Running updater at startup..."
# Assets without a price provider (new, or served by neither API last time):
# ask Alpaca, then Yahoo Finance. Cheap once everything is resolved.
/usr/local/bin/run_updater.sh resolve-providers
/usr/local/bin/run_updater.sh daily
# Intraday too, on any day: it fetches from the newest stored bar (or the
# last 30 days on a fresh database), so gaps from downtime are filled.
/usr/local/bin/run_updater.sh intraday
# Fund facts/holdings/countries (skips funds updated in the last 20 hours)
# and the oldest stock figures; last, so prices are never held up by it.
/usr/local/bin/run_updater.sh details

# Keep the container alive on crond: if this script exits, the container
# stops and `restart: unless-stopped` re-runs the whole startup fetch.
wait
