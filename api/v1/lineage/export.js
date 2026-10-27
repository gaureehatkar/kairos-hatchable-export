import { db } from "hatchable";

export const access = "admin";
export const methods = ["GET"];

function parseDate(value, fallback) {
  if (value == null || value === "") return fallback;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export default async function handler(req, res) {
  const now = new Date().toISOString();
  const validAsOf = parseDate(req.query?.valid_as_of, now);
  const recordedAsOf = parseDate(req.query?.recorded_as_of, now);
  if (!validAsOf || !recordedAsOf) {
    return res.status(400).json({ ok: false, error: "invalid_temporal_parameter", message: "valid_as_of and recorded_as_of must be valid date-time values." });
  }

  try {
    const [assets, edges, mappings, evidence] = await Promise.all([
      db.query("SELECT id, qualified_name, schema_name, asset_kind, asset_type, owner_name, description, column_count, is_pii, sensitivity_classification, metadata, created_at, updated_at FROM kairos_assets ORDER BY qualified_name LIMIT 5000"),
      db.query("SELECT id, source_asset_id, target_asset_id, edge_type, evidence_ref, metadata, created_at FROM kairos_lineage_edges ORDER BY created_at LIMIT 10000"),
      db.query("SELECT cl.id, cl.source_asset_id, sa.qualified_name AS source_asset, cl.source_column, cl.target_asset_id, ta.qualified_name AS target_asset, cl.target_column, cl.mapping_type, cl.transformation, cl.evidence_ref, cl.is_pii, cl.sensitivity_classification, cl.valid_from, cl.valid_to, cl.recorded_from, cl.recorded_to, cl.metadata FROM kairos_column_lineage cl JOIN kairos_assets sa ON sa.id=cl.source_asset_id JOIN kairos_assets ta ON ta.id=cl.target_asset_id WHERE cl.valid_from IS NOT NULL AND cl.valid_from <= $1::timestamptz AND (cl.valid_to IS NULL OR cl.valid_to > $1::timestamptz) AND cl.recorded_from <= $2::timestamptz AND (cl.recorded_to IS NULL OR cl.recorded_to > $2::timestamptz) ORDER BY cl.source_asset_id, cl.source_column, cl.target_asset_id, cl.target_column LIMIT 10000",
        [validAsOf, recordedAsOf]),
      db.query("SELECT id, source_name, target_name, state, evidence_type, run_id, coverage, rule_name, explanation, valid_from, valid_to, recorded_from, recorded_to, metadata, created_at FROM kairos_evidence WHERE (valid_from IS NULL OR valid_from <= $1::timestamptz) AND (valid_to IS NULL OR valid_to > $1::timestamptz) AND recorded_from <= $2::timestamptz AND (recorded_to IS NULL OR recorded_to > $2::timestamptz) ORDER BY recorded_from LIMIT 10000",
        [validAsOf, recordedAsOf])
    ]);
    const columnClassifications = await db.query(
      "SELECT asset_id, column_name, is_pii, sensitivity_classification, classification_source, updated_at FROM kairos_column_classifications ORDER BY asset_id, column_name LIMIT 10000"
    );
    return res.status(200).json({
      ok: true,
      export_type: "kairos_lineage_snapshot",
      temporal: { valid_as_of: validAsOf, recorded_as_of: recordedAsOf },
      limits: { assets: 5000, table_edges: 10000, column_mappings: 10000, evidence: 10000, column_classifications: 10000 },
      counts: { assets: assets.rows.length, table_edges: edges.rows.length, column_mappings: mappings.rows.length, evidence: evidence.rows.length, column_classifications: columnClassifications.rows.length },
      assets: assets.rows,
      table_edges: edges.rows,
      column_mappings: mappings.rows,
      column_classifications: columnClassifications.rows,
      evidence: evidence.rows,
      semantics: {
        temporal_scope: "Column mappings and evidence are filtered by valid-time and recorded-time semantics. Table-level edges have no bitemporal columns in the current schema and are exported as current stored relationships.",
        missing_classification: "No classification row or a NULL is_pii means not classified; it does not mean the asset or column is PII-free.",
        execution: "Declared/static lineage is not proof of runtime execution."
      }
    });
  } catch (error) {
    console.error("lineage export failed", error);
    return res.status(500).json({ ok: false, error: "lineage_export_failed", message: "Could not export the lineage snapshot." });
  }
}