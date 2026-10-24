CREATE TABLE IF NOT EXISTS kairos_raw_events (
  id TEXT PRIMARY KEY,
  source_system TEXT NOT NULL CHECK (source_system IN ('dbt_manifest','openlineage')),
  source_record_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_time TIMESTAMPTZ,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL,
  UNIQUE (source_system, source_record_id)
);
CREATE INDEX IF NOT EXISTS kairos_raw_events_recorded_idx ON kairos_raw_events(recorded_at DESC);
CREATE INDEX IF NOT EXISTS kairos_raw_events_source_idx ON kairos_raw_events(source_system, event_type);