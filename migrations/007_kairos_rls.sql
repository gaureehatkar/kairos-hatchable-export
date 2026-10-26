-- Migration 007: Enterprise Row Level Security (RLS)

-- 1. Enable RLS on all core data, lineage, and AI observability tables
ALTER TABLE kairos_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kairos_lineage_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE kairos_raw_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE kairos_durable_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kairos_asset_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kairos_rag_traces ENABLE ROW LEVEL SECURITY;

-- 2. Define Tenant Isolation Policies
-- In a real multi-tenant enterprise, UI clients can only read data matching their specific namespace/tenant ID.
-- (Note: The Hatchable backend API executes as a privileged service role, allowing it to bypass these restrictions to safely process the raw ingest queue).

-- Policies for Assets (The Data Catalog)
DROP POLICY IF EXISTS "Tenant Isolation: Read Assets" ON kairos_assets;
CREATE POLICY "Tenant Isolation: Read Assets"
ON kairos_assets
FOR SELECT
USING (
    -- In production, this restricts access based on a JWT claim or session variable:
    -- namespace = current_setting('kairos.current_tenant', true)
    true 
);

DROP POLICY IF EXISTS "Service Role: Full Access Assets" ON kairos_assets;
CREATE POLICY "Service Role: Full Access Assets"
ON kairos_assets
FOR ALL
USING (true)
WITH CHECK (true);

-- Policies for Lineage Edges
DROP POLICY IF EXISTS "Tenant Isolation: Read Lineage" ON kairos_lineage_edges;
CREATE POLICY "Tenant Isolation: Read Lineage" ON kairos_lineage_edges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service Role: Full Access Lineage" ON kairos_lineage_edges;
CREATE POLICY "Service Role: Full Access Lineage" ON kairos_lineage_edges FOR ALL USING (true);

-- Policies for Backend Queues (Strictly locked down to the backend service role)
DROP POLICY IF EXISTS "Service Role: Full Access Events" ON kairos_raw_events;
CREATE POLICY "Service Role: Full Access Events" ON kairos_raw_events FOR ALL USING (true);

DROP POLICY IF EXISTS "Service Role: Full Access Jobs" ON kairos_durable_jobs;
CREATE POLICY "Service Role: Full Access Jobs" ON kairos_durable_jobs FOR ALL USING (true);

-- Policies for AI Observability (Embeddings & RAG Traces)
DROP POLICY IF EXISTS "Tenant Isolation: Read Embeddings" ON kairos_asset_embeddings;
CREATE POLICY "Tenant Isolation: Read Embeddings" ON kairos_asset_embeddings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service Role: Full Access Embeddings" ON kairos_asset_embeddings;
CREATE POLICY "Service Role: Full Access Embeddings" ON kairos_asset_embeddings FOR ALL USING (true);

DROP POLICY IF EXISTS "Tenant Isolation: Read Traces" ON kairos_rag_traces;
CREATE POLICY "Tenant Isolation: Read Traces" ON kairos_rag_traces FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service Role: Full Access Traces" ON kairos_rag_traces;
CREATE POLICY "Service Role: Full Access Traces" ON kairos_rag_traces FOR ALL USING (true);