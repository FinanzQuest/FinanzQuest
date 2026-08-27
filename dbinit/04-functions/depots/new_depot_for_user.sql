-- =============================================================================
-- depots.new_depot_for_user(p_user_id)
-- Depends on: depots.depots
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.new_depot_for_user(p_user_id UUID)
RETURNS BIGINT AS $$
DECLARE
    v_depot_id BIGINT;
BEGIN
    -- Use provided user_id or fall back to auth.uid()

    INSERT INTO depots.depots (created, cash, cash_start, users)
    VALUES (NOW(), 50000, 50000, ARRAY[p_user_id])
    RETURNING id INTO v_depot_id;

    RETURN v_depot_id;
END;
$$ LANGUAGE plpgsql;
