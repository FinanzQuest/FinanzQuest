-- =============================================================================
-- MIGRATION 2026-12-12: e-mail verification
-- -----------------------------------------------------------------------------
-- Run from the repository root as the migration superuser:
--
--     psql -d postgres -f dbinit/migrations/2026-12-12_email_verification.sql
--
-- users.cleanup_guests now counts auth.users.email_change_sent_at as activity,
-- so a guest who started the upgrade (confirmation mail sent) is not deleted
-- before the link is clicked. GoTrue settings: see compose.core.yml, docs/email.md.
-- Re-runnable.
-- =============================================================================

\set ON_ERROR_STOP on
BEGIN;

\ir ../04-functions/users/cleanup_guests.sql
\ir ../10-grants/users/cleanup_guests.sql

COMMIT;
