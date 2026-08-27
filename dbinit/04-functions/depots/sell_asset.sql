-- =============================================================================
-- depots.sell_asset(p_asset_id, p_depot_id, p_worth)
-- Depends on: api.asset_prices, depots.positions, depots.depots,
--             depots.log_transaction (04-functions/depots/log_transaction.sql),
--             config.commission setting (11-config/config.sql)
-- -----------------------------------------------------------------------------
-- NOTE: calls log_transaction unqualified (relies on search_path) — see
-- flagged issues.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.sell_asset (
p_asset_id BIGINT,
p_depot_id BIGINT,
p_worth REAL
) RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    price REAL;
    price_tstamp DATE;
    asset_amount REAL;
    total_profit REAL;
    possessed_worth REAL;
    commission REAL;
    worth_to_sell REAL;
BEGIN
    -- Get commission from configuration
    commission := current_setting('config.commission')::REAL;

    -- Find the asset's current price
    SELECT COALESCE(prices.close, prices.open), prices.tstamp
    FROM api.asset_prices AS prices
    WHERE prices.asset_id = p_asset_id
    ORDER BY prices.tstamp DESC
    LIMIT 1
    INTO price, price_tstamp;

    -- Check if price was found
    IF price IS NULL THEN
        RAISE EXCEPTION 'No price found for asset %', p_asset_id;
    END IF;

    -- Verify that the depot has enough cash
    SELECT dp.worth
    FROM depots.positions AS dp
    WHERE dp.depot_id = p_depot_id AND dp.asset_id = p_asset_id
    INTO possessed_worth;

    -- Check if depot exists
    IF possessed_worth IS NULL THEN
        RAISE EXCEPTION 'No position for depot % on asset % found', p_depot_id, p_asset_id;
    END IF;

    worth_to_sell := LEAST(possessed_worth, p_worth);

    asset_amount := worth_to_sell / price;
    total_profit := worth_to_sell - commission;

    -- add the cash
    UPDATE depots.depots
    SET cash = cash + total_profit
    WHERE id = p_depot_id;

    IF possessed_worth = worth_to_sell THEN
        DELETE FROM depots.positions
        WHERE
            asset_id = p_asset_id AND
            depot_id = p_depot_id;
    ELSE
        UPDATE depots.positions
        SET
            amount = amount - asset_amount,
            worth = worth - worth_to_sell
        WHERE
            asset_id = p_asset_id AND
            depot_id = p_depot_id;
    END IF;


    PERFORM log_transaction (p_asset_id, p_depot_id, - asset_amount, price, commission);
END;
$$ ;
