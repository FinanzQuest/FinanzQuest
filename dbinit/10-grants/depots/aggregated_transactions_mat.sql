-- =============================================================================
-- Privileges on depots.aggregated_transactions_mat (materialized view)
-- -----------------------------------------------------------------------------
-- REVOKE, not GRANT: the matview holds every depot's running totals and RLS
-- cannot be enabled on materialized views, so direct SELECT by authenticated
-- would leak every depot's positions. depots.current_position_value reads it
-- under the view owner (postgres) and filters rows through is_depot_member.
--
-- This undoes the "GRANT SELECT ON ALL TABLES IN SCHEMA depots" from
-- 08-roles/authenticated.sql for this one relation; the schema-wide grant is
-- still applied first, so this file must run after it (it does — 10-grants).
-- =============================================================================

REVOKE SELECT ON depots.aggregated_transactions_mat FROM authenticated;
