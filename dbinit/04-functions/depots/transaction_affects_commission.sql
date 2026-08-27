-- =============================================================================
-- depots.transaction_affects_commission(t)
-- Depends on: depots.TransactionType (02-types/transaction_type.sql)
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.transaction_affects_commission(t depots.TransactionType)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT TRUE;
$$;
