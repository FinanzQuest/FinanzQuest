-- =============================================================================
-- depots.change_budget(p_depot_id, p_budget)
-- Depends on: depots.savings_plans_budget
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.change_budget(p_depot_id BIGINT, p_budget INT)
RETURNS VOID
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO depots.savings_plans_budget (depot_id, budget, last_changed)
    VALUES (p_depot_id, p_budget, NOW())
    ON CONFLICT (depot_id) DO UPDATE
    SET
        budget = EXCLUDED.budget,
        last_changed = EXCLUDED.last_changed;
END;
$$;
