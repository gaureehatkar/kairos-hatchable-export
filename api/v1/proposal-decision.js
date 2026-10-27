import { db } from "hatchable";
export const access = "admin";
export const methods = ["POST"];
export default async function (req, res) {
  const { id, status } = req.body || {};
  if (!id || !["approved", "rejected"].includes(status)) return res.status(400).json({ ok: false, error: "invalid_decision", message: "id and approved/rejected status are required." });
  try {
    const r = await db.query("UPDATE glossary_proposals SET status=$1, decided_at=now() WHERE id=$2 AND status='pending' RETURNING *", [status, id]);
    return r.rows.length ? res.json({ ok: true, proposal: r.rows[0] }) : res.status(409).json({ ok: false, error: "proposal_not_pending", message: "Proposal does not exist or is no longer pending." });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "proposal_decision_failed", message: "Could not persist the glossary decision." });
  }
}