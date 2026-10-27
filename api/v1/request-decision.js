import { db } from "hatchable";

export const access = "admin";
export const methods = ["POST"];

export default async function handler(req, res) {
  const { id, status, decided_by } = req.body || {};
  if (!id || !["approved", "rejected"].includes(status)) return res.status(400).json({ ok: false, error: "invalid_decision", message: "A request id and approved/rejected status are required." });
  try {
    const { rows } = await db.query("UPDATE access_requests SET status=$1, decided_by=$2, decided_at=now() WHERE id=$3 AND status='pending' RETURNING id, asset_id AS asset_name, requester, reason, status, decided_by, decided_at", [status, typeof decided_by === "string" ? decided_by.slice(0,120) : null, id]);
    if (!rows.length) return res.status(409).json({ ok: false, error: "request_not_pending", message: "Request does not exist or is no longer pending." });
    return res.json({ ok: true, request: rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "request_decision_failed", message: "Could not persist the governance decision." });
  }
}