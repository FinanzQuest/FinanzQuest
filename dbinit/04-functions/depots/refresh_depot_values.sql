-- =============================================================================
-- PROCEDURE depots.refresh_depot_values(job_id, config)
-- Depends on: depots.rebuild_depot_values_for (04-functions/depots/),
--             depots.depots, depots.daily_values
-- Job registration (add_job) lives in 12-jobs/refresh_depot_values.sql.
-- -----------------------------------------------------------------------------
-- Hourly: closes yesterday into depots.daily_values and re-values the last
-- config.days (default 7) days of every depot, so late or corrected prices
-- land in history. A depot whose stored history ends earlier (job was down)
-- is rebuilt from the day after its last stored day.
-- =============================================================================

CREATE OR REPLACE PROCEDURE depots.refresh_depot_values(job_id int, config jsonb)
LANGUAGE plpgsql
AS $$
DECLARE
  v_from date := CURRENT_DATE - COALESCE((config ->> 'days')::int, 7);
BEGIN
  PERFORM depots.rebuild_depot_values_for(
    array_agg(d.id),
    array_agg(LEAST(v_from, COALESCE(l.last_day + 1, '-infinity'::date)))
  )
  FROM depots.depots d
  LEFT JOIN LATERAL (
    SELECT MAX(dv.tstamp) AS last_day
    FROM depots.daily_values dv
    WHERE dv.depot_id = d.id
  ) l ON TRUE;
END;
$$;
