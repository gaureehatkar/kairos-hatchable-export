CREATE TYPE kairos_job_status AS ENUM ('queued', 'running', 'completed', 'failed');

CREATE TABLE kairos_durable_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_type VARCHAR(100) NOT NULL, -- e.g. 'normalize_openlineage', 'parse_sql', 'rebuild_graph', 'generate_embeddings'
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status kairos_job_status NOT NULL DEFAULT 'queued',
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    locked_at TIMESTAMPTZ,
    locked_by VARCHAR(255),
    run_after TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    error_log TEXT
);

-- Index optimized for finding the next available job to process
CREATE INDEX idx_kairos_jobs_queue ON kairos_durable_jobs (status, run_after) WHERE status = 'queued';

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION kairos_update_job_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER kairos_durable_jobs_timestamp
BEFORE UPDATE ON kairos_durable_jobs
FOR EACH ROW EXECUTE FUNCTION kairos_update_job_timestamp();

-- Create an trigger function that automatically queues a background job when a new raw event is received
CREATE OR REPLACE FUNCTION kairos_queue_raw_event_processing()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO kairos_durable_jobs (task_type, payload)
    VALUES (
        'normalize_raw_event',
        jsonb_build_object('event_id', NEW.id, 'source_system', NEW.source_system)
    );
    RETURN NEW;
END;
$$;

-- Trigger to automatically enqueue raw events for processing, keeping the raw_events table purely immutable
CREATE TRIGGER kairos_queue_event_after_insert
AFTER INSERT ON kairos_raw_events
FOR EACH ROW EXECUTE FUNCTION kairos_queue_raw_event_processing();