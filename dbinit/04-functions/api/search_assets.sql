-- =============================================================================
-- api.search_assets(search_query, asset_type_filter, result_limit)
-- Depends on: api.assets, pg_trgm extension (01-schema/extensions.sql)
-- -----------------------------------------------------------------------------
-- Fuzzy search with trigram scoring
-- =============================================================================

CREATE OR REPLACE FUNCTION api.search_assets(
  search_query      text,
  asset_type_filter text    DEFAULT NULL,
  result_limit      integer DEFAULT 20
)
RETURNS TABLE (
  id             bigint,
  symbol         text,
  name           text,
  description    text,
  asset_type     text,
  last_updated   date,
  relevance_score numeric
)
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.symbol,
    a.name,
    a.description,
    a.asset_type::text,
    a.last_updated,
    ROUND(CAST(
      CASE WHEN LOWER(a.symbol) = LOWER(search_query) THEN 100
           WHEN LOWER(a.name)   = LOWER(search_query) THEN 95
           ELSE 0 END
      + CASE WHEN LOWER(a.symbol) LIKE LOWER(search_query) || '%' THEN 50
             WHEN LOWER(a.name)   LIKE LOWER(search_query) || '%' THEN 45
             ELSE 0 END
      + similarity(a.symbol, search_query) * 40
      + similarity(a.name,   search_query) * 35
      + COALESCE(similarity(a.description, search_query) * 15, 0)
      + CASE WHEN LOWER(a.symbol) LIKE '%' || LOWER(search_query) || '%' THEN 10
             WHEN LOWER(a.name)   LIKE '%' || LOWER(search_query) || '%' THEN 8
             ELSE 0 END
    AS numeric), 2) AS relevance_score
  FROM api.assets a
  WHERE (
    a.symbol      % search_query OR
    a.name        % search_query OR
    a.description % search_query OR
    LOWER(a.symbol)      LIKE '%' || LOWER(search_query) || '%' OR
    LOWER(a.name)        LIKE '%' || LOWER(search_query) || '%' OR
    LOWER(a.description) LIKE '%' || LOWER(search_query) || '%'
  )
  AND (asset_type_filter IS NULL OR a.asset_type::text = asset_type_filter)
  ORDER BY relevance_score DESC, a.name ASC
  LIMIT result_limit;
END;
$$;
