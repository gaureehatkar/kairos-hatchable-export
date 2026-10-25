import { knowledge, ai } from 'hatchable';

export const methods = ['POST'];
export const access = 'public'; // since dashboard doesn't force member auth for reads in demo

export default async function (req, res) {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  const docs = knowledge.base('catalog', { dimensions: 1536 });

  // Retrieve relevant chunks
  const hits = await docs.search(question, { topK: 15 });

  if (!hits || hits.length === 0) {
    return res.json({
      answer: "I couldn't find any relevant catalog information to answer your question. Make sure you have imported metadata and run the knowledge sync.",
      sources: []
    });
  }

  // Build context block from hits
  const context = hits.map((h, i) =>
    `[${i + 1}] (${h.metadata.type === 'asset' ? h.metadata.name : (h.metadata.source + ' -> ' + h.metadata.target)})\n${h.text || h.metadata._text || ''}`
  ).join('\n\n');

  const sources = hits.map(h => ({
    title: h.metadata.type === 'asset' ? h.metadata.name : `${h.metadata.source} \u2192 ${h.metadata.target}`,
    type: h.metadata.type,
    score: Math.round((h.similarity || 0) * 100) + '%'
  }));

  // Generate answer with context
  const result = await ai.generateText({
    purpose: 'rag-answer',
    model: 'sonnet',
    messages: [
      {
        role: 'system',
        content: `You answer questions about data lineage, data assets, and catalog information using ONLY the provided context. Cite sources by their numbered tags ([1], [2], etc.). If the context doesn't contain the answer, say "I don't have enough information in the catalog to answer that."`
      },
      {
        role: 'user',
        content: `Context:\n\n${context}\n\nQuestion: ${question}`
      }
    ]
  });

  res.json({
    answer: result.text,
    sources,
    context_used: hits.length
  });
}