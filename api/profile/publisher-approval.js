const { json, error } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { requireAdmin } = require('../_lib/auth.js');
const { getJsonBody } = require('../_lib/body.js');

// POST { user_id, action: 'approve'|'reject' }
module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') return error(res, 'Method not allowed', 405);
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const body = await getJsonBody(req);
    const { user_id, action } = body;
    if (!user_id || !['approve','reject'].includes(action)) return error(res, 'Invalid payload', 400);
    let sql, params;
    if (action === 'approve') {
      sql = `UPDATE wisdomintech.user_profiles
             SET role = 'publisher', publisher_request_status = 'approved', role_updated_at = now()
             WHERE id = $1
             RETURNING id, email, role, publisher_request_status`;
      params = [user_id];
    } else {
      sql = `UPDATE wisdomintech.user_profiles
             SET publisher_request_status = 'rejected'
             WHERE id = $1
             RETURNING id, email, role, publisher_request_status`;
      params = [user_id];
    }
    const { rows } = await query(sql, params);
    if (!rows.length) return error(res, 'Not found', 404);
    return json(res, rows[0]);
  } catch (e) {
    return error(res, 'Failed to process approval', 500, { detail: e.message });
  }
};
