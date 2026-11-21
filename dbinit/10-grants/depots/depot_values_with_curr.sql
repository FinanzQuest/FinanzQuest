-- =============================================================================
-- GRANTs targeting depots.depot_values_with_curr (view)
-- -----------------------------------------------------------------------------
-- Depot value history + live current -> authenticated only. (Unlike
-- depots.values/leaderboard this includes the live per-depot position data from
-- current_position_value, so it is not anon-readable; grant to anon later if
-- the leaderboard should surface live values.)
-- =============================================================================

GRANT SELECT ON depots.depot_values_with_curr TO authenticated;
