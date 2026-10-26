CREATE TABLE IF NOT EXISTS kairos_column_lineage (
  id TEXT PRIMARY KEY,
  mapping_key TEXT NOT NULL,
  source_asset_id TEXT NOT NULL REFERENCES kairos_assets(id),
  source_column TEXT NOT NULL,
  target_asset_id TEXT NOT NULL REFERENCES kairos_assets(id),
  target_column TEXT NOT NULL,
  mapping_type TEXT NOT NULL DEFAULT 'static_candidate',
  transformation TEXT,
  evidence_ref TEXT,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  recorded_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  recorded_to TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (length(trim(source_column)) > 0),
  CHECK (length(trim(target_column)) > 0),
  CHECK (valid_to IS NULL OR valid_from IS NOT NULL),
  CHECK (valid_to IS NULL OR valid_to > valid_from),
  CHECK (recorded_to IS NULL OR recorded_to > recorded_from)
);
CREATE INDEX IF NOT EXISTS kairos_column_lineage_mapping_key_idx
  ON kairos_column_lineage(mapping_key, recorded_from);
CREATE UNIQUE INDEX IF NOT EXISTS kairos_column_lineage_one_current_version_idx
  ON kairos_column_lineage(mapping_key) WHERE recorded_to IS NULL;
CREATE INDEX IF NOT EXISTS kairos_column_lineage_source_idx
  ON kairos_column_lineage(source_asset_id, source_column);
CREATE INDEX IF NOT EXISTS kairos_column_lineage_target_idx
  ON kairos_column_lineage(target_asset_id, target_column);
CREATE INDEX IF NOT EXISTS kairos_column_lineage_recorded_idx
  ON kairos_column_lineage(recorded_from);
CREATE INDEX IF NOT EXISTS kairos_column_lineage_evidence_idx
  ON kairos_column_lineage(evidence_ref);