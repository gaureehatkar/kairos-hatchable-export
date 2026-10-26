import { db } from 'hatchable';

export const access = 'public';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { event_type, source, payload, timestamp } = req.body || {};

  if (!event_type || !source) {
    return res.status(400).json({ error: 'Missing required fields: event_type and source are required.' });
  }

  try {
    // Ensure table exists safely or insert into raw_events if present, else fallback to ingestion log
    await db.query(`
      CREATE TABLE IF NOT EXISTS webhook_events (
        id SERIAL PRIMARY KEY,
        event_type TEXT NOT NULL,
        source TEXT NOT NULL,
        payload JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await db.query(
      `INSERT INTO webhook_events (event_type, source, payload, created_at) VALUES ($1, $2, $3::jsonb, COALESCE($4::timestamp, NOW()))`,
      [event_type, source, JSON.stringify(payload || {}), timestamp || null]
    );

    return res.json({
      ok: true,
      message: 'Webhook received and ingested successfully.',
      received_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Webhook ingestion error:', err);
    return res.status(500).json({ error: 'Internal server error while processing webhook.' });
  }
}