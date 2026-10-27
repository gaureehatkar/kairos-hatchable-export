import { db, knowledge } from 'hatchable';

export const methods = ['POST'];
export const access = 'admin';

export default async function (req, res) {
  const { rows: assets } = await db.query('SELECT * FROM kairos_assets');
  const { rows: edges } = await db.query('SELECT * FROM kairos_lineage_edges');
  
  const docs = knowledge.base('catalog', { provider: 'anthropic' });
  
  const chunks = [];
  
  for (const a of assets) {
    chunks.push({
      id: `asset:${a.id}`,
      text: `Asset Name: ${a.qualified_name}\nSchema: ${a.schema_name}\nType: ${a.asset_type}\nKind: ${a.asset_kind}\nOwner: ${a.owner_name || 'Unowned'}\nColumns: ${a.column_count}\nDescription: ${a.description || 'None'}\nQualified Name: ${a.qualified_name}`,
      metadata: { type: 'asset', assetId: a.id, name: a.qualified_name }
    });
  }

  for (const e of edges) {
    const source = assets.find(a => a.id === e.source_asset_id);
    const target = assets.find(a => a.id === e.target_asset_id);
    if (!source || !target) continue;
    chunks.push({
      id: `edge:${e.id}`,
      text: `Lineage Edge: ${source.qualified_name} feeds into ${target.qualified_name}.\nEdge Type: ${e.edge_type}`,
      metadata: { type: 'edge', edgeId: e.id, source: source.qualified_name, target: target.qualified_name }
    });
  }

  if (chunks.length > 0) {
    // knowledge.add takes max 100 at a time typically, let's chunk it
    const batchSize = 100;
    for (let i = 0; i < chunks.length; i += batchSize) {
      await docs.add(chunks.slice(i, i + batchSize));
    }
  }
  
  if (res) {
    return res.json({ ok: true, indexed: chunks.length });
  } else {
    return { indexed: chunks.length };
  }
}