-- =============================================================================
-- depots.is_depot_member(depot_id)
-- Depends on: depots.depots, auth.uid() (auth schema, created by GoTrue)
-- Used by most depots.* RLS policies (09-policies/).
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.is_depot_member (depot_id bigint)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM depots.depots
    WHERE id = depot_id
    AND auth.uid()::uuid = ANY(users)
  );
$$ ;
