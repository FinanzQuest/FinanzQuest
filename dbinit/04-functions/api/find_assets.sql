-- =============================================================================
-- api.find_assets(...)
-- Depends on: api.assets, api.asset_stats, api.asset_details, api.funds,
--             pg_trgm (public.similarity, operator public.%)
-- -----------------------------------------------------------------------------
-- The search page: text search (as api.search_assets) combined with filters
-- and a sort order, one page of results with everything a result row shows
-- (key figures, sparkline) and the total number of matches.
--   p_query        text; NULL/empty: all assets
--   p_types        asset types (AssetType[]); NULL: all
--   p_sectors      api.asset_details.sector values (stocks)
--   p_countries    api.asset_details.country codes (stocks)
--   p_issuers      api.funds.issuer values (ETFs)
--   p_indexes      api.funds.index_name values (ETFs)
--   p_distribution 'accumulating' | 'distributing' (ETFs)
--   p_sort         relevance | name | return_3m | return_1y | cagr_5y |
--                  market_cap | fund_size | ter | dividend_yield
--                  (unknown values sort by relevance)
--   p_descending   NULL: the natural direction (name and ter ascending,
--                  everything else descending); missing values come last
-- Empty arrays count as "no filter". SQL, STABLE, SECURITY INVOKER (reads
-- public tables only).
-- =============================================================================

CREATE OR REPLACE FUNCTION api.find_assets(
  p_query        text      DEFAULT NULL,
  p_types        AssetType[] DEFAULT NULL,
  p_sectors      text[]    DEFAULT NULL,
  p_countries    text[]    DEFAULT NULL,
  p_issuers      text[]    DEFAULT NULL,
  p_indexes      text[]    DEFAULT NULL,
  p_distribution text      DEFAULT NULL,
  p_sort         text      DEFAULT 'relevance',
  p_descending   boolean   DEFAULT NULL,
  p_limit        integer   DEFAULT 50,
  p_offset       integer   DEFAULT 0
)
RETURNS TABLE (
  id             bigint,
  symbol         text,
  name           text,
  description    text,
  asset_type     AssetType,
  sector         text,
  industry       text,
  country        text,
  issuer         text,
  index_name     text,
  distribution   text,
  ter            numeric,
  fund_size      numeric,
  fund_currency  text,
  market_cap     numeric,
  currency       text,
  dividend_yield numeric,
  last_close     double precision,
  return_3m      double precision,
  return_1y      double precision,
  cagr_5y        double precision,
  sparkline      double precision[],
  relevance      numeric,
  total_count    bigint
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  WITH params AS (
    SELECT nullif(btrim(p_query), '') AS q,
           coalesce(p_descending, p_sort NOT IN ('name', 'ter')) AS descending,
           least(greatest(coalesce(p_limit, 50), 1), 200) AS lim,
           greatest(coalesce(p_offset, 0), 0) AS off
  ),
  rows AS (
    SELECT a.id, a.symbol, a.name, a.description, a.asset_type,
           d.sector, d.industry, d.country::text AS country,
           f.issuer, f.index_name, f.distribution, f.ter, f.fund_size, f.currency::text AS fund_currency,
           d.market_cap, d.currency::text AS currency, d.dividend_yield,
           s.last_close, s.return_3m, s.return_1y, s.cagr_5y, s.sparkline,
           CASE WHEN pr.q IS NULL THEN 0 ELSE round((
               CASE WHEN lower(a.symbol) = lower(pr.q) THEN 100
                    WHEN lower(a.name)   = lower(pr.q) THEN 95 ELSE 0 END
             + CASE WHEN lower(a.symbol) LIKE lower(pr.q) || '%' THEN 50
                    WHEN lower(a.name)   LIKE lower(pr.q) || '%' THEN 45 ELSE 0 END
             + public.similarity(a.symbol, pr.q) * 40
             + public.similarity(a.name, pr.q) * 35
             + coalesce(public.similarity(a.description, pr.q) * 15, 0)
             + CASE WHEN lower(a.symbol) LIKE '%' || lower(pr.q) || '%' THEN 10
                    WHEN lower(a.name)   LIKE '%' || lower(pr.q) || '%' THEN 8 ELSE 0 END
           )::numeric, 2) END AS relevance
    FROM api.assets a
    CROSS JOIN params pr
    LEFT JOIN api.asset_stats   s ON s.asset_id = a.id
    LEFT JOIN api.asset_details d ON d.asset_id = a.id
    LEFT JOIN api.funds         f ON f.id = a.fund_id
    WHERE (pr.q IS NULL
           OR a.symbol OPERATOR(public.%) pr.q
           OR a.name OPERATOR(public.%) pr.q
           OR a.description OPERATOR(public.%) pr.q
           OR lower(a.symbol) LIKE '%' || lower(pr.q) || '%'
           OR lower(a.name) LIKE '%' || lower(pr.q) || '%'
           OR lower(a.description) LIKE '%' || lower(pr.q) || '%')
      AND (coalesce(cardinality(p_types), 0) = 0 OR a.asset_type = ANY (p_types))
      AND (coalesce(cardinality(p_sectors), 0) = 0 OR d.sector = ANY (p_sectors))
      AND (coalesce(cardinality(p_countries), 0) = 0 OR d.country::text = ANY (p_countries))
      AND (coalesce(cardinality(p_issuers), 0) = 0 OR f.issuer = ANY (p_issuers))
      AND (coalesce(cardinality(p_indexes), 0) = 0 OR f.index_name = ANY (p_indexes))
      AND (p_distribution IS NULL OR f.distribution = p_distribution)
  ),
  keyed AS (
    SELECT r.*, CASE p_sort
        WHEN 'return_3m'      THEN r.return_3m
        WHEN 'return_1y'      THEN r.return_1y
        WHEN 'cagr_5y'        THEN r.cagr_5y
        WHEN 'market_cap'     THEN r.market_cap::double precision
        WHEN 'fund_size'      THEN r.fund_size::double precision
        WHEN 'ter'            THEN r.ter::double precision
        WHEN 'dividend_yield' THEN r.dividend_yield::double precision
        WHEN 'name'           THEN NULL
        ELSE r.relevance::double precision
      END AS sort_key
    FROM rows r
  )
  SELECT k.id, k.symbol, k.name, k.description, k.asset_type, k.sector, k.industry, k.country,
         k.issuer, k.index_name, k.distribution, k.ter, k.fund_size, k.fund_currency,
         k.market_cap, k.currency, k.dividend_yield,
         k.last_close, k.return_3m, k.return_1y, k.cagr_5y, k.sparkline, k.relevance,
         count(*) OVER () AS total_count
  FROM keyed k, params pr
  ORDER BY
    CASE WHEN pr.descending THEN k.sort_key END DESC NULLS LAST,
    CASE WHEN NOT pr.descending THEN k.sort_key END ASC NULLS LAST,
    CASE WHEN p_sort = 'name' AND NOT pr.descending THEN k.name END ASC,
    CASE WHEN p_sort = 'name' AND pr.descending THEN k.name END DESC,
    k.relevance DESC,
    k.name ASC,
    k.id
  LIMIT (SELECT lim FROM params) OFFSET (SELECT off FROM params);
$$;
