-- =============================================================================
-- depots.delete_savings_plan(p_ids)
-- Depends on: depots.savings_plans
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.delete_savings_plan(
  p_ids bigint[]
) RETURNS void AS $$
BEGIN
  DELETE FROM depots.savings_plans
  WHERE id = ANY(p_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
