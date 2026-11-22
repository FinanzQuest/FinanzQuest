-- =============================================================================
-- Job: depots.run_savings_plans — TimescaleDB background worker (daily 02:30)
-- Depends on: depots.run_savings_plans procedure
--             (04-functions/depots/execute_savings_plans.sql)
-- Runs after the nightly price update (updater cron 01:00).
-- =============================================================================

SELECT add_job(
  proc              => 'depots.run_savings_plans',
  schedule_interval => INTERVAL '1 day',
  initial_start     => date_trunc('day', NOW()) + INTERVAL '1 day 2 hours 30 minutes',
  scheduled         => true,
  fixed_schedule    => true
);
