-- =============================================================================
-- GRANTs targeting depots.rebuild_holdings (function)
-- -----------------------------------------------------------------------------
-- Internal to the valuation pipeline (trigger / job / manual repair as the
-- owner). Not callable by clients.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.rebuild_holdings() FROM PUBLIC;
