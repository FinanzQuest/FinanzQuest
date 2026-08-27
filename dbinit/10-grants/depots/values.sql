-- =============================================================================
-- GRANTs targeting depots.values (view)
-- =============================================================================

GRANT SELECT ON depots.values TO authenticated;  -- (init.sql)
GRANT SELECT ON depots.values TO anon;           -- (init.sql)

GRANT SELECT ON depots."values" TO authenticated;  -- (permissions.sql, quoted)
