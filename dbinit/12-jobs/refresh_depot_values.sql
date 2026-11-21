-- =============================================================================
-- Job: depots.refresh_depot_values — TimescaleDB background worker (hourly :05)
-- Depends on: depots.refresh_depot_values procedure
--             (04-functions/depots/refresh_depot_values.sql)
-- =============================================================================

SELECT add_job(
  proc              => 'depots.refresh_depot_values',
  schedule_interval => INTERVAL '1 hour',
  config            => '{"days": 7}',
  initial_start     => date_trunc('hour', NOW()) + INTERVAL '1 hour 5 minutes',
  scheduled         => true,
  fixed_schedule    => true
);
