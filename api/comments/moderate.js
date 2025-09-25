const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { requireAdmin } = require('../_lib/auth.js');

// Admin moderation endpoints:
// GET /api/comments/moderate?status=pending|approved -> list
// PUT /api/comments/moderate?id=... { is_approved: boolean }
// DELETE /api/comments/moderate?id=...
module.exports = async function handler(req, res) {
  try {
    const user = await requireAdmin(req, res);
    if (!user) return; // response already set
    const url = getUrl(req);
    const id = url.searchParams.get('id');

    if (req.method === 'GET') {
      const status = url.searchParams.get('status') || 'pending';
      let sql;
      if (status === 'approved') {
        sql = `SELECT * FROM wisdomintech.comments WHERE is_approved = true ORDER BY created_at DESC LIMIT 200`;
      } else if (status === 'pending') {
        // Pending = currently storing all as approved (future: if we switch default). For now, show recent.
        sql = `SELECT * FROM wisdomintech.comments ORDER BY created_at DESC LIMIT 200`;
      } else {
        return error(res, 'Invalid status', 400);
      }
      const { rows } = await query(sql);
      return json(res, rows);
    }

    if (req.method === 'PUT') {
      if (!id) return error(res, 'id is required', 400);
      let body = '';
      req.on('data', c => body += c);
      await new Promise(r => req.on('end', r));
      const data = JSON.parse(body || '{}');
      if (typeof data.is_approved !== 'boolean') return error(res, 'is_approved boolean required', 400);
      const { rows } = await query(`UPDATE wisdomintech.comments SET is_approved=$2, updated_at=now() WHERE id=$1 RETURNING *`, [id, data.is_approved]);
      if (!rows.length) return error(res, 'Not found', 404);
      return json(res, rows[0]);
    }

    if (req.method === 'DELETE') {
      if (!id) return error(res, 'id is required', 400);
      await query(`DELETE FROM wisdomintech.comments WHERE id=$1`, [id]);
      return json(res, { success: true });
    }

    return error(res, 'Method not allowed', 405);
  } catch (e) {
    return error(res, 'Failed to moderate comments', 500, { detail: e.message });
  }
}
