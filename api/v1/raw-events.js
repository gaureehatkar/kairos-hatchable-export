import { db } from "hatchable";
export const access = "admin";
export const methods = ["GET"];
export default async function (req, res) {
  try {
    const id = String(req.query?.id || "").trim().slice(0,1200);
    if (id) {
      const result = await db.query(
        "SELECT id, source_system, source_record_id, event_type, event_time, recorded_at, payload FROM kairos_raw_events WHERE id = $1 LIMIT 1",
        [id]
      );
      if (!result.rows.length) return res.status(404).json({ok:false,error:"raw_event_not_found",message:"No raw source artifact exists with that ID."});
      return res.json({ok:true,event:result.rows[0],semantics:"Original ingested payload. This endpoint does not update or reinterpret the stored source artifact."});
    }
    const parsedLimit = Number.parseInt(String(req.query?.limit || "25"),10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(100,Math.max(1,parsedLimit)) : 25;
    const result = await db.query(
      "SELECT id, source_system, source_record_id, event_type, event_time, recorded_at, pg_column_size(payload)::int AS payload_bytes FROM kairos_raw_events ORDER BY recorded_at DESC LIMIT $1",
      [limit]
    );
    const total = await db.query("SELECT COUNT(*)::int AS count FROM kairos_raw_events");
    return res.json({ok:true,source:"postgresql",count:result.rows.length,total:Number(total.rows[0]?.count||0),limit,events:result.rows});
  } catch (error) {
    return res.status(500).json({ok:false,error:"raw_event_query_failed",message:"Could not read the raw source-artifact ledger."});
  }
}