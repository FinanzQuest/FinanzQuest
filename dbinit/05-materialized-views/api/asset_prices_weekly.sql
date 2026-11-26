-- =============================================================================
-- api.asset_prices_weekly — TimescaleDB continuous aggregate
-- Depends on: api.asset_prices (03-tables/api/asset_prices.sql),
--             timescaledb extension (01-schema/extensions.sql)
-- Continuous-aggregate policy (add_continuous_aggregate_policy) is bundled
-- here with the matview; no separate 12-jobs entry is needed for it.
-- =============================================================================

-- TimescaleDB continuous aggregate: weekly OHLCV
CREATE MATERIALIZED VIEW api.asset_prices_weekly
WITH (timescaledb.continuous) AS
SELECT
  d.asset_id,
  time_bucket(INTERVAL '1 week', d.tstamp) AS tstamp,
  FIRST(d.open,  d.tstamp) AS open,
  MAX(d.high)              AS high,
  MIN(d.low)               AS low,
  LAST(d.close,  d.tstamp) AS close,
  SUM(d.volume)            AS volume
FROM api.asset_prices d
GROUP BY d.asset_id, time_bucket(INTERVAL '1 week', d.tstamp);

-- start_offset NULL: refresh the whole history, not just the last weeks.
-- The aggregate is materialized-only and the updater backfills years of daily
-- rows after this view is created, so a short window left the 5J chart empty.
SELECT add_continuous_aggregate_policy(
  'api.asset_prices_weekly',
  start_offset      => NULL,
  end_offset        => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 day'
);
