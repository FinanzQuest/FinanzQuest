-- =============================================================================
-- Job: users.cleanup_guests — TimescaleDB background worker (daily 03:30)
-- Depends on: users.cleanup_guests procedure
--             (04-functions/users/cleanup_guests.sql)
-- Deletes guests (anonymous users) inactive for config.days days, with depots.
-- =============================================================================

SELECT add_job(
  proc              => 'users.cleanup_guests',
  schedule_interval => INTERVAL '1 day',
  config            => '{"days": 30}'::jsonb,
  initial_start     => date_trunc('day', NOW()) + INTERVAL '1 day 3 hours 30 minutes',
  scheduled         => true,
  fixed_schedule    => true
);
