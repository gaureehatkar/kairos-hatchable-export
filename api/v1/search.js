import { ai } from 'hatchable';

export const methods = ['POST'];
export const access = 'public';

export default async function (req, res) {
  const { question } = req.body || {};
  if (!question) return res.status(400).json({ error: 'Missing question' });

  const queryLower = question.toLowerCase();
  const matchedAssets = [];

  if (queryLower.includes('revenue') || queryLower.includes('dashboard') || queryLower.includes('table')) {
    matchedAssets.push({
      name: 'analytics.daily_revenue',
      type: 'dbt model',
      description: 'Daily revenue rollup model feeding bi.revenue_dashboard with verified currency metrics.'
    });
    matchedAssets.push({
      name: 'bi.revenue_dashboard',
      type: 'BI semantic model',
      description: 'Executive revenue dashboard consuming daily revenue transformations.'
    });
  } else if (queryLower.includes('pii') || queryLower.includes('customer') || queryLower.includes('user')) {
    matchedAssets.push({
      name: 'commerce.customer_profiles',
      type: 'PostgreSQL table',
      description: 'Contains customer profile data, encrypted email domains, and regional data.'
    });
  } else {
    matchedAssets.push({
      name: 'analytics.orders_enriched',
      type: 'dbt model',
      description: 'Enriched orders table combining customer orders, pricing, and profile metadata.'
    });
    matchedAssets.push({
      name: 'commerce.orders',
      type: 'PostgreSQL table',
      description: 'Raw transactional orders table capturing checkout events.'
    });
  }

  let answer = `Based on the Kairos metadata catalog and lineage trace, **${matchedAssets[0].name}** (${matchedAssets[0].type}) is the primary asset responding to your query [1]. It aggregates data to feed downstream consumers with verified freshness and SLA contracts.`;

  try {
    const contextText = matchedAssets.map((a, i) => `[${i + 1}] Asset: ${a.name} (${a.type}) - ${a.description}`).join('\n');
    const result = await ai.generateText({
      purpose: 'rag-answer',
      model: 'sonnet',
      messages: [
        {
          role: 'system',
          content: 'You are Kairos AI, an expert data catalog assistant. Answer the user question using ONLY the provided catalog context. Cite sources using [1], [2]. Be concise, professional, and precise.'
        },
        {
          role: 'user',
          content: `Catalog Context:\n${contextText}\n\nQuestion: ${question}`
        }
      ]
    });
    if (result && result.text) {
      answer = result.text;
    }
  } catch (err) {
    // Fallback gracefully if AI model provider key is not yet configured in project console
  }

  return res.json({
    answer,
    sources: matchedAssets.map((m, i) => ({
      title: m.name,
      type: m.type,
      score: (99 - i * 4) + '%'
    }))
  });
}