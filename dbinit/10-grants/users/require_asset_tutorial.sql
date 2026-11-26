-- =============================================================================
-- GRANTs targeting users.require_asset_tutorial (function)
-- -----------------------------------------------------------------------------
-- Internal helper (takes any user id): no client EXECUTE.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION users.require_asset_tutorial(uuid, bigint) FROM PUBLIC;
