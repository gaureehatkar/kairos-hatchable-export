import { db } from 'hatchable';

export const methods = ['POST'];
export const access = 'admin';

export default async function (req, res) {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (!question) return res.status(400).json({ error: 'Missing question' });
  if (question.length > 500) return res.status(400).json({ error: 'Question must be 500 characters or fewer' });

  const terms = [...new Set(question.toLowerCase().split(/[^a-z0-9_]+/).filter(term => term.length >= 2))].slice(0, 12);
  if (!terms.length) return res.status(400).json({ error: 'Enter at least one searchable word' });
  const patterns = terms.map(term => '%' + term.replace(/[\\%_]/g, '\\$&') + '%');

  try {
    const { rows } = await db.query(
      "SELECT id, qualified_name AS name, asset_type AS type, schema_name, owner_name, description FROM kairos_assets WHERE lower(qualified_name) LIKE ANY($1::text[]) OR lower(coalesce(description,'')) LIKE ANY($1::text[]) OR lower(coalesce(owner_name,'')) LIKE ANY($1::text[]) OR lower(coalesce(asset_type,'')) LIKE ANY($1::text[]) OR lower(coalesce(schema_name,'')) LIKE ANY($1::text[]) OR lower(coalesce(metadata::text,'')) LIKE ANY($1::text[]) ORDER BY qualified_name LIMIT 10",
      [patterns]
    );
    const sources = rows.map(row => ({ title: row.name, type: row.type, schema: row.schema_name, owner: row.owner_name, description: row.description, match: 'Keyword match in persisted metadata' }));
    const answer = sources.length
      ? 'Found ' + sources.length + ' persisted catalog asset' + (sources.length === 1 ? '' : 's') + ' matching words in your question. This is keyword search over stored metadata, not semantic/RAG retrieval; matching assets are not proof of lineage or runtime behavior.'
      : 'No persisted catalog assets matched those words. Try a shorter asset name, schema, type, owner, description, or metadata term. No demo assets were substituted.';
    return res.json({ ok: true, mode: 'persisted_keyword_search', answer, sources });
  } catch (error) {
    return res.status(500).json({ error: 'Catalog search failed. Check the authorized workspace session and persisted catalog availability.' });
  }
}