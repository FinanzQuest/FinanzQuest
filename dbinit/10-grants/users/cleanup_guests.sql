-- =============================================================================
-- GRANTs targeting users.cleanup_guests (procedure) — job only, no client access.
-- =============================================================================

REVOKE EXECUTE ON PROCEDURE users.cleanup_guests(int, jsonb) FROM PUBLIC, anon, authenticated;
