-- =============================================================================
-- GRANTs targeting api.funds
-- The updater only refreshes the fetched columns; funds are added by hand.
-- =============================================================================

GRANT SELECT ON api.funds TO anon, authenticated;

GRANT SELECT, UPDATE (ter, inception, fund_size, holdings_count, details_as_of, details_updated_at)
  ON api.funds TO service_worker;
