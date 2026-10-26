import { db } from "hatchable";
export const access = "public";
export const methods = ["GET", "POST"];
export default async function (req, res) {
  if (req.method === "GET") {
    const a = (req.query || {}).asset;
    const r = a ? await db.query("SELECT * FROM access_requests WHERE asset_id = $1 ORDER BY id DESC LIMIT 50", [a]) : await db.query("SELECT * FROM access_requests ORDER BY id DESC LIMIT 100");
    return res.json({ requests: r.rows });
  }
  const b = req.body || {};
  if (b.action === "decide") {
    if (!["approved", "rejected"].includes(b.status) || !b.id) return res.status(400).json({ error: "id and status (approved or rejected) required." });
    const r = await db.query("UPDATE access_requests SET status = $1, decided_by = $2, decided_at = now() WHERE id = $3 AND status = 'pending' RETURNING *", [b.status, String(b.by || "steward").slice(0, 60), b.id]);
    return r.rows.length ? res.json({ request: r.rows[0] }) : res.status(409).json({ error: "Request is not pending." });
  }
  const reason = String(b.reason || "").trim().slice(0, 500), who = String(b.requester || "").trim().slice(0, 60);
  if (!b.asset_id || !reason || !who) return res.status(400).json({ error: "asset_id, requester and reason are required." });
  const r = await db.query("INSERT INTO access_requests (asset_id, requester, reason) VALUES ($1, $2, $3) RETURNING *", [b.asset_id, who, reason]);
  return res.status(201).json({ request: r.rows[0] });
}