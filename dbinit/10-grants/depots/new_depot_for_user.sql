-- =============================================================================
-- GRANTs targeting depots.new_depot_for_user (function)
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.new_depot_for_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION depots.new_depot_for_user(uuid) TO authenticated;
