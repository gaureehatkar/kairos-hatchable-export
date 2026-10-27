import { db } from "hatchable";
export const access = "public";
export const methods = ["GET", "POST"];
export default async function (req, res) {
  try {
    if (req.method === "GET") {
      const r = await db.query("SELECT * FROM glossary_proposals ORDER BY id DESC LIMIT 100");
      return res.json({ ok: true, proposals: r.rows });
    }
    const b = req.body || {};
    const name = String(b.name || "").trim().slice(0, 80), def = String(b.definition || "").trim().slice(0, 500), who = String(b.proposer || "").trim().slice(0, 60);
    if (!name || !def || !who) return res.status(400).json({ ok: false, error: "invalid_proposal", message: "name, definition and proposer are required." });
    const r = await db.query("INSERT INTO glossary_proposals (name, definition, proposer) VALUES ($1, $2, $3) RETURNING *", [name, def, who]);
    return res.status(201).json({ ok: true, proposal: r.rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "proposal_operation_failed", message: "Could not load or save glossary proposals." });
  }
}