-- =============================================================================
-- depots.savings_plans_budget_overview
-- Depends on: depots.savings_plans_budget, depots.savings_plans,
--             depots.sp_to_per_month (04-functions/depots/sp_to_per_month.sql)
-- security_invoker: the caller's RLS on savings_plans / savings_plans_budget
-- applies (members and teachers only).
-- =============================================================================

CREATE OR REPLACE VIEW depots.savings_plans_budget_overview
WITH (security_invoker = true) AS
SELECT
    dsb.budget,
    dsb.depot_id,
    dsb.last_changed,
    SUM(dsp.worth * depots.sp_to_per_month(dsp.period)) as monthly_expenses,
    dsb.budget - SUM(dsp.worth * depots.sp_to_per_month(dsp.period)) as remaining_budget
FROM depots.savings_plans_budget AS dsb
LEFT JOIN depots.savings_plans AS dsp ON dsp.depot_id = dsb.depot_id
GROUP BY dsb.budget, dsb.depot_id, dsb.last_changed;
