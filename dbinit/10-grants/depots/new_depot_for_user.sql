-- =============================================================================
-- GRANTs targeting depots.new_depot_for_user (function)
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.new_depot_for_user(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION depots.new_depot_for_user(uuid, text) TO authenticated;
