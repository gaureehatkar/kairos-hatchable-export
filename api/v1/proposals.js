import { db } from "hatchable";
export const access = "public";
export const methods = ["GET", "POST"];
export default async function (req, res) {
  if (req.method === "GET") {
    const r = await db.query("SELECT * FROM glossary_proposals ORDER BY id DESC LIMIT 100");
    return res.json({ proposals: r.rows });
  }
  const b = req.body || {};
  if (b.action === "decide") {
    if (!["approved", "rejected"].includes(b.status) || !b.id) return res.status(400).json({ error: "id and status required." });
    const r = await db.query("UPDATE glossary_proposals SET status = $1, decided_at = now() WHERE id = $2 AND status = 'pending' RETURNING *", [b.status, b.id]);
    return r.rows.length ? res.json({ proposal: r.rows[0] }) : res.status(409).json({ error: "Proposal is not pending." });
  }
  const name = String(b.name || "").trim().slice(0, 80), def = String(b.definition || "").trim().slice(0, 500), who = String(b.proposer || "").trim().slice(0, 60);
  if (!name || !def || !who) return res.status(400).json({ error: "name, definition and proposer are required." });
  const r = await db.query("INSERT INTO glossary_proposals (name, definition, proposer) VALUES ($1, $2, $3) RETURNING *", [name, def, who]);
  return res.status(201).json({ proposal: r.rows[0] });
}