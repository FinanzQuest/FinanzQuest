-- =============================================================================
-- depots.new_depot_for_user(p_user_id)
-- Depends on: depots.depots, users.has_any_role, users.is_superuser_session
-- -----------------------------------------------------------------------------
-- Creates a depot with the standard starting cash. Clients cannot insert into
-- depots.depots directly (they could pick their own cash_start); a user may
-- create a depot for themselves, admins/teachers for anyone.
-- =============================================================================

CREATE OR REPLACE FUNCTION depots.new_depot_for_user(p_user_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_depot_id bigint;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User id required' USING ERRCODE = '22023';
  END IF;
  IF NOT (p_user_id = auth.uid()
          OR users.has_any_role('admin', 'teacher')
          OR users.is_superuser_session()) THEN
    RAISE EXCEPTION 'Unauthorized: can only create a depot for yourself' USING ERRCODE = '42501';
  END IF;

  INSERT INTO depots.depots (created, cash, cash_start, users)
  VALUES (NOW(), 50000, 50000, ARRAY[p_user_id])
  RETURNING id INTO v_depot_id;

  RETURN v_depot_id;
END;
$$;
