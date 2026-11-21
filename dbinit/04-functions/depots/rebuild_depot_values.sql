-- =============================================================================
-- depots.rebuild_depot_values(p_depot_id DEFAULT NULL, p_from DEFAULT NULL)
-- Depends on: depots.rebuild_depot_values_for (04-functions/depots/), depots.depots
-- -----------------------------------------------------------------------------
-- Manual repair entry point: rebuild daily_values for one depot (or all, NULL)
-- from p_from (or the whole history, NULL). Needed e.g. after prices older
-- than the job's 7-day window were corrected.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.rebuild_depot_values(p_depot_id bigint DEFAULT NULL, p_from date DEFAULT NULL)
RETURNS void
LANGUAGE sql
AS $$
  SELECT depots.rebuild_depot_values_for(
    array_agg(d.id),
    array_agg(COALESCE(p_from, '-infinity'::date))
  )
  FROM depots.depots d
  WHERE p_depot_id IS NULL OR d.id = p_depot_id;
$$;
