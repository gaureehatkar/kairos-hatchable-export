CREATE TABLE IF NOT EXISTS kairos_assets (
 id TEXT PRIMARY KEY, qualified_name TEXT NOT NULL UNIQUE, schema_name TEXT NOT NULL,
 asset_kind TEXT NOT NULL CHECK (asset_kind IN ('source','transform','output')),
 asset_type TEXT NOT NULL, owner_name TEXT, description TEXT, column_count INTEGER NOT NULL DEFAULT 0,
 metadata JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS kairos_lineage_edges (
 id TEXT PRIMARY KEY, source_asset_id TEXT NOT NULL REFERENCES kairos_assets(id),
 target_asset_id TEXT NOT NULL REFERENCES kairos_assets(id), edge_type TEXT NOT NULL DEFAULT 'static_candidate',
 evidence_ref TEXT, metadata JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE (source_asset_id,target_asset_id,edge_type)
);
CREATE TABLE IF NOT EXISTS kairos_evidence (
 id TEXT PRIMARY KEY, source_name TEXT NOT NULL, target_name TEXT NOT NULL,
 state TEXT NOT NULL CHECK (state IN ('OBSERVED','REFUTED_FOR_RUN','POSSIBLE','UNKNOWN')),
 evidence_type TEXT NOT NULL, run_id TEXT, coverage TEXT, rule_name TEXT, explanation TEXT NOT NULL,
 valid_from TIMESTAMPTZ, valid_to TIMESTAMPTZ, recorded_from TIMESTAMPTZ NOT NULL DEFAULT now(),
 recorded_to TIMESTAMPTZ, metadata JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS kairos_pipeline_runs (
 id TEXT PRIMARY KEY, pipeline_name TEXT NOT NULL,
 status TEXT NOT NULL CHECK (status IN ('SUCCESS','WARNING','FAILED','RUNNING')),
 started_at TIMESTAMPTZ, duration_ms BIGINT, environment_name TEXT,
 asset_count INTEGER NOT NULL DEFAULT 0, event_count INTEGER NOT NULL DEFAULT 0,
 metadata JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS kairos_quality_checks (
 id TEXT PRIMARY KEY, rule_name TEXT NOT NULL, qualified_asset_name TEXT NOT NULL,
 check_type TEXT NOT NULL, score NUMERIC(5,2),
 status TEXT NOT NULL CHECK (status IN ('PASS','WARNING','FAIL','UNKNOWN')),
 evaluated_at TIMESTAMPTZ, metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS kairos_edges_source_idx ON kairos_lineage_edges(source_asset_id);
CREATE INDEX IF NOT EXISTS kairos_edges_target_idx ON kairos_lineage_edges(target_asset_id);
CREATE INDEX IF NOT EXISTS kairos_evidence_state_idx ON kairos_evidence(state);
CREATE INDEX IF NOT EXISTS kairos_evidence_recorded_idx ON kairos_evidence(recorded_from);
CREATE INDEX IF NOT EXISTS kairos_runs_started_idx ON kairos_pipeline_runs(started_at);