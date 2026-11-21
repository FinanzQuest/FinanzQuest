-- =============================================================================
-- GRANTs targeting depots.on_transactions_change (function)
-- -----------------------------------------------------------------------------
-- Internal to the valuation pipeline (trigger / job / manual repair as the
-- owner). Not callable by clients.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.on_transactions_change() FROM PUBLIC;
