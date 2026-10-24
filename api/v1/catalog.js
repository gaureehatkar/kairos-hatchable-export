import { db } from "hatchable";
export const access = "admin";
export const methods = ["GET"];
export default async function (req, res) {
  try {
    const [assets, edges, evidence, runs, quality, totals] = await Promise.all([
      db.query("SELECT id, qualified_name, schema_name, asset_kind, asset_type, owner_name, description, column_count, metadata, created_at, updated_at FROM kairos_assets ORDER BY qualified_name LIMIT 5000"),
      db.query("SELECT id, source_asset_id, target_asset_id, edge_type, evidence_ref, metadata, created_at FROM kairos_lineage_edges ORDER BY created_at DESC LIMIT 10000"),
      db.query("SELECT id, source_name, target_name, state, evidence_type, run_id, coverage, rule_name, explanation, valid_from, valid_to, recorded_from, recorded_to, metadata, created_at FROM kairos_evidence ORDER BY recorded_from DESC LIMIT 5000"),
      db.query("SELECT id, pipeline_name, status, started_at, duration_ms, environment_name, asset_count, event_count, metadata, created_at FROM kairos_pipeline_runs ORDER BY started_at DESC NULLS LAST LIMIT 1000"),
      db.query("SELECT id, rule_name, qualified_asset_name, check_type, score, status, evaluated_at, metadata FROM kairos_quality_checks ORDER BY evaluated_at DESC NULLS LAST LIMIT 2000"),
      db.query("SELECT (SELECT COUNT(*)::int FROM kairos_assets) AS assets, (SELECT COUNT(*)::int FROM kairos_lineage_edges) AS edges, (SELECT COUNT(*)::int FROM kairos_evidence) AS evidence, (SELECT COUNT(*)::int FROM kairos_pipeline_runs) AS runs, (SELECT COUNT(*)::int FROM kairos_quality_checks) AS quality_checks, (SELECT COUNT(*)::int FROM kairos_raw_events) AS raw_events")
    ]);
    const counts = totals.rows[0] || {};
    return res.json({ok:true, source:"postgresql", counts:{assets:Number(counts.assets)||0,edges:Number(counts.edges)||0,evidence:Number(counts.evidence)||0,runs:Number(counts.runs)||0,quality_checks:Number(counts.quality_checks)||0,raw_events:Number(counts.raw_events)||0},limits:{assets:5000,edges:10000,evidence:5000,runs:1000,quality_checks:2000},assets:assets.rows,edges:edges.rows,evidence:evidence.rows,runs:runs.rows,quality_checks:quality.rows});
  } catch (error) {
    return res.status(500).json({ok:false,error:"catalog_query_failed",message:"Could not read the Kairos metadata store."});
  }
}