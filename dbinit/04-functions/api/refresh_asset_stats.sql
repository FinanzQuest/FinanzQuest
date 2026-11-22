-- =============================================================================
-- api.refresh_asset_stats(job_id integer, config jsonb)  (procedure)
-- Depends on: api.asset_stats (05-materialized-views/api/asset_stats.sql),
--             resolved at call time
-- -----------------------------------------------------------------------------
-- TimescaleDB job (12-jobs/refresh_asset_stats.sql): rebuilds the search
-- statistics. CONCURRENTLY, so searches keep reading the old rows meanwhile.
-- =============================================================================

CREATE OR REPLACE PROCEDURE api.refresh_asset_stats(job_id integer, config jsonb)
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY api.asset_stats;
END
$$;
