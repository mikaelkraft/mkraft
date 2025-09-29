const { json, error } = require('../../_lib/respond.js');
const { query } = require('../../_lib/db.js');
const { requireAdmin } = require('../../_lib/auth.js');

// GET /api/admin/users?search=...&limit=50
// Returns basic user listing with moderation fields
module.exports = async function handler(req, res) {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    if (req.method !== 'GET') return error(res, 'Method not allowed', 405);
  const { resolveBaseUrl } = require('../../_lib/respond.js');
  const url = new URL(req.url, resolveBaseUrl());
    const search = url.searchParams.get('search');
    const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);
    const conditions = [];
    const params = [];
    let i = 1;
    if (search) {
      conditions.push(`(email ILIKE $${i} OR full_name ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `SELECT id, email, full_name, role, publisher_request_status, banned, ban_reason, banned_at, warning_count, last_warning_at, created_at
                 FROM wisdomintech.user_profiles
                 ${where}
                 ORDER BY created_at DESC
                 LIMIT $${i}`;
    params.push(limit);
    const { rows } = await query(sql, params);
    return json(res, rows);
  } catch (e) {
    return error(res, 'Failed to list users', 500, { detail: e.message });
  }
};
