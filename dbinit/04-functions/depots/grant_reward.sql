-- =============================================================================
-- depots.grant_reward(p_depot_id, p_amount)
-- Depends on: users.has_any_role, users.is_superuser_session
--             (04-functions/users/), depots.depots, depots.transactions
-- -----------------------------------------------------------------------------
-- A teacher credits (or, with a negative amount, debits) virtual cash to a
-- depot. Logged as a 'movement' in the ledger; the ledger trigger updates
-- depots.cash, holdings and values. SECURITY DEFINER because clients cannot
-- write the ledger; the role check below is the gate.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.grant_reward(p_depot_id bigint, p_amount int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT (users.has_any_role('teacher') OR users.is_superuser_session()) THEN
    RAISE EXCEPTION 'Unauthorized: Teacher role required' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount = 0 THEN
    RAISE EXCEPTION 'Amount must not be zero' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM depots.depots d WHERE d.id = p_depot_id) THEN
    RAISE EXCEPTION 'Depot with id % not found', p_depot_id;
  END IF;

  INSERT INTO depots.transactions (depot_id, user_id, asset_id, amount, price, commission, type)
  VALUES (p_depot_id, auth.uid(), NULL, p_amount, NULL, 0, 'movement');
END;
$$;
