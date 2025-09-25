const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { requireAdmin, verifyAuth } = require('../_lib/auth.js');
const { getJsonBody } = require('../_lib/body.js');

// PUT /api/profile/avatar { url }
// Admin can set any user's avatar via ?userId=uuid, normal user sets own.
module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'PUT') return error(res, 'Method not allowed', 405);
    const urlObj = getUrl(req);
    const targetUserId = urlObj.searchParams.get('userId');
    let acting = null;
    // Try normal auth first
    const { user } = await verifyAuth(req);
    acting = user;
    let allow = false;
    if (targetUserId) {
      // Need admin to set another user's avatar
      const admin = await requireAdmin(req, res);
      if (!admin) return; // response already sent
      allow = true;
    } else if (acting) {
      allow = true;
    }
    if (!allow) return error(res, 'Unauthorized', 401);
    const body = await getJsonBody(req);
    if (!body.url) return error(res, 'url required', 400);
    const userId = targetUserId || acting.id;
    const { rows } = await query(`UPDATE wisdomintech.user_profiles SET avatar_url=$2, updated_at=now() WHERE id=$1 RETURNING id, avatar_url`, [userId, body.url]);
    if (!rows.length) return error(res, 'Profile not found', 404);
    return json(res, rows[0]);
  } catch (e) {
    return error(res, 'Failed to update avatar', 500, { detail: e.message });
  }
};
