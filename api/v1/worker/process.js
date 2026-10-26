import { db } from "hatchable";

export const access = "public"; // Public for easy demo triggering, can be restricted to 'scheduler' later
export const methods = ["POST", "GET"];

export default async function handler(req, res) {
  // Fetch up to 50 queued jobs that are due
  const { rows: jobs } = await db.query(`
    SELECT * FROM kairos_durable_jobs
    WHERE status = 'queued' AND run_after <= now()
    ORDER BY created_at ASC
    LIMIT 50
  `);

  if (jobs.length === 0) {
    return res.status(200).json({ ok: true, processed: 0, message: "No pending jobs." });
  }

  const results = [];

  for (const job of jobs) {
    try {
      if (job.task_type === "normalize_raw_event") {
        // Retrieve raw event if payload has raw_event_id
        const rawEventId = job.payload?.raw_event_id;
        if (rawEventId) {
          const { rows: events } = await db.query(`SELECT payload FROM kairos_raw_events WHERE id = $1`, [rawEventId]);
          if (events.length > 0) {
            const rawPayload = events[0].payload;
            // Normalize logic here - converting raw payload to standardized assets and edges.
            // (Note: ingest.js already handles synchronous parsing for some schemas, 
            // but this background job acts as the async translation engine for ML and GenAI raw payloads).
            
            if (rawPayload.source_system === 'mlflow') {
               // Extract Model info
               const assetId = `mlflow:${rawPayload.model_name}`;
               const metadata = JSON.stringify({ version: rawPayload.version, metrics: rawPayload.metrics });
               
               // Upsert Asset
               await db.query(`
                 INSERT INTO kairos_assets (id, qualified_name, schema_name, asset_kind, asset_type, metadata)
                 VALUES ($1, $2, 'mlflow', 'transform', 'ML Model', $3::jsonb)
                 ON CONFLICT (qualified_name) DO UPDATE SET metadata=EXCLUDED.metadata
               `, [assetId, rawPayload.model_name, metadata]);

               // Create Lineage Edge from Postgres Table to ML Model
               const edgeId = `mlflow-edge:${rawPayload.training_dataset}->${assetId}`;
               await db.query(`
                 INSERT INTO kairos_lineage_edges (id, source_asset_id, target_asset_id, edge_type, metadata)
                 VALUES ($1, $2, $3, 'training_dependency', '{"confidence": "high"}'::jsonb)
                 ON CONFLICT DO NOTHING
               `, [edgeId, rawPayload.training_dataset, assetId]);
            }
          }
        }
      } else if (job.task_type === "generate_embeddings") {
        // Create an embedding chunk for RAG (AI Semantic Search)
        const { asset_id, schema_name } = job.payload;
        
        // Fetch the asset metadata
        const { rows: assets } = await db.query(`SELECT * FROM kairos_assets WHERE id = $1`, [asset_id]);
        
        if (assets.length > 0) {
           const asset = assets[0];
           
           // Generate a semantic text representation for vector search
           const chunkText = `Asset ${asset.qualified_name} (Type: ${asset.asset_type}) in schema ${asset.schema_name}. Description: ${asset.description || 'No description.'}`;
           
           // Simulate a vector payload generation (for our JSONB fallback table)
           const simulatedEmbedding = JSON.stringify([0.1, -0.4, 0.88, 0.2]); 

           // Insert into kairos_asset_embeddings
           await db.query(`
             INSERT INTO kairos_asset_embeddings (asset_id, domain, sensitivity, chunk_text, embedding)
             VALUES ($1, $2, 'Public', $3, $4::jsonb)
           `, [
               asset.id, 
               schema_name, 
               chunkText, 
               simulatedEmbedding
           ]);
        }
      }
      
      // Mark job as completed
      await db.query(`UPDATE kairos_durable_jobs SET status = 'completed', updated_at = now() WHERE id = $1`, [job.id]);
      results.push({ id: job.id, status: "completed" });

    } catch (error) {
      // Mark job as failed on error
      await db.query(`UPDATE kairos_durable_jobs SET status = 'failed', error_log = $2, updated_at = now() WHERE id = $1`, [job.id, String(error.message)]);
      results.push({ id: job.id, status: "failed", error: error.message });
    }
  }

  return res.status(200).json({ ok: true, processed: jobs.length, results });
}