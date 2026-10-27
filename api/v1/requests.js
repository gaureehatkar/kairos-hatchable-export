import { db } from "hatchable";

export const access = "admin";
export const methods = ["GET"];

export default async function handler(req, res) {
  try {
    const { rows } = await db.query("SELECT id, asset_id AS asset_name, requester, reason, status, decided_by, decided_at, created_at AS requested_at FROM access_requests ORDER BY created_at DESC LIMIT 500");
    return res.json({ ok: true, source: "postgresql", requests: rows });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "requests_query_failed", message: "Could not load persisted access requests." });
  }
}