-- =============================================================================
-- users.require_asset_tutorial(p_user_id, p_asset_id)
-- Depends on: api.assets, users.tutorial_lessons, users.lesson_progress
-- -----------------------------------------------------------------------------
-- Raises 42501 'Tutorial required: <path>' (HINT = path id) unless the user has
-- passed every lesson of the tutorial path that belongs to the asset's type:
--   stock -> aktien, fund -> grundlagen (the introduction; the ETF course etfs
--   is optional and advanced), bond -> anleihen, crypto -> krypto,
--   commodity -> rohstoffe.
-- ETFs open after the introduction; bonds, crypto and commodities follow the
-- stock course (tutorial_path_requires). Called by depots.buy_asset and
-- depots.upsert_savings_plan only: selling and already running savings plans
-- are never blocked, and neither are calls without a user (no auth.uid(), i.e.
-- internal/superuser use). Internal helper (no EXECUTE for clients).
-- Keep the mapping in sync with frontend lib/asset_tutorial.ts.
-- =============================================================================

CREATE OR REPLACE FUNCTION users.require_asset_tutorial(p_user_id uuid, p_asset_id bigint)
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_path text;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT CASE a.asset_type
           WHEN 'stock'     THEN 'aktien'
           WHEN 'fund'      THEN 'grundlagen'
           WHEN 'bond'      THEN 'anleihen'
           WHEN 'crypto'    THEN 'krypto'
           WHEN 'commodity' THEN 'rohstoffe'
         END
  INTO v_path
  FROM api.assets a
  WHERE a.id = p_asset_id;

  -- unknown asset: let the caller's own checks report it
  IF v_path IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users.tutorial_lessons l WHERE l.path_id = v_path)
     OR EXISTS (
       SELECT 1
       FROM users.tutorial_lessons l
       WHERE l.path_id = v_path
         AND NOT EXISTS (
           SELECT 1 FROM users.lesson_progress p
           WHERE p.user_id = p_user_id AND p.lesson_id = l.id
         )
     )
  THEN
    RAISE EXCEPTION 'Tutorial required: %', v_path
      USING ERRCODE = '42501', HINT = v_path;
  END IF;
END;
$$;
