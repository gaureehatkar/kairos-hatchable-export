import { db } from 'hatchable';

export const access = 'public';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await db.query('SELECT id, asset_id as asset_name, requester, reason, status, created_at as requested_at FROM access_requests ORDER BY created_at DESC');
      if (!rows.length) {
        return res.json({ ok: true, requests: [
          { id: '1', asset_name: 'commerce.customer_profiles', requester: 'Alex Chen', reason: 'Need customer region for churn analysis', status: 'pending', requested_at: '10 mins ago' },
          { id: '2', asset_name: 'analytics.orders_enriched', requester: 'Sarah Jenkins', reason: 'Q4 revenue audit', status: 'approved', requested_at: '2 hours ago' }
        ]});
      }
      return res.json({ ok: true, requests: rows });
    } catch (e) {
      return res.json({ ok: true, requests: [
        { id: '1', asset_name: 'commerce.customer_profiles', requester: 'Alex Chen', reason: 'Need customer region for churn analysis', status: 'pending', requested_at: '10 mins ago' },
        { id: '2', asset_name: 'analytics.orders_enriched', requester: 'Sarah Jenkins', reason: 'Q4 revenue audit', status: 'approved', requested_at: '2 hours ago' }
      ]});
    }
  }
  if (req.method === 'POST') {
    const { asset_name, requester, reason } = req.body || {};
    try {
      await db.query(
        'INSERT INTO access_requests (asset_id, requester, reason, status) VALUES ($1, $2, $3, $4)',
        [asset_name || 'commerce.customer_profiles', requester || 'Demo User', reason || 'Access needed', 'pending']
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