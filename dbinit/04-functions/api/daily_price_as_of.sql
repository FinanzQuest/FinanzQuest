-- =============================================================================
-- api.daily_price_as_of(day)
-- -----------------------------------------------------------------------------
-- The instant a daily close counts as "as of" for api.latest_prices: the end
-- of its (UTC) day, but never later than now() — a partial bar for today
-- (api.rollup_intraday) must not outrank the next 15-minute bar.
-- =============================================================================

CREATE OR REPLACE FUNCTION api.daily_price_as_of(p_day date)
RETURNS timestamptz
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT LEAST(((p_day + 1)::timestamp AT TIME ZONE 'UTC'), now());
$$;
