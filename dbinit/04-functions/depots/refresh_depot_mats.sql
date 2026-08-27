-- =============================================================================
-- PROCEDURE depots.refresh_depot_mats(job_id, config)
-- Depends on: depots.aggregated_transactions_mat, depots.position_values_mat
--             (05-materialized-views/depots/) — refreshed in this order.
-- Job registration (add_job) lives in 12-jobs/refresh_depot_mats.sql.
-- =============================================================================

CREATE OR REPLACE PROCEDURE depots.refresh_depot_mats(job_id int, config jsonb)
LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY depots.aggregated_transactions_mat;
  REFRESH MATERIALIZED VIEW CONCURRENTLY depots.position_values_mat;
END;
$$;
