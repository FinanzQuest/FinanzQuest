-- =============================================================================
-- api.asset_facets()
-- Depends on: api.assets, api.asset_details, api.funds
-- -----------------------------------------------------------------------------
-- The filter options of the search page with the number of assets each:
-- facet asset_type | sector | country | issuer | index | distribution.
-- SQL, STABLE, SECURITY INVOKER.
-- =============================================================================

CREATE OR REPLACE FUNCTION api.asset_facets()
RETURNS TABLE (facet text, value text, assets bigint)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT 'asset_type', a.asset_type::text, count(*) FROM api.assets a GROUP BY 2
  UNION ALL
  SELECT 'sector', d.sector, count(*) FROM api.asset_details d WHERE d.sector IS NOT NULL GROUP BY 2
  UNION ALL
  SELECT 'country', d.country::text, count(*) FROM api.asset_details d WHERE d.country IS NOT NULL GROUP BY 2
  UNION ALL
  SELECT 'issuer', f.issuer, count(*) FROM api.assets a JOIN api.funds f ON f.id = a.fund_id GROUP BY 2
  UNION ALL
  SELECT 'index', f.index_name, count(*) FROM api.assets a JOIN api.funds f ON f.id = a.fund_id
  WHERE f.index_name IS NOT NULL GROUP BY 2
  UNION ALL
  SELECT 'distribution', f.distribution, count(*) FROM api.assets a JOIN api.funds f ON f.id = a.fund_id
  WHERE f.distribution IS NOT NULL GROUP BY 2
  ORDER BY 1, 3 DESC, 2;
$$;
