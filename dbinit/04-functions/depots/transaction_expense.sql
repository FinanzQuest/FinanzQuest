-- =============================================================================
-- depots.transaction_expense(t, amount, price)
-- Depends on: depots.TransactionType (02-types/transaction_type.sql)
-- -----------------------------------------------------------------------------
-- Cash "expense" of a transaction, from the depot's point of view.
-- Positive = cash leaves the depot, negative = cash enters it.
-- This is the single place where money semantics per type are defined.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.transaction_expense(
  t      depots.TransactionType,
  amount numeric,
  price  numeric
) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE t
    WHEN 'user'         THEN amount * price  -- buy: cash out, sell: cash in
    WHEN 'savings_plan' THEN 0::numeric      -- externally funded (budget -> asset)
    WHEN 'movement'     THEN -amount         -- deposit +100 -> cash +100
  END;
$$;
