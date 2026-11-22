#!/bin/sh
# crond starts jobs with an empty environment; persist the updater's settings
# so run_updater.sh can load them when invoked from cron.
ENV_FILE=/etc/updater.env
: > "$ENV_FILE"
chmod 600 "$ENV_FILE"
for var in DB_URL ALPACA_SECRET_KEY ALPACA_KEY_ID YF_TIMEOUT ALPACA_TIMEOUT BATCH_SIZE FETCH_CHUNK_SIZE; do
  eval "val=\${$var}"
  printf "export %s='%s'\n" "$var" "$(printf '%s' "$val" | sed "s/'/'\\\\''/g")" >> "$ENV_FILE"
done

echo "Starting cron daemon..."
crond -f -l 2 &
echo "Running updater at startup..."
/usr/local/bin/run_updater.sh daily
