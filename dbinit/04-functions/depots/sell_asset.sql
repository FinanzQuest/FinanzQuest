-- =============================================================================
-- depots.sell_asset(p_asset_id, p_depot_id, p_worth)
-- Depends on: api.latest_prices, depots.depots, depots.holdings,
--             depots.transactions, depots.is_depot_member,
--             config.commission (11-config/config.sql)
-- -----------------------------------------------------------------------------
-- Sells p_worth of a position at the latest price, capped at the position's
-- market value. Selling the whole position sells exactly the held amount, so
-- no fractional dust is left behind.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.sell_asset(
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
  v_held       numeric;
  v_price      numeric;
  v_amount     numeric;
BEGIN
  IF p_worth IS NULL OR p_worth <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive' USING ERRCODE = '22023';
  END IF;
  IF NOT depots.is_depot_member(p_depot_id) THEN
    RAISE EXCEPTION 'Not a member of depot %', p_depot_id USING ERRCODE = '42501';
  END IF;

  PERFORM 1 FROM depots.depots d WHERE d.id = p_depot_id FOR NO KEY UPDATE;

  SELECT h.amount INTO v_held
  FROM depots.holdings h
  WHERE h.depot_id = p_depot_id AND h.asset_id = p_asset_id;
  IF v_held IS NULL OR v_held <= 0 THEN
    RAISE EXCEPTION 'No position for depot % on asset % found', p_depot_id, p_asset_id;
  END IF;

  SELECT lp.close INTO v_price FROM api.latest_prices lp WHERE lp.asset_id = p_asset_id;
  IF v_price IS NULL OR v_price <= 0 THEN
    RAISE EXCEPTION 'No price found for asset %', p_asset_id;
  END IF;

  v_amount := CASE WHEN p_worth >= v_held * v_price THEN v_held ELSE p_worth / v_price END;

  INSERT INTO depots.transactions (depot_id, user_id, asset_id, amount, price, commission, type)
  VALUES (p_depot_id, auth.uid(), p_asset_id, -v_amount, v_price, v_commission, 'user');
END;
$$;
