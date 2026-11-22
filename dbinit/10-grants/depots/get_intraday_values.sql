-- =============================================================================
-- GRANTs targeting depots.get_intraday_values (function) — public totals,
-- like depots.values.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION depots.get_intraday_values(bigint, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION depots.get_intraday_values(bigint, timestamptz) TO anon, authenticated;
