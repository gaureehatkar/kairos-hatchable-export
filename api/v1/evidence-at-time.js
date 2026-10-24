import { db } from "hatchable";
export const access = "admin";
export const methods = ["GET"];
function iso(value) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
export default async function (req, res) {
  const validAsOf = iso(req.query?.valid_as_of);
  const recordedAsOf = iso(req.query?.recorded_as_of);
  if (!validAsOf || !recordedAsOf) {
    return res.status(400).json({ok:false,error:"invalid_time",message:"Provide valid_as_of and recorded_as_of as valid date-time values."});
  }
  try {
    const [included, undated, totals] = await Promise.all([
      db.query(
        "SELECT id, source_name, target_name, state, evidence_type, run_id, coverage, rule_name, explanation, valid_from, valid_to, recorded_from, recorded_to, metadata, created_at FROM kairos_evidence WHERE valid_from IS NOT NULL AND valid_from <= $1::timestamptz AND (valid_to IS NULL OR valid_to > $1::timestamptz) AND recorded_from <= $2::timestamptz AND (recorded_to IS NULL OR recorded_to > $2::timestamptz) ORDER BY recorded_from DESC LIMIT 5000",
        [validAsOf, recordedAsOf]
      ),
      db.query(
        "SELECT COUNT(*)::int AS count FROM kairos_evidence WHERE valid_from IS NULL AND recorded_from <= $1::timestamptz AND (recorded_to IS NULL OR recorded_to > $1::timestamptz)",
        [recordedAsOf]
      ),
      db.query("SELECT COUNT(*)::int AS count FROM kairos_evidence")
    ]);
    return res.json({
      ok:true,
      source:"postgresql",
      valid_as_of:validAsOf,
      recorded_as_of:recordedAsOf,
      evidence:included.rows,
      counts:{
        included:included.rows.length,
        undated_valid_time:Number(undated.rows[0]?.count || 0),
        total_current_and_historical:Number(totals.rows[0]?.count || 0)
      },
      semantics:"Only evidence with an explicit valid_from is included in the valid-time snapshot. Evidence without valid-time bounds is reported separately as undated, not silently treated as valid. recorded_from/recorded_to represent system-recorded time."
    });
  } catch (error) {
    return res.status(500).json({ok:false,error:"temporal_query_failed",message:"Could not evaluate the stored evidence at the requested times."});
  }
}