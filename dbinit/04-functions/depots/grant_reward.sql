-- =============================================================================
-- depots.grant_reward(p_depot_id, p_amount)
-- Depends on: users.has_any_role (04-functions/users/has_any_role.sql),
--             depots.depots
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.grant_reward(p_depot_id BIGINT, p_amount INT)
RETURNS VOID AS $$
    BEGIN
        IF NOT (users.has_any_role('teacher') OR current_user = 'postgres') THEN
            RAISE EXCEPTION 'Unauthorized: Admin or Teacher role required'
                USING ERRCODE = '42501';
        END IF;
        UPDATE depots.depots AS d
        SET cash = d.cash + p_amount
        WHERE d.id = p_depot_id;
    END;
$$ LANGUAGE plpgsql;
