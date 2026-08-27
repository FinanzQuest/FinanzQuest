-- =============================================================================
-- Seed: api.assets (loaded from assets.csv)
-- -----------------------------------------------------------------------------
-- NOTE: the COPY source path is the docker mount point for dbinit/assets.csv
-- (see compose.core.yml). The runner must mount assets.csv at that path, or
-- this statement needs its path updated — see init.sh note.
-- =============================================================================

COPY api.assets (id, symbol, name, description, asset_type) FROM '/docker-entrypoint-initdb.d/data/assets.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');
