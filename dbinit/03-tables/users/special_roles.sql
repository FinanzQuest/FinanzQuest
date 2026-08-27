-- =============================================================================
-- users.special_roles
-- Depends on: auth.users (created by GoTrue after 00-preauth, before 01-12),
--             users.special_role (02-types/special_role.sql)
-- =============================================================================

CREATE TABLE users.special_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_role users.special_role NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY(user_id, user_role)
);
