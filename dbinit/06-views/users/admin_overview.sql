-- =============================================================================
-- users.admin_overview
-- Depends on: users.get_admin_overview (04-functions/users/get_admin_overview.sql)
-- =============================================================================

CREATE OR REPLACE VIEW users.admin_overview AS SELECT * FROM users.get_admin_overview();
