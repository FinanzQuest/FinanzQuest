-- =============================================================================
-- users.get_all_profiles()
-- Depends on: auth.users (auth schema, created by GoTrue)
-- Used by users.profile view (06-views/users/profile.sql)
-- =============================================================================

CREATE OR REPLACE FUNCTION users.get_all_profiles()
RETURNS TABLE(user_id uuid, name text, created_at timestamptz) AS $$
BEGIN
    RETURN QUERY
    SELECT
        au.id AS user_id,
        au.raw_user_meta_data->>'name' AS name,
        au."created_at"
    FROM auth.users as au;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' STABLE;
