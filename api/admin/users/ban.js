const { json, error } = require('../../_lib/respond.js');
const { query } = require('../../_lib/db.js');
const { requireAdmin } = require('../../_lib/auth.js');
const { log } = require('../../_lib/log.js');
const { getJsonBody } = require('../../_lib/body.js');

// POST { user_id, action: 'ban'|'unban', reason }
module.exports = async function handler(req, res) {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    if (req.method !== 'POST') return error(res, 'Method not allowed', 405);
    const body = await getJsonBody(req);
    const { user_id, action, reason } = body;
    if (!user_id || !['ban','unban'].includes(action)) return error(res, 'Invalid payload', 400);
    let sql, params;
    if (action === 'ban') {
      sql = `UPDATE wisdomintech.user_profiles
             SET banned = true, ban_reason = $2, banned_at = now()
             WHERE id = $1
             RETURNING id, email, banned, ban_reason, banned_at`;
      params = [user_id, reason || null];
    } else {
      sql = `UPDATE wisdomintech.user_profiles
             SET banned = false, ban_reason = NULL, banned_at = NULL
             WHERE id = $1
             RETURNING id, email, banned, ban_reason, banned_at`;
      params = [user_id];
    }
    const { rows } = await query(sql, params);
    if (!rows.length) return error(res, 'Not found', 404);
    const updated = rows[0];
    log.info('user_ban_status_change', {
      moderator_id: admin.id,
      moderator_email: admin.email,
      target_user_id: updated.id,
      target_email: updated.email,
      action,
      reason: reason || null,
      banned: updated.banned,
      requestId: req.id
    });
    return json(res, updated, 200);
  } catch (e) {
    log.error('user_ban_status_change_error', { err: e.message, requestId: req.id });
    return error(res, 'Failed to change ban status', 500, { detail: e.message });
  }
};
