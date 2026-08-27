-- =============================================================================
-- depots.buy_asset_at(p_asset_id, p_depot_id, p_worth, p_at)
-- Depends on: api.asset_prices, depots.depots, depots.positions,
--             depots.transactions,
--             config.commission setting (11-config/config.sql)
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.buy_asset_at (
    p_asset_id BIGINT,
    p_depot_id BIGINT,
    p_worth REAL,
    p_at TIMESTAMPTZ
) RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    price REAL;
    price_tstamp DATE;
    asset_amount REAL;
    total_cost REAL;
    depot_cash REAL;
    commission REAL;
BEGIN
    -- Get commission from configuration
    commission := current_setting('config.commission')::REAL;

    -- Find the asset's closest price to p_at
    SELECT COALESCE(prices.close, prices.open), prices.tstamp
    INTO price, price_tstamp
    FROM api.asset_prices AS prices
    WHERE prices.asset_id = p_asset_id
      AND prices.tstamp <= p_at
    ORDER BY prices.tstamp DESC
    LIMIT 1;
    -- Check if price was found
    IF price IS NULL THEN
        RAISE EXCEPTION 'No price found for asset_id % near %', p_asset_id, p_at;
    END IF;

    asset_amount := p_worth / price;
    total_cost := p_worth + commission;

    -- Verify that the depot has enough cash
    SELECT d.cash
    INTO depot_cash
    FROM depots.depots d
    WHERE d.id = p_depot_id;

    -- Check if depot exists
    IF depot_cash IS NULL THEN
        RAISE EXCEPTION 'Depot with id % not found', p_depot_id;
    END IF;

    IF depot_cash < total_cost THEN
        RAISE EXCEPTION 'Insufficient cash in depot. Required: %, Available: %', total_cost, depot_cash;
    END IF;

    -- Subtract the cash
    UPDATE depots.depots
    SET cash = cash - total_cost
    WHERE id = p_depot_id;

    -- Buy/update position
    INSERT INTO depots.positions (depot_id, asset_id, price, amount, worth, last)
    VALUES (p_depot_id, p_asset_id, price, asset_amount, p_worth, price_tstamp)
    ON CONFLICT (depot_id, asset_id) DO UPDATE
    SET
        amount = positions.amount + EXCLUDED.amount,
        worth = positions.worth + EXCLUDED.worth,
        price = EXCLUDED.price,
        last = EXCLUDED.last;

    INSERT INTO depots.transactions (asset_id, depot_id, amount, price, tstamp, commission )
    VALUES (p_asset_id, p_depot_id, asset_amount, price, price_tstamp, commission);
END;
$$;
