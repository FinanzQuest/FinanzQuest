-- =============================================================================
-- GRANTs targeting users.grant_teacher (function)
-- -----------------------------------------------------------------------------
-- FLAGGED: this GRANT appears twice in admin.sql (lines 40 and 56). The
-- second occurrence sits beside users.revoke_teacher and was likely meant for
-- it — revoke_teacher is never granted EXECUTE anywhere. Both statements are
-- preserved verbatim.
-- =============================================================================

GRANT EXECUTE ON FUNCTION users.grant_teacher(UUID) TO authenticated;  -- (admin.sql)

GRANT EXECUTE ON FUNCTION users.grant_teacher(UUID) TO authenticated;  -- (admin.sql, duplicate)