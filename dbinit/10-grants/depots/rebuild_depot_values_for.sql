-- =============================================================================
-- GRANTs targeting depots.rebuild_depot_values_for (function)
-- -----------------------------------------------------------------------------
-- Internal to the valuation pipeline (trigger / job / manual repair as the
-- owner). Not callable by clients.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.rebuild_depot_values_for(bigint[], date[]) FROM PUBLIC;
