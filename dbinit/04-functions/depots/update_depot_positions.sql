-- =============================================================================
-- depots.update_depot_positions()
-- Depends on: depots.positions, api.asset_prices
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.update_depot_positions () RETURNS VOID
LANGUAGE plpgsql -- Changed from SQL to plpgsql
AS $$
BEGIN
    WITH latest_prices AS (
        SELECT DISTINCT ON (asset_id)
            asset_id,
            tstamp,
            close,
            open
        FROM api.asset_prices
        ORDER BY asset_id, tstamp DESC
    )
    UPDATE depots.positions as dp
    SET
        price = COALESCE(latest_prices.close, latest_prices.open),
        worth = COALESCE(latest_prices.close, latest_prices.open) * amount,
        last = latest_prices.tstamp
    FROM latest_prices
    WHERE
        dp.last <= latest_prices.tstamp -- Changed comma to proper condition
        AND dp.asset_id = latest_prices.asset_id;  -- Use AND, not comma
END;
$$ ;
