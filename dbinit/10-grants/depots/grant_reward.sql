-- =============================================================================
-- GRANTs targeting depots.grant_reward (function)
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.grant_reward(bigint, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION depots.grant_reward(bigint, int) TO authenticated;
