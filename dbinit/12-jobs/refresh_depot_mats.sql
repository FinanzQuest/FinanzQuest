-- =============================================================================
-- Job: depots.refresh_depot_mats — TimescaleDB background worker (daily ~02:00)
-- Depends on: depots.refresh_depot_mats procedure
--             (04-functions/depots/refresh_depot_mats.sql)
-- -----------------------------------------------------------------------------
-- Order matters inside the procedure: aggregated_transactions_mat before
-- position_values_mat.
-- =============================================================================

SELECT add_job(
  proc              => 'depots.refresh_depot_mats',
  schedule_interval => INTERVAL '1 day',
  initial_start     => date_trunc('day', NOW()) + INTERVAL '2 hours',
  scheduled         => true,
  fixed_schedule    => true
);
