-- =============================================================================
-- GRANTs targeting depots.aggregated_transactions
-- -----------------------------------------------------------------------------
-- FLAGGED: no object named depots.aggregated_transactions exists in this
-- schema (the materialized view is aggregated_transactions_mat; update.sql
-- DROPs this name as a legacy view). Preserved verbatim; errors harmlessly at
-- init time unless the runner aborts on error.
-- =============================================================================

GRANT SELECT ON depots.aggregated_transactions TO authenticated;
