-- =============================================================================
-- depots.grant_reward(p_depot_id, p_amount)
-- Depends on: users.has_any_role (04-functions/users/has_any_role.sql),
--             depots.depots, depots.transactions (reward is logged as a
--             'movement'; teachers insert it via the policy in
--             09-policies/depots/transactions.sql)
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

        -- Log the reward in the ledger so depot value/cash reflect it.
        -- (user_id stays NULL like savings plan executions; authenticated has
        -- no access to the auth schema.)
        INSERT INTO depots.transactions (depot_id, asset_id, amount, price, commission, type)
        VALUES (p_depot_id, NULL, p_amount, NULL, 0, 'movement');
    END;
$$ LANGUAGE plpgsql;
