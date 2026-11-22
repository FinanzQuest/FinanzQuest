-- =============================================================================
-- api.fund_holdings_linked
-- Depends on: api.fund_holdings, api.assets, pg_trgm (public.similarity)
-- -----------------------------------------------------------------------------
-- api.fund_holdings plus asset_id: the stock in api.assets this position
-- is, so the ETF page can link it. Matched, in this order of preference:
--   1. the same ticker, if the holding is a US listing or the names are
--      somewhat alike (Roche's "ROP" is not Roper Technologies' ROP)
--   2. the ticker plus an exchange suffix (SAP -> SAP.DE) with alike names
--   3. a very similar company name (Berkshire Hathaway -> 41B.F)
-- Only assets the updater has prices for. NULL: not in the database.
-- security_invoker: reads with the caller's rights (both tables public).
-- =============================================================================

CREATE OR REPLACE VIEW api.fund_holdings_linked
WITH (security_invoker = true) AS
SELECT h.*, m.asset_id
FROM api.fund_holdings h
LEFT JOIN LATERAL (
  SELECT a.id AS asset_id
  FROM api.assets a
  CROSS JOIN LATERAL (SELECT public.similarity(lower(a.name), lower(h.name)) AS sim) s
  WHERE a.asset_type = 'stock'
    AND a.price_provider IS NOT NULL
    AND (
         (a.symbol = h.ticker AND (h.country = 'US' OR s.sim >= 0.2))
      OR (h.ticker IS NOT NULL AND a.symbol LIKE h.ticker || '.%' AND s.sim >= 0.3)
      OR s.sim >= 0.6
    )
  ORDER BY (a.symbol = h.ticker) DESC,
           (a.symbol LIKE h.ticker || '.%') DESC,
           s.sim DESC,
           a.id
  LIMIT 1
) m ON true;
