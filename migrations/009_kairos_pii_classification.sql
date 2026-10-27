-- Persist PII/sensitivity explicitly while preserving NULL as "not classified".
ALTER TABLE kairos_assets
  ADD COLUMN IF NOT EXISTS is_pii BOOLEAN,
  ADD COLUMN IF NOT EXISTS sensitivity_classification VARCHAR(50);

ALTER TABLE kairos_column_lineage
  ADD COLUMN IF NOT EXISTS is_pii BOOLEAN,
  ADD COLUMN IF NOT EXISTS sensitivity_classification VARCHAR(50);

-- Column-level classifications are normalized separately because one lineage mapping
-- can connect two independently classified columns, and many columns have no mapping.
CREATE TABLE IF NOT EXISTS kairos_column_classifications (
  asset_id TEXT NOT NULL REFERENCES kairos_assets(id) ON DELETE CASCADE,
  column_name TEXT NOT NULL CHECK (length(trim(column_name)) > 0),
  is_pii BOOLEAN,
  sensitivity_classification VARCHAR(50),
  classification_source VARCHAR(80) NOT NULL DEFAULT 'manual',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (asset_id, column_name),
  CHECK (sensitivity_classification IS NULL OR length(trim(sensitivity_classification)) > 0)
);

CREATE INDEX IF NOT EXISTS kairos_column_classifications_pii_idx
  ON kairos_column_classifications(is_pii, sensitivity_classification);
CREATE INDEX IF NOT EXISTS kairos_column_classifications_asset_idx
  ON kairos_column_classifications(asset_id);

COMMENT ON COLUMN kairos_assets.is_pii IS 'Nullable: TRUE means classified as PII, FALSE means explicitly reviewed as not PII, NULL means not classified.';
COMMENT ON COLUMN kairos_column_lineage.is_pii IS 'Nullable classification for the mapping record; NULL means no classification recorded.';
COMMENT ON TABLE kairos_column_classifications IS 'Authoritative persisted column classifications; absence of a row means not classified, not PII-free.';