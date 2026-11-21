-- =============================================================================
-- GRANTs targeting depots.position_values_with_curr (view)
-- -----------------------------------------------------------------------------
-- Per-position history + live current -> authenticated only (never anon), like
-- depots.current_position_value. The view is owner-run and additionally scopes
-- every row through is_depot_member.
-- =============================================================================

GRANT SELECT ON depots.position_values_with_curr TO authenticated;
