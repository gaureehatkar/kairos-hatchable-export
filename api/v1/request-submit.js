import { db } from "hatchable";

export const access = "public";
export const methods = ["POST"];

export default async function handler(req, res) {
  const body = req.body || {};
  const asset = typeof body.asset_id === "string" ? body.asset_id.trim() : "";
  const requester = typeof body.requester === "string" ? body.requester.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (!asset || !requester || !reason) return res.status(400).json({ ok: false, error: "invalid_request", message: "asset_id, requester and reason are required." });
  if (asset.length > 300 || requester.length > 120 || reason.length > 2000) return res.status(400).json({ ok: false, error: "request_too_long", message: "Asset, requester or reason exceeds the allowed length." });
  try {
    const { rows } = await db.query("INSERT INTO access_requests (asset_id, requester, reason, status) VALUES ($1,$2,$3,'pending') RETURNING id, asset_id AS asset_name, requester, reason, status, created_at AS requested_at", [asset, requester, reason]);
    return res.status(201).json({ ok: true, request: rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "request_write_failed", message: "The access request could not be saved. No approval was performed." });
  }
}