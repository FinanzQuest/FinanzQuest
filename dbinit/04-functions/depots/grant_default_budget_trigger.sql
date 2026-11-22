-- =============================================================================
-- depots.grant_default_budget_trigger() — TRIGGER FUNCTION
-- Depends on: depots.change_budget (04-functions/depots/change_budget.sql),
--             config.monthly_budget_start setting (11-config/config.sql)
-- Trigger definition lives in 07-triggers/depots/grant_default_budget.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.grant_default_budget_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
    budget INT;
BEGIN
    budget := COALESCE(current_setting('config.monthly_budget_start')::INT, 0);
    PERFORM depots.change_budget(NEW.id, budget); -- Set default budget, adjust as needed
    RETURN NEW;
END;
$$ SECURITY DEFINER SET search_path = '';
