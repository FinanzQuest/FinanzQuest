-- =============================================================================
-- depots.on_transactions_change()  — statement-level trigger function
-- Depends on: depots.apply_ledger_delta, depots.rebuild_depot_values_for
--             (04-functions/depots/), depots.holdings, depots.transactions
-- Triggers: 07-triggers/depots/transactions_ledger.sql (one per event, each
--           with transition tables new_rows / old_rows)
-- -----------------------------------------------------------------------------
-- Keeps the derived state in step with the ledger, once per statement:
--   1. depots.holdings  += new rows, -= old rows (every change; cheap)
--   2. holdings rows whose transactions are all gone are removed
--   3. if any touched row lies before today, depots.daily_values is rebuilt
--      for that depot from the earliest touched day (normal trades are dated
--      now(), so this step is skipped on the hot path)
--
-- SECURITY DEFINER: clients (buy_asset/sell_asset run as authenticated) cannot
-- write holdings/daily_values themselves.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.on_transactions_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = depots, pg_temp
AS $$
DECLARE
  v_old   depots.transactions[] := '{}';
  v_new   depots.transactions[] := '{}';
  v_ids   bigint[];
  v_froms date[];
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    SELECT COALESCE(array_agg(o), '{}') INTO v_old FROM old_rows o;
    PERFORM depots.apply_ledger_delta(v_old, -1);
  END IF;

  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    SELECT COALESCE(array_agg(n), '{}') INTO v_new FROM new_rows n;
    PERFORM depots.apply_ledger_delta(v_new, 1);
  END IF;

  IF TG_OP <> 'INSERT' THEN
    DELETE FROM depots.holdings h
    USING (SELECT DISTINCT depot_id, asset_id FROM unnest(v_old)) c
    WHERE h.depot_id = c.depot_id
      AND h.asset_id IS NOT DISTINCT FROM c.asset_id
      AND NOT EXISTS (
        SELECT 1 FROM depots.transactions t
        WHERE t.depot_id = c.depot_id
          AND t.asset_id IS NOT DISTINCT FROM c.asset_id
      );
  END IF;

  SELECT array_agg(s.depot_id), array_agg(s.from_day)
  INTO v_ids, v_froms
  FROM (
    SELECT r.depot_id, MIN(r.tstamp::date) AS from_day
    FROM unnest(v_old || v_new) AS r
    WHERE r.tstamp::date < CURRENT_DATE
    GROUP BY r.depot_id
  ) s;

  IF v_ids IS NOT NULL THEN
    PERFORM depots.rebuild_depot_values_for(v_ids, v_froms);
  END IF;

  RETURN NULL;
END;
$$;
