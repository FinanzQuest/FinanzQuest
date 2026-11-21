-- =============================================================================
-- GRANTs targeting depots.aggregated_values_with_curr (view)
-- -----------------------------------------------------------------------------
-- authenticated only, same as depots.depot_values_with_curr (rows are already
-- limited to the caller's own depots).
-- =============================================================================

GRANT SELECT ON depots.aggregated_values_with_curr TO authenticated;
