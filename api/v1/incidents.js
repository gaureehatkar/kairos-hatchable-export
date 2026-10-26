import { db } from "hatchable";
export const access = "public";
export const methods = ["GET", "POST"];
export default async function (req, res) {
  if (req.method === "GET") {
    const a = (req.query || {}).asset;
    const r = a ? await db.query("SELECT * FROM incidents WHERE asset_id = $1 ORDER BY id DESC LIMIT 50", [a]) : await db.query("SELECT * FROM incidents ORDER BY id DESC LIMIT 100");
    return res.json({ incidents: r.rows });
  }
  const b = req.body || {};
  if (b.action === "resolve" || b.action === "acknowledge") {
    const st = b.action === "resolve" ? "resolved" : "acknowledged";
    const r = await db.query("UPDATE incidents SET status = $1, resolved_at = CASE WHEN $1 = 'resolved' THEN now() ELSE resolved_at END WHERE id = $2 AND status <> 'resolved' RETURNING *", [st, b.id]);
    return r.rows.length ? res.json({ incident: r.rows[0] }) : res.status(409).json({ error: "Incident is already resolved or missing." });
  }
  const title = String(b.title || "").trim().slice(0, 200);
  if (!b.asset_id || !title) return res.status(400).json({ error: "asset_id and title are required." });
  const sev = ["low", "medium", "high"].includes(b.severity) ? b.severity : "medium";
  const r = await db.query("INSERT INTO incidents (asset_id, title, severity) VALUES ($1, $2, $3) RETURNING *", [b.asset_id, title, sev]);
  return res.status(201).json({ incident: r.rows[0] });
}