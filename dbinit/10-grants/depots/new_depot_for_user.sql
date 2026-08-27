-- =============================================================================
-- GRANTs targeting depots.new_depot_for_user (function)
-- =============================================================================

GRANT EXECUTE ON FUNCTION depots.new_depot_for_user(UUID) TO anon, authenticated;
