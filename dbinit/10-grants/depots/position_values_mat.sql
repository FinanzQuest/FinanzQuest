-- =============================================================================
-- Privileges on depots.position_values_mat (materialized view)
-- -----------------------------------------------------------------------------
-- REVOKE, not GRANT — same rationale as depots.aggregated_transactions_mat:
-- the matview holds every depot's daily per-position values and RLS cannot be
-- enabled on materialized views, so direct SELECT by authenticated would leak
-- all depots' positions. depots.position_values_with_curr reads it under the
-- view owner (postgres) and filters rows through is_depot_member.
--
-- Undoes the "GRANT SELECT ON ALL TABLES IN SCHEMA depots" from
-- 08-roles/authenticated.sql for this one relation; the schema-wide grant is
-- still applied first, so this file must run after it (it does — 10-grants).
-- =============================================================================

REVOKE SELECT ON depots.position_values_mat FROM authenticated;
