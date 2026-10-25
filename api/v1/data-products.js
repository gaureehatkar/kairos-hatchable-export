import { db } from 'hatchable';

export const methods = ['GET', 'POST'];
export const access = 'public';

export default async function (req, res) {
  if (req.method === 'POST') {
    const { name, domain, owner, status, sla_tier, contract_version, description, asset_ids } = req.body || {};
    if (!name || !domain || !owner) {
      return res.status(400).json({ ok: false, error: 'Missing required fields: name, domain, owner' });
    }
    const id = 'prod-' + Math.random().toString(36).slice(2, 9);
    try {
      await db.query(
        `INSERT INTO kairos_data_products (id, name, domain, owner, status, sla_tier, contract_version, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, name, domain, owner, status || 'ACTIVE', sla_tier || 'Tier 1 (99.9%)', contract_version || '1.0.0', description || '']
      );

      if (Array.isArray(asset_ids) && asset_ids.length > 0) {
        for (const assetId of asset_ids) {
          await db.query(
            `INSERT INTO kairos_data_product_assets (product_id, asset_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [id, assetId]
          );
        }
      }

      return res.json({ ok: true, id, message: 'Data product created successfully' });
    } catch (err) {
      return res.status(500).json({ ok: false, error: 'Failed to create data product: ' + err.message });
    }
  }

  // GET: list products with their assets
  const { rows: products } = await db.query('SELECT * FROM kairos_data_products ORDER BY created_at DESC');
  const { rows: links } = await db.query('SELECT * FROM kairos_data_product_assets');

  const formatted = products.map(p => ({
    ...p,
    asset_ids: links.filter(l => l.product_id === p.id).map(l => l.asset_id)
  }));

  res.json({ ok: true, data_products: formatted });
}