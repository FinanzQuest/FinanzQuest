-- =============================================================================
-- users.get_admin_overview()
-- Depends on: users.has_any_role (04-functions/users/has_any_role.sql),
--             auth.users, users.special_roles,
--             depots.depots, depots.holdings, depots.transactions
-- Used by users.admin_overview view (06-views/users/admin_overview.sql)
-- =============================================================================

CREATE OR REPLACE FUNCTION users.get_admin_overview()
RETURNS TABLE(
    id uuid,
    email text,
    created_at timestamptz,
    meta_data jsonb,
    user_name text,
    banned_until timestamptz,
    user_roles users.special_role[],
    role_granted_at timestamptz[],
    depot_count bigint,
    position_count bigint,
    transaction_count bigint
) AS $$
BEGIN
    IF NOT (users.has_any_role('admin', 'teacher') OR users.is_superuser_session()) THEN
        RAISE EXCEPTION 'Unauthorized: Admin or Teacher role required'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        au.id as user_id,
        au.email::text,
        au.created_at,
        au.raw_user_meta_data,
        au.raw_user_meta_data->>'name' AS user_name,
        au.banned_until,
        roles.user_roles,
        roles.role_granted_at,
        COUNT(DISTINCT d.id) AS depot_count,
        COUNT(DISTINCT (p.depot_id, p.asset_id)) AS position_count,
        COUNT(DISTINCT t.id) AS transaction_count
    FROM auth.users AS au
    LEFT JOIN LATERAL (
        SELECT
            array_agg(us.user_role ORDER BY us.granted_at) AS user_roles,
            array_agg(us.granted_at ORDER BY us.granted_at) AS role_granted_at
        FROM users.special_roles AS us
        WHERE us.user_id = au.id
    ) roles ON true
    LEFT JOIN depots.depots AS d ON au.id = ANY(d.users)
    LEFT JOIN depots.holdings AS p
        ON d.id = p.depot_id AND p.asset_id IS NOT NULL AND p.amount > 0
    LEFT JOIN depots.transactions AS t ON d.id = t.depot_id
    GROUP BY au.id, au.email, au.created_at, au.raw_user_meta_data, roles.user_roles, roles.role_granted_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' STABLE;
