const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { requireAdmin } = require('../_lib/auth.js');

// Admin moderation endpoints:
// GET    /api/comments/moderate?status=pending|approved|all -> list (default pending)
// PUT    /api/comments/moderate?id=... { is_approved: boolean }
// DELETE /api/comments/moderate?id=...
module.exports = async function handler(req, res) {
  try {
    const user = await requireAdmin(req, res);
    if (!user) return; // unauthorized already handled

    const url = getUrl(req);
    const id = url.searchParams.get('id');

    if (req.method === 'GET') {
      const status = (url.searchParams.get('status') || 'pending').toLowerCase();
      let sql;
      switch (status) {
        case 'approved':
          sql = `SELECT * FROM wisdomintech.comments WHERE is_approved = true ORDER BY created_at DESC LIMIT 200`;
          break;
        case 'pending':
          sql = `SELECT * FROM wisdomintech.comments WHERE is_approved = false ORDER BY created_at DESC LIMIT 200`;
          break;
        case 'all':
          sql = `SELECT * FROM wisdomintech.comments ORDER BY created_at DESC LIMIT 200`;
          break;
        default:
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
      let data;
      try { data = JSON.parse(body || '{}'); } catch { return error(res, 'Invalid JSON body', 400); }
      if (typeof data.is_approved !== 'boolean') return error(res, 'is_approved boolean required', 400);
      const { rows } = await query(`UPDATE wisdomintech.comments SET is_approved=$2, updated_at=now() WHERE id=$1 RETURNING *`, [id, data.is_approved]);
      if (!rows.length) return error(res, 'Not found', 404);
      return json(res, rows[0]);
    }

    if (req.method === 'DELETE') {
      if (!id) return error(res, 'id is required', 400);
      const { rows } = await query(`DELETE FROM wisdomintech.comments WHERE id=$1 RETURNING id`, [id]);
      if (!rows.length) return error(res, 'Not found', 404);
      return json(res, { deleted: true, id: rows[0].id });
    }

    return error(res, 'Method not allowed', 405);
  } catch (e) {
    console.error('comments/moderate error', e);
    return error(res, 'Internal server error', 500);
  }
};
