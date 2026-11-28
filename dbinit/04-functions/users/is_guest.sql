-- =============================================================================
-- users.is_guest(p_user_id)
-- Depends on: auth.users (auth schema, created by GoTrue)
-- -----------------------------------------------------------------------------
-- TRUE if the user is a guest (GoTrue anonymous sign-in). FALSE for unknown ids.
-- Internal helper (takes any user id): no client EXECUTE.
-- =============================================================================

CREATE OR REPLACE FUNCTION users.is_guest(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE((SELECT u.is_anonymous FROM auth.users u WHERE u.id = p_user_id), false);
$$;
