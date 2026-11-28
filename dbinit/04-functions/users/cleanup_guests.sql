-- =============================================================================
-- PROCEDURE users.cleanup_guests(job_id, config)
-- Depends on: auth.users, auth.sessions, auth.refresh_tokens (GoTrue), depots.depots
-- -----------------------------------------------------------------------------
-- TimescaleDB job (12-jobs/cleanup_guests.sql). Deletes stale guests: anonymous
-- users whose last activity (newest session / refresh token update, else last sign-in, else
-- creation) is older than config->>'days' days (default 30), together with
-- their depots. depots.depots.users is a uuid[] without FK, so depots whose
-- members are all stale guests are deleted explicitly (holdings, transactions,
-- daily_values, savings plans cascade from the depot); the stale ids are
-- removed from depots that keep other members. Everything keyed on
-- auth.users (special_roles, lesson_*, learner_stats, GoTrue sessions and
-- identities) cascades from the user row.
-- =============================================================================

CREATE OR REPLACE PROCEDURE users.cleanup_guests(job_id int, config jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_days  int := COALESCE((config->>'days')::int, 30);
  v_stale uuid[];
BEGIN
  SELECT COALESCE(array_agg(u.id), '{}') INTO v_stale
  FROM auth.users u
  WHERE u.is_anonymous
    AND COALESCE(
          GREATEST(
            (SELECT max(s.updated_at) FROM auth.sessions s WHERE s.user_id = u.id),
            (SELECT max(r.updated_at) FROM auth.refresh_tokens r WHERE r.user_id = u.id::text)
          ),
          u.last_sign_in_at,
          u.created_at
        ) < now() - make_interval(days => v_days);

  IF cardinality(v_stale) = 0 THEN
    RETURN;
  END IF;

  DELETE FROM depots.depots d WHERE d.users <@ v_stale;
  -- shared depots that keep a non-stale member: drop the dangling guest ids
  UPDATE depots.depots d
  SET users = ARRAY(SELECT m FROM unnest(d.users) AS m WHERE m <> ALL (v_stale))
  WHERE d.users && v_stale;
  DELETE FROM auth.users u WHERE u.id = ANY(v_stale);
END;
$$;
