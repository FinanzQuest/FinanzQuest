-- =============================================================================
-- depots.buy_asset(p_asset_id, p_depot_id, p_worth)
-- Depends on: api.latest_prices, depots.depots, depots.transactions,
--             depots.is_depot_member, users.require_asset_tutorial,
--             config.commission (11-config/config.sql)
-- -----------------------------------------------------------------------------
-- Buys p_worth (virtual money) of an asset at its latest price. The only way
-- for a client to add a 'user' transaction: the ledger is not writable by
-- clients, so price, amount and commission are always set here.
-- The asset's tutorial path must be passed first (users.require_asset_tutorial).
-- Locks the depot row first, so the cash check and the trigger's cash update
-- are race-free (two concurrent buys cannot both spend the same cash).
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.buy_asset(
  p_asset_id bigint,
  p_depot_id bigint,
  p_worth    numeric
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_commission numeric := current_setting('config.commission')::numeric;
  v_cash       numeric;
  v_price      numeric;
BEGIN
  IF p_worth IS NULL OR p_worth <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive' USING ERRCODE = '22023';
  END IF;
  IF NOT depots.is_depot_member(p_depot_id) THEN
    RAISE EXCEPTION 'Not a member of depot %', p_depot_id USING ERRCODE = '42501';
  END IF;

  PERFORM users.require_asset_tutorial(auth.uid(), p_asset_id);

  SELECT d.cash INTO v_cash FROM depots.depots d WHERE d.id = p_depot_id FOR NO KEY UPDATE;
  IF v_cash IS NULL THEN
    RAISE EXCEPTION 'Depot with id % not found', p_depot_id;
  END IF;

  SELECT lp.close INTO v_price FROM api.latest_prices lp WHERE lp.asset_id = p_asset_id;
  IF v_price IS NULL OR v_price <= 0 THEN
    RAISE EXCEPTION 'No price found for asset_id %', p_asset_id;
  END IF;

  IF v_cash < p_worth + v_commission THEN
    RAISE EXCEPTION 'Insufficient cash in depot. Required: %, Available: %',
      p_worth + v_commission, round(v_cash, 2);
  END IF;

  INSERT INTO depots.transactions (depot_id, user_id, asset_id, amount, price, commission, type)
  VALUES (p_depot_id, auth.uid(), p_asset_id, p_worth / v_price, v_price, v_commission, 'user');
END;
$$;
