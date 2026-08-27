-- =============================================================================
-- depots.grant_default_budget (trigger on depots.depots)
-- Depends on: depots.depots (03-tables/depots/depots.sql),
--             depots.grant_default_budget_trigger
--             (04-functions/depots/grant_default_budget_trigger.sql)
-- -----------------------------------------------------------------------------
-- Trigger definition only — the function it calls lives in 04-functions/.
-- =============================================================================

CREATE TRIGGER grant_default_budget
AFTER INSERT ON depots.depots
FOR EACH ROW
EXECUTE FUNCTION depots.grant_default_budget_trigger();
