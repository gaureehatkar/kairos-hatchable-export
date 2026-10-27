import { db } from "hatchable";
export const access = "admin";
export const methods = ["GET"];

function parseDate(value, fallback) {
  if (value == null || value === "") return fallback;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export default async function (req, res) {
  const now = new Date().toISOString();
  const validAsOf = parseDate(req.query?.valid_as_of, now);
  const recordedAsOf = parseDate(req.query?.recorded_as_of, now);
  if (!validAsOf || !recordedAsOf) {
    return res.status(400).json({
      ok: false,
      error: "invalid_temporal_parameter",
      message: "valid_as_of and recorded_as_of must be valid date-time values."
    });
  }

  try {
    const [included, undated, totals] = await Promise.all([
      db.query(
        "SELECT cl.id, cl.source_asset_id, sa.qualified_name AS source_asset, cl.source_column, cl.target_asset_id, ta.qualified_name AS target_asset, cl.target_column, cl.mapping_type, cl.transformation, cl.evidence_ref, cl.is_pii, cl.sensitivity_classification, cl.valid_from, cl.valid_to, cl.recorded_from, cl.recorded_to, cl.metadata, cl.created_at FROM kairos_column_lineage cl JOIN kairos_assets sa ON sa.id = cl.source_asset_id JOIN kairos_assets ta ON ta.id = cl.target_asset_id WHERE cl.valid_from IS NOT NULL AND cl.valid_from <= $1::timestamptz AND (cl.valid_to IS NULL OR cl.valid_to > $1::timestamptz) AND cl.recorded_from <= $2::timestamptz AND (cl.recorded_to IS NULL OR cl.recorded_to > $2::timestamptz) ORDER BY cl.source_asset_id, cl.source_column, cl.target_asset_id, cl.target_column LIMIT 5000",
        [validAsOf, recordedAsOf]
      ),
      db.query(
        "SELECT COUNT(*)::int AS count FROM kairos_column_lineage WHERE valid_from IS NULL AND recorded_from <= $1::timestamptz AND (recorded_to IS NULL OR recorded_to > $1::timestamptz)",
        [recordedAsOf]
      ),
      db.query(
        "SELECT COUNT(*)::int AS count FROM kairos_column_lineage WHERE recorded_from <= $1::timestamptz AND (recorded_to IS NULL OR recorded_to > $1::timestamptz)",
        [recordedAsOf]
      )
    ]);
    return res.status(200).json({
      ok: true,
      temporal: { valid_as_of: validAsOf, recorded_as_of: recordedAsOf },
      counts: {
        included: included.rows.length,
        undated_valid_time: Number(undated.rows[0]?.count || 0),
        recorded_at_snapshot: Number(totals.rows[0]?.count || 0)
      },
      mappings: included.rows,
      semantics: "Only mappings with an explicit valid_from inside the valid-time interval are included in the snapshot. Undated mappings are counted separately, not silently treated as valid. recorded_from/recorded_to represent system-recorded time. A column mapping records a declared lineage relationship; it does not by itself prove runtime execution."
    });
  } catch (error) {
    console.error("column-lineage query failed", error);
    return res.status(500).json({
      ok: false,
      error: "column_lineage_query_failed",
      message: "Unable to load column-lineage mappings."
    });
  }
}