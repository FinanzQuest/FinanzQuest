-- =============================================================================
-- users.profile
-- Depends on: users.get_all_profiles (04-functions/users/get_all_profiles.sql),
--             auth.users
-- =============================================================================

CREATE OR REPLACE VIEW users.profile AS
SELECT * FROM users.get_all_profiles();
