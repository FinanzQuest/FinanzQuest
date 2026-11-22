-- =============================================================================
-- depots.get_depot_overview()
-- Depends on: users.has_any_role (04-functions/users/has_any_role.sql),
--             depots.depots, depots.transactions, depots.holdings,
--             users.profile (06-views/users/profile.sql — at call time),
--             depots.savings_plans_budget
-- Used by depots.depot_overview view (06-views/depots/depot_overview.sql)
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.get_depot_overview() RETURNS TABLE(
    id bigint,
    cash numeric,
    cash_start bigint,
    transaction_count bigint,
    position_count bigint,
    user_names text[],
    user_ids uuid[],
    all_ids uuid[],
    monthly_budget int
) AS $$
    BEGIN
        IF NOT (users.has_any_role('admin', 'teacher') OR users.is_superuser_session()) THEN
            RAISE EXCEPTION 'Unauthorized: Admin or Teacher role required'
                USING ERRCODE = '42501';
        END IF;

        RETURN QUERY
        SELECT
            d.id,
            d.cash,
            d.cash_start,
            COUNT(DISTINCT dt.id) as transaction_count,
            COUNT(DISTINCT dp.asset_id) as position_count,
            u.user_names,
            u.user_ids,
            d.users as all_ids,
            dsb.budget as monthly_budget
        FROM depots.depots AS d
        LEFT JOIN depots.transactions AS dt
        ON dt.depot_id = d.id
        LEFT JOIN depots.holdings AS dp
        ON dp.depot_id = d.id AND dp.asset_id IS NOT NULL AND dp.amount > 0
        LEFT JOIN LATERAL (
            SELECT
                array_agg(up.name ORDER BY up.user_id) AS user_names,
                array_agg(up.user_id ORDER BY up.user_id) AS user_ids
            FROM users.profile AS up
            WHERE up.user_id = ANY(d.users)
        ) u ON TRUE
        LEFT JOIN depots.savings_plans_budget AS dsb
        ON dsb.depot_id = d.id
        GROUP BY d.id, u.user_names, u.user_ids, dsb.budget;
    END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' STABLE;
