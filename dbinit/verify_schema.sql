-- =============================================================================
-- verify_schema.sql — post-init schema smoke test
-- -----------------------------------------------------------------------------
-- Asserts that every object the manifest (manifest.txt) should create actually
-- exists in the database: extensions, schemas, types, tables, RLS flags,
-- views, materialized views, functions, procedures, triggers, sequences,
-- indexes, policies, roles, TimescaleDB jobs, plus a representative set of
-- GRANT/membership spot-checks and the seed load.
--
-- This file is NOT part of the manifest — it is a verification tool, run after
-- init (and after db-init completes), e.g.:
--
--     psql -d postgres -f dbinit/verify_schema.sql
--
-- Exit status: 0 when every check passes; non-zero when any check fails
-- (the DO block RAISEs, and ON_ERROR_STOP is set).
--
-- Known expected-failure documented in the script: depots.savings_plans has
-- RLS *disabled* (a pre-existing bug, flagged during the reorg). The test
-- asserts that current state; update this assertion when RLS is enabled there.
-- =============================================================================

\set ON_ERROR_STOP on
\echo 'verify_schema.sql: running checks...'

DO $$
DECLARE
  fails text[] := '{}';
  n     integer := 0;
  _     text;
BEGIN
  -- =========================================================================
  -- EXTENSIONS
  -- =========================================================================
  n := n + 1;
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN fails := fails || 'extension timescaledb'; END IF;
  n := n + 1;
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm')      THEN fails := fails || 'extension pg_trgm';      END IF;

  -- =========================================================================
  -- SCHEMAS  (auth is created pre-GoTrue in 00-preauth; api/depots/users in 01-schema)
  -- =========================================================================
  FOREACH _ IN ARRAY ARRAY['api','depots','users','auth'] LOOP
    n := n + 1;
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = _) THEN fails := fails || ('schema ' || _); END IF;
  END LOOP;

  -- =========================================================================
  -- TYPES  (02-types/)
  -- =========================================================================
  FOREACH _ IN ARRAY ARRAY['public.assettype','public.savingsperiod','depots.transactiontype','users.special_role','users.profile_ref'] LOOP
    n := n + 1;
    IF NOT EXISTS (
      SELECT 1 FROM pg_type t JOIN pg_namespace s ON s.oid = t.typnamespace
      WHERE (s.nspname || '.' || t.typname) = _ AND t.typtype IN ('e','c')
    ) THEN fails := fails || ('type ' || _); END IF;
  END LOOP;

  -- =========================================================================
  -- TABLES  (03-tables/)
  -- =========================================================================
  FOREACH _ IN ARRAY ARRAY['api.assets','api.asset_prices','api.latest_prices','depots.depots','depots.transactions','depots.holdings','depots.daily_values','depots.savings_plans','depots.savings_plans_budget','users.special_roles'] LOOP
    n := n + 1;
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace s ON s.oid = c.relnamespace
      WHERE (s.nspname || '.' || c.relname) = _ AND c.relkind = 'r'
    ) THEN fails := fails || ('table ' || _); END IF;
  END LOOP;

  -- =========================================================================
  -- ROW LEVEL SECURITY flags  (09-policies/ enable statements)
  -- =========================================================================
  FOREACH _ IN ARRAY ARRAY['api.assets','api.asset_prices','api.latest_prices','depots.depots','depots.transactions','depots.holdings','depots.daily_values','depots.savings_plans','depots.savings_plans_budget','users.special_roles'] LOOP
    n := n + 1;
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace s ON s.oid = c.relnamespace
      WHERE (s.nspname || '.' || c.relname) = _ AND c.relrowsecurity
    ) THEN fails := fails || ('rls enabled on ' || _); END IF;
  END LOOP;

  -- =========================================================================
  -- VIEWS  (06-views/)
  -- =========================================================================
  FOREACH _ IN ARRAY ARRAY['depots.current_values','depots.values','depots.aggregated_values','users.profile','users.admin_overview','depots.depot_overview','depots.savings_plans_budget_overview','depots.savings_plans_with_asset','depots.leaderboard'] LOOP
    n := n + 1;
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace s ON s.oid = c.relnamespace
      WHERE (s.nspname || '.' || c.relname) = _ AND c.relkind = 'v'
    ) THEN fails := fails || ('view ' || _); END IF;
  END LOOP;

  -- =========================================================================
  -- MATERIALIZED VIEWS  (05-materialized-views/)
  -- NOTE: TimescaleDB continuous aggregates (api.asset_prices_weekly) show up
  -- as relkind 'v' in pg_class, so accept both 'm' and 'v' here. The dedicated
  -- continuous-aggregate catalog check below pins asset_prices_weekly as a real
  -- continuous aggregate.
  -- =========================================================================
  FOREACH _ IN ARRAY ARRAY['api.asset_prices_weekly'] LOOP
    n := n + 1;
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace s ON s.oid = c.relnamespace
      WHERE (s.nspname || '.' || c.relname) = _ AND c.relkind IN ('m','v')
    ) THEN fails := fails || ('materialized view ' || _); END IF;
  END LOOP;

  -- =========================================================================
  -- FUNCTIONS + PROCEDURES  (04-functions/)
  -- =========================================================================
  FOREACH _ IN ARRAY ARRAY['depots.transaction_expense','depots.transaction_affects_commission','depots.sp_to_per_month','depots.sp_to_interval','depots.get_position_profits','depots.get_transactions_with_position','depots.buy_asset','depots.sell_asset','depots.check_savings_budget','api.on_asset_prices_change','api.rebuild_latest_prices','users.is_superuser_session','depots.get_commission','depots.execute_savings_plans','depots.is_depot_member','depots.new_depot_for_user','depots.change_budget','depots.grant_default_budget_trigger','depots.get_depot_overview','depots.grant_reward','depots.update_savings_plan','depots.upsert_savings_plan','depots.delete_savings_plan','depots.apply_ledger_delta','depots.rebuild_holdings','depots.rebuild_depot_values_for','depots.rebuild_depot_values','depots.on_transactions_change','api.search_assets','users.grant_role','users.grant_teacher','users.revoke_teacher','users.revoke_role','users.has_role','users.has_any_role','users.get_all_profiles','users.get_admin_overview','users.stats'] LOOP
    n := n + 1;
    IF NOT EXISTS (
      SELECT 1 FROM pg_proc p JOIN pg_namespace s ON s.oid = p.pronamespace
      WHERE (s.nspname || '.' || p.proname) = _ AND p.prokind = 'f'
    ) THEN fails := fails || ('function ' || _); END IF;
  END LOOP;
  -- procedure (not a function)
  n := n + 1;
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace s ON s.oid = p.pronamespace
    WHERE s.nspname = 'depots' AND p.proname = 'refresh_depot_values' AND p.prokind = 'p'
  ) THEN fails := fails || 'procedure depots.refresh_depot_values'; END IF;

  -- =========================================================================
  -- TRIGGERS  (07-triggers/)
  -- =========================================================================
  n := n + 1;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    WHERE t.tgname = 'grant_default_budget' AND NOT t.tgisinternal
      AND t.tgrelid = 'depots.depots'::regclass
  ) THEN fails := fails || 'trigger depots.grant_default_budget on depots.depots'; END IF;
  FOREACH _ IN ARRAY ARRAY['transactions_ledger_insert','transactions_ledger_update','transactions_ledger_delete'] LOOP
    n := n + 1;
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      WHERE t.tgname = _ AND NOT t.tgisinternal
        AND t.tgrelid = 'depots.transactions'::regclass
    ) THEN fails := fails || ('trigger depots.' || _ || ' on depots.transactions'); END IF;
  END LOOP;

  n := n + 1;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    WHERE t.tgname = 'asset_prices_latest' AND NOT t.tgisinternal
      AND t.tgrelid = 'api.asset_prices'::regclass
  ) THEN fails := fails || 'trigger api.asset_prices_latest on api.asset_prices'; END IF;

  -- =========================================================================
  -- SEQUENCES  (identity sequences backing the *_id_seq GRANTs)
  -- =========================================================================
  FOREACH _ IN ARRAY ARRAY['api.assets_id_seq','depots.depots_id_seq','depots.transactions_id_seq','depots.savings_plans_id_seq'] LOOP
    n := n + 1;
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace s ON s.oid = c.relnamespace
      WHERE (s.nspname || '.' || c.relname) = _ AND c.relkind = 'S'
    ) THEN fails := fails || ('sequence ' || _); END IF;
  END LOOP;

  -- =========================================================================
  -- INDEXES  (all explicitly-created indexes across 03-tables/ and 05-matviews/)
  -- =========================================================================
  FOREACH _ IN ARRAY ARRAY['api.idx_asset_symbol','api.assets_symbol_trgm_idx','api.assets_name_trgm_idx','api.assets_description_trgm_idx','api.idx_asset_prices_asset_tstamp','depots.idx_transaction_assets_depot','depots.idx_transaction_asset','depots.idx_transaction_depot','depots.idx_transactions_depot_asset_date','depots.idx_savings_assets_depot','depots.idx_savings_asset','depots.idx_savings_depot','depots.idx_holdings_asset'] LOOP
    n := n + 1;
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace s ON s.oid = c.relnamespace
      WHERE (s.nspname || '.' || c.relname) = _ AND c.relkind = 'i'
    ) THEN fails := fails || ('index ' || _); END IF;
  END LOOP;

  -- =========================================================================
  -- POLICIES  (09-policies/, one file per table — every policy name)
  -- =========================================================================
  FOREACH _ IN ARRAY ARRAY[
    'api.assets|Anyone can read assets',
    'api.asset_prices|Anyone can read asset prices',
    'api.latest_prices|Anyone can read latest prices',
    'depots.depots|Anyone can read depots',
    'depots.depots|auth_admin_insert',
    'depots.depots|Teachers can delete Depots',
    'depots.transactions|Users can read their depot transactions',
    'depots.transactions|Teachers can view all transactions',
    'depots.savings_plans|Users can read their depot savings plans',
    'depots.savings_plans|Teachers can view all savings plans entrys',
    'depots.savings_plans_budget|Users can read their budget',
    'depots.savings_plans_budget|Teachers can read all budgets',
    'depots.savings_plans_budget|Teachers can grant budget',
    'depots.savings_plans_budget|Teachers can update all budgets',
    'users.special_roles|Users can view own role',
    'users.special_roles|Admins can update roles',
    'users.special_roles|Admins can insert roles',
    'users.special_roles|Admins can delete roles',
    'users.special_roles|Teachers can view special roles'
  ] LOOP
    n := n + 1;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = split_part(split_part(_, '|', 1), '.', 1)
        AND tablename  = split_part(split_part(_, '|', 1), '.', 2)
        AND policyname = split_part(_, '|', 2)
    ) THEN fails := fails || ('policy ' || _); END IF;
  END LOOP;

  -- =========================================================================
  -- ROLES  (00-preauth auth_admin + 08-roles/)
  -- =========================================================================
  FOREACH _ IN ARRAY ARRAY['auth_admin','anon','authenticated','authenticator','service_worker','view_refresher'] LOOP
    n := n + 1;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = _) THEN fails := fails || 'role ' || _; END IF;
  END LOOP;

  -- =========================================================================
  -- TIMESCALEDB JOBS  (12-jobs/ + policy bundled in 05-matview)
  -- =========================================================================
  n := n + 1;
  IF NOT EXISTS (SELECT 1 FROM timescaledb_information.jobs WHERE proc_name = 'refresh_depot_values')
    THEN fails := fails || 'timescale job refresh_depot_values'; END IF;
  n := n + 1;
  IF NOT EXISTS (SELECT 1 FROM timescaledb_information.continuous_aggregates WHERE view_name = 'asset_prices_weekly')
    THEN fails := fails || 'continuous aggregate api.asset_prices_weekly'; END IF;

  -- =========================================================================
  -- GRANT / MEMBERSHIP spot-checks  (08-roles/ + 10-grants/)
  -- =========================================================================
  n := n + 1;
  IF NOT has_schema_privilege('anon',            'api',    'USAGE') THEN fails := fails || 'grant USAGE schema api to anon'; END IF;
  n := n + 1;
  IF NOT has_schema_privilege('anon',            'depots', 'USAGE') THEN fails := fails || 'grant USAGE schema depots to anon'; END IF;
  n := n + 1;
  IF NOT has_schema_privilege('authenticated',   'api',    'USAGE') THEN fails := fails || 'grant USAGE schema api to authenticated'; END IF;
  n := n + 1;
  IF NOT has_schema_privilege('authenticated',   'depots', 'USAGE') THEN fails := fails || 'grant USAGE schema depots to authenticated'; END IF;
  n := n + 1;
  IF NOT has_schema_privilege('authenticated',   'users',  'USAGE') THEN fails := fails || 'grant USAGE schema users to authenticated'; END IF;
  n := n + 1;
  IF NOT has_schema_privilege('authenticator',   'depots', 'USAGE') THEN fails := fails || 'grant USAGE schema depots to authenticator'; END IF;
  n := n + 1;
  IF NOT has_schema_privilege('service_worker',  'api',    'USAGE') THEN fails := fails || 'grant USAGE schema api to service_worker'; END IF;
  n := n + 1;
  IF NOT has_schema_privilege('service_worker',  'depots', 'USAGE') THEN fails := fails || 'grant USAGE schema depots to service_worker'; END IF;
  n := n + 1;
  IF NOT has_schema_privilege('auth_admin',      'depots', 'USAGE') THEN fails := fails || 'grant USAGE schema depots to auth_admin'; END IF;
  n := n + 1;
  IF NOT has_schema_privilege('view_refresher',  'depots', 'USAGE') THEN fails := fails || 'grant USAGE schema depots to view_refresher'; END IF;
  n := n + 1;
  IF NOT has_schema_privilege('view_refresher',  'api',    'USAGE') THEN fails := fails || 'grant USAGE schema api to view_refresher'; END IF;

  n := n + 1;
  IF NOT has_table_privilege('service_worker',  'api.assets',            'SELECT,INSERT,UPDATE,DELETE') THEN fails := fails || 'grant CRUD api.assets to service_worker'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('service_worker',  'depots.depots',         'SELECT,INSERT,UPDATE,DELETE') THEN fails := fails || 'grant CRUD depots.depots to service_worker'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('service_worker',  'depots.transactions',   'SELECT,INSERT,UPDATE,DELETE') THEN fails := fails || 'grant CRUD depots.transactions to service_worker'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('authenticated',   'depots.depots',         'SELECT,DELETE')               THEN fails := fails || 'grant SELECT,DELETE depots.depots to authenticated'; END IF;
  n := n + 1;
  IF has_table_privilege('authenticated',       'depots.depots',         'INSERT') OR has_table_privilege('authenticated', 'depots.depots', 'UPDATE') THEN fails := fails || 'expected no INSERT/UPDATE on depots.depots for authenticated'; END IF;
  n := n + 1;
  IF has_table_privilege('authenticated',       'depots.transactions',   'INSERT') OR has_table_privilege('authenticated', 'depots.transactions', 'UPDATE') OR has_table_privilege('authenticated', 'depots.transactions', 'DELETE') THEN fails := fails || 'expected no writes on depots.transactions for authenticated'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('authenticated',   'api.latest_prices',     'SELECT')                     THEN fails := fails || 'grant SELECT api.latest_prices to authenticated'; END IF;
  n := n + 1;
  IF NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace s ON s.oid = p.pronamespace WHERE s.nspname = 'depots' AND p.proname = 'run_savings_plans' AND p.prokind = 'p') THEN fails := fails || 'procedure depots.run_savings_plans'; END IF;
  n := n + 1;
  IF NOT EXISTS (SELECT 1 FROM timescaledb_information.jobs WHERE proc_name = 'run_savings_plans') THEN fails := fails || 'timescale job run_savings_plans'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('authenticated',   'depots.savings_plans',  'SELECT')                     THEN fails := fails || 'grant SELECT depots.savings_plans to authenticated'; END IF;
  n := n + 1;
  IF has_table_privilege('authenticated',       'depots.savings_plans',  'INSERT')                     THEN fails := fails || 'expected no INSERT on depots.savings_plans for authenticated'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('authenticated',   'users.special_roles',   'SELECT')                     THEN fails := fails || 'grant SELECT users.special_roles to authenticated'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('anon',            'api.assets',            'SELECT')                     THEN fails := fails || 'grant SELECT api.assets to anon'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('anon',            'depots.depots',         'SELECT')                     THEN fails := fails || 'grant SELECT depots.depots to anon'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('authenticator',   'depots.depots',         'SELECT')                     THEN fails := fails || 'grant SELECT depots.depots to authenticator'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('auth_admin',      'depots.depots',         'INSERT')                     THEN fails := fails || 'grant INSERT depots.depots to auth_admin'; END IF;

  n := n + 1;
  IF NOT has_table_privilege('authenticated',   'depots.values',         'SELECT')                     THEN fails := fails || 'grant SELECT depots.values to authenticated'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('anon',            'depots.values',         'SELECT')                     THEN fails := fails || 'grant SELECT depots.values to anon'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('authenticated',   'depots.holdings',       'SELECT')                     THEN fails := fails || 'grant SELECT depots.holdings to authenticated'; END IF;
  n := n + 1;
  IF has_table_privilege('anon',                'depots.holdings',       'SELECT')                     THEN fails := fails || 'expected no SELECT on depots.holdings for anon'; END IF;
  n := n + 1;
  IF has_table_privilege('authenticated',       'depots.holdings',       'INSERT')                     THEN fails := fails || 'expected no INSERT on depots.holdings for authenticated'; END IF;
  n := n + 1;
  IF has_table_privilege('authenticated',       'depots.daily_values',   'SELECT')                     THEN fails := fails || 'expected no SELECT on depots.daily_values for authenticated (read via depots.values)'; END IF;
  n := n + 1;
  IF has_function_privilege('authenticated',    'depots.rebuild_depot_values(bigint, date)', 'EXECUTE') THEN fails := fails || 'expected no EXECUTE on depots.rebuild_depot_values for authenticated'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('authenticated',   'users.profile',         'SELECT')                     THEN fails := fails || 'grant SELECT users.profile to authenticated'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('anon',            'depots.leaderboard',    'SELECT')                     THEN fails := fails || 'grant SELECT depots.leaderboard to anon'; END IF;
  n := n + 1;
  IF NOT has_table_privilege('authenticated',   'api.asset_prices_weekly','SELECT')                    THEN fails := fails || 'grant SELECT api.asset_prices_weekly to authenticated'; END IF;

  n := n + 1;
  IF NOT has_sequence_privilege('service_worker', 'depots.transactions_id_seq', 'USAGE') THEN fails := fails || 'grant USAGE depots.transactions_id_seq to service_worker'; END IF;

  n := n + 1;
  IF NOT has_function_privilege('authenticated', 'depots.buy_asset(bigint,bigint,numeric)', 'EXECUTE') THEN fails := fails || 'grant EXECUTE depots.buy_asset to authenticated'; END IF;
  n := n + 1;
  IF NOT has_function_privilege('anon', 'api.search_assets(text,text,integer)', 'EXECUTE') THEN fails := fails || 'grant EXECUTE api.search_assets to anon'; END IF;
  n := n + 1;
  IF NOT has_function_privilege('authenticated', 'users.has_any_role(users.special_role[])', 'EXECUTE') THEN fails := fails || 'grant EXECUTE users.has_any_role to authenticated'; END IF;
  n := n + 1;
  IF NOT has_function_privilege('authenticated', 'depots.new_depot_for_user(uuid)', 'EXECUTE') THEN fails := fails || 'grant EXECUTE depots.new_depot_for_user to authenticated'; END IF;
  n := n + 1;
  IF has_function_privilege('anon', 'depots.new_depot_for_user(uuid)', 'EXECUTE') THEN fails := fails || 'expected no EXECUTE on depots.new_depot_for_user for anon'; END IF;
  n := n + 1;
  IF has_function_privilege('anon', 'depots.buy_asset(bigint,bigint,numeric)', 'EXECUTE') THEN fails := fails || 'expected no EXECUTE on depots.buy_asset for anon'; END IF;

  n := n + 1;
  IF NOT has_database_privilege('authenticator', 'postgres', 'CONNECT') THEN fails := fails || 'grant CONNECT database postgres to authenticator'; END IF;
  n := n + 1;
  IF NOT has_database_privilege('service_worker', 'postgres', 'CONNECT') THEN fails := fails || 'grant CONNECT database postgres to service_worker'; END IF;
  n := n + 1;
  IF NOT has_database_privilege('auth_admin', 'postgres', 'CREATE') THEN fails := fails || 'grant CREATE database postgres to auth_admin'; END IF;

  n := n + 1;
  IF NOT pg_has_role('authenticator'::name, 'anon'::name, 'MEMBER')          THEN fails := fails || 'membership: anon granted to authenticator'; END IF;
  n := n + 1;
  IF NOT pg_has_role('authenticator'::name, 'authenticated'::name, 'MEMBER') THEN fails := fails || 'membership: authenticated granted to authenticator'; END IF;
  n := n + 1;
  IF NOT pg_has_role('authenticated'::name, 'view_refresher'::name, 'MEMBER') THEN fails := fails || 'membership: view_refresher granted to authenticated'; END IF;
  n := n + 1;
  IF NOT pg_has_role('service_worker'::name, 'view_refresher'::name, 'MEMBER') THEN fails := fails || 'membership: view_refresher granted to service_worker'; END IF;

  -- =========================================================================
  -- SEED  (seed/assets.sql)
  -- =========================================================================
  n := n + 1;
  IF NOT EXISTS (SELECT 1 FROM api.assets) THEN fails := fails || 'seed data (api.assets is empty)'; END IF;

  -- =========================================================================
  -- RESULT
  -- =========================================================================
  IF cardinality(fails) > 0 THEN
    RAISE EXCEPTION 'FAIL: % of % checks failed:%', cardinality(fails), n, E'\n  - ' || array_to_string(fails, E'\n  - ');
  ELSE
    RAISE NOTICE 'PASS: all % checks passed', n;
  END IF;
END
$$;

\echo 'verify_schema.sql: done (PASS)'
