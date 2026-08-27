-- =============================================================================
-- GRANTs targeting depots.position_profits
-- -----------------------------------------------------------------------------
-- FLAGGED: no object named depots.position_profits exists in this schema
-- (update.sql DROPs this name as a legacy view). Preserved verbatim;
-- errors harmlessly at init time unless the runner aborts on error.
-- =============================================================================

GRANT SELECT ON depots.position_profits TO authenticated;  -- (permissions.sql)

GRANT SELECT ON depots.position_profits TO authenticated;  -- (postauth.sql)
