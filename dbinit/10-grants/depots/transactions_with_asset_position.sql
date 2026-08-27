-- =============================================================================
-- GRANTs targeting depots.transactions_with_asset_position
-- -----------------------------------------------------------------------------
-- FLAGGED: no object named depots.transactions_with_asset_position exists in
-- this schema (update.sql DROPs this name as a legacy view). Preserved
-- verbatim; errors harmlessly at init time unless the runner aborts on error.
-- =============================================================================

GRANT SELECT ON depots.transactions_with_asset_position TO authenticated;
