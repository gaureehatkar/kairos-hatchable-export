-- Table to store AI embeddings for the RAG search, separate from core metadata.
-- Using JSONB fallback for embeddings since pgvector is unavailable in this specific tier.
CREATE TABLE IF NOT EXISTS kairos_asset_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id TEXT NOT NULL REFERENCES kairos_assets(id) ON DELETE CASCADE,
    domain TEXT, -- Inherited from metadata for RLS/tenant filtering
    sensitivity TEXT, -- PII, Public, Confidential
    chunk_text TEXT NOT NULL,
    embedding JSONB, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigram index for hybrid keyword search fallback on the chunk text
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_kairos_embeddings_text ON kairos_asset_embeddings USING gin (chunk_text gin_trgm_ops);

-- Table to store traces of RAG interactions (ML observability)
CREATE TABLE IF NOT EXISTS kairos_rag_traces (
    trace_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT, 
    query_text TEXT NOT NULL,
    retrieved_context JSONB, -- Array of asset_ids and chunks retrieved
    generated_answer TEXT,
    prompt_version TEXT,
    model_version TEXT,
    tokens_used INT,
    latency_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to automatically queue a background embedding job when a new asset is added or updated
CREATE OR REPLACE FUNCTION kairos_queue_embedding_job()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO kairos_durable_jobs (task_type, payload)
    VALUES (
        'generate_embeddings',
        jsonb_build_object('asset_id', NEW.id, 'schema_name', NEW.schema_name)
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kairos_assets_enqueue_embedding ON kairos_assets;
CREATE TRIGGER kairos_assets_enqueue_embedding
AFTER INSERT OR UPDATE ON kairos_assets
FOR EACH ROW EXECUTE FUNCTION kairos_queue_embedding_job();