import { db } from "hatchable";

export const access = "admin";
export const methods = ["GET", "POST"];

function clean(value, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validBool(value) {
  return value === true || value === false || value === null;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const assetId = clean(req.query?.asset_id, 300);
    try {
      const result = assetId
        ? await db.query(
            "SELECT asset_id, column_name, is_pii, sensitivity_classification, classification_source, metadata, updated_at FROM kairos_column_classifications WHERE asset_id = $1 ORDER BY column_name LIMIT 2000",
            [assetId]
          )
        : await db.query(
            "SELECT asset_id, column_name, is_pii, sensitivity_classification, classification_source, metadata, updated_at FROM kairos_column_classifications ORDER BY asset_id, column_name LIMIT 10000"
          );
      return res.status(200).json({ ok: true, classifications: result.rows });
    } catch (error) {
      console.error("PII classification read failed", error);
      return res.status(500).json({ ok: false, error: "classification_read_failed", message: "Could not read persisted classifications." });
    }
  }

  const body = req.body || {};
  const entityType = clean(body.entity_type, 20).toLowerCase();
  const assetId = clean(body.asset_id, 300);
  const columnName = clean(body.column_name, 300);
  const isPii = body.is_pii;
  const sensitivity = body.sensitivity_classification == null || body.sensitivity_classification === ""
    ? null
    : clean(body.sensitivity_classification, 50).toUpperCase();
  const source = clean(body.classification_source || "manual", 80) || "manual";

  if (!assetId || !["asset", "column"].includes(entityType)) {
    return res.status(400).json({ ok: false, error: "invalid_classification_target", message: "entity_type must be asset or column, and asset_id is required." });
  }
  if (!validBool(isPii) || (entityType === "column" && !columnName)) {
    return res.status(400).json({ ok: false, error: "invalid_classification", message: "Provide is_pii as true, false, or null; column classifications also require column_name." });
  }
  if (sensitivity && !/^[A-Z][A-Z0-9_ -]{0,49}$/.test(sensitivity)) {
    return res.status(400).json({ ok: false, error: "invalid_sensitivity_classification", message: "Use a short label such as PII, PHI, CONFIDENTIAL, INTERNAL, or PUBLIC." });
  }
  try {
    const asset = await db.query("SELECT id, metadata FROM kairos_assets WHERE id = $1", [assetId]);
    if (!asset.rows?.length) return res.status(404).json({ ok: false, error: "asset_not_found", message: "The requested asset does not exist." });

    if (entityType === "asset") {
      const updated = await db.query(
        "UPDATE kairos_assets SET is_pii = $2, sensitivity_classification = $3, updated_at = now() WHERE id = $1 RETURNING id, qualified_name, is_pii, sensitivity_classification, updated_at",
        [assetId, isPii, sensitivity]
      );
      return res.status(200).json({ ok: true, entity_type: "asset", classification: updated.rows[0] });
    }

    const metadata = asset.rows[0].metadata && typeof asset.rows[0].metadata === "object" ? asset.rows[0].metadata : {};
    const columns = metadata.columns && typeof metadata.columns === "object" ? metadata.columns : {};
    if (!Object.prototype.hasOwnProperty.call(columns, columnName)) {
      return res.status(404).json({ ok: false, error: "column_not_found", message: "The column is not present in this asset's stored schema metadata." });
    }

    const saved = await db.query(
      "INSERT INTO kairos_column_classifications (asset_id, column_name, is_pii, sensitivity_classification, classification_source, metadata, updated_at) VALUES ($1,$2,$3,$4,$5,'{}'::jsonb,now()) ON CONFLICT (asset_id, column_name) DO UPDATE SET is_pii=EXCLUDED.is_pii, sensitivity_classification=EXCLUDED.sensitivity_classification, classification_source=EXCLUDED.classification_source, updated_at=now() RETURNING asset_id, column_name, is_pii, sensitivity_classification, classification_source, updated_at",
      [assetId, columnName, isPii, sensitivity, source]
    );
    return res.status(200).json({ ok: true, entity_type: "column", classification: saved.rows[0] });
  } catch (error) {
    console.error("PII classification write failed", error);
    return res.status(500).json({ ok: false, error: "classification_write_failed", message: "The classification could not be saved." });
  }
}