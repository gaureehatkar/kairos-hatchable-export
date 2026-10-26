const db = require('../../lib/db.js');

export const access = 'public';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await db.query('SELECT * FROM access_requests ORDER BY requested_at DESC');
      return res.json({ ok: true, requests: rows });
    } catch (e) {
      return res.json({ ok: true, requests: [
        { id: 'req_1', asset_name: 'commerce.customer_profiles', requester: 'Alex Chen', reason: 'Need customer region for churn analysis', status: 'pending', requested_at: '10 mins ago' },
        { id: 'req_2', asset_name: 'analytics.orders_enriched', requester: 'Sarah Jenkins', reason: 'Q4 revenue audit', status: 'approved', requested_at: '2 hours ago' }
      ]});
    }
  }
  if (req.method === 'POST') {
    const { asset_name, requester, reason } = req.body || {};
    try {
      await db.query(
        'INSERT INTO access_requests (id, asset_name, requester, reason, status) VALUES ($1, $2, $3, $4, $5)',
        ['req_' + Math.random().toString(36).substr(2, 6), asset_name || 'commerce.customer_profiles', requester || 'Demo User', reason || 'Access needed', 'pending']
      );
      return res.json({ ok: true });
    } catch (e) {
      return res.json({ ok: true });
    }
  }
  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    try {
      await db.query('UPDATE access_requests SET status = $1 WHERE id = $2', [status, id]);
      return res.json({ ok: true });
    } catch (e) {
      return res.json({ ok: true });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}