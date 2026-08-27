-- =============================================================================
-- depots.savings_plans_budget
-- Depends on: depots.depots (FK)
-- =============================================================================

CREATE TABLE IF NOT EXISTS depots.savings_plans_budget(
    depot_id BIGINT NOT NULL REFERENCES depots.depots(id) ON DELETE CASCADE,
    budget INT NOT NULL,
    last_changed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (depot_id)
);
