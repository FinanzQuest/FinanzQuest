-- =============================================================================
-- Job: refresh api.asset_stats hourly (prices change every 15 minutes in
-- trading hours; returns and sparklines need no fresher data for search)
-- =============================================================================

SELECT add_job(
  proc              => 'api.refresh_asset_stats',
  schedule_interval => INTERVAL '1 hour',
  initial_start     => date_trunc('hour', NOW()) + INTERVAL '1 hour 20 minutes',
  scheduled         => true,
  fixed_schedule    => true
);
