-- =============================================================================
-- GRANTs targeting depots.apply_ledger_delta (function)
-- -----------------------------------------------------------------------------
-- Internal to the valuation pipeline (trigger / job / manual repair as the
-- owner). Not callable by clients.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.apply_ledger_delta(depots.transactions[], int) FROM PUBLIC;
