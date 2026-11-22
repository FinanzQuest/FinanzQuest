-- =============================================================================
-- depots.delete_savings_plan(p_ids)
-- Depends on: depots.savings_plans, depots.is_depot_member
-- -----------------------------------------------------------------------------
-- Deletes the given plans — only those in depots the caller is a member of.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.delete_savings_plan(
  p_ids bigint[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM depots.savings_plans sp
  WHERE sp.id = ANY(p_ids)
    AND depots.is_depot_member(sp.depot_id);
END;
$$;
