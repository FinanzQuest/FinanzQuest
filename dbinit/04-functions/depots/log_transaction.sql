-- =============================================================================
-- depots.log_transaction(p_asset_id, p_depot_id, p_amount, p_price, p_commission)
-- Depends on: depots.transactions
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.log_transaction (p_asset_id BIGINT,
p_depot_id BIGINT,
p_amount REAL,
p_price REAL,
p_commission REAL) RETURNS VOID
LANGUAGE plpgsql AS $$
    BEGIN
        INSERT INTO depots.transactions (asset_id, depot_id, amount, price, tstamp, commission )
        VALUES (p_asset_id, p_depot_id, p_amount, p_price, NOW(), p_commission);
    END;
$$ ;
