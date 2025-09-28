const { json, error } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { getUserWithRole } = require('../_lib/auth.js');

// GET -> current request status & role
// POST -> initiate publisher request (if viewer)
module.exports = async function handler(req, res) {
  try {
    const user = await getUserWithRole(req);
    if (!user) return error(res, 'Unauthorized', 401);
    const { rows: flagRows } = await query('SELECT enabled FROM wisdomintech.feature_flags WHERE flag_key = $1', ['publisher_program']);
    const enabled = !!flagRows.find(r => r.enabled);
    if (!enabled) return error(res, 'Not found', 404); // hide when disabled

    if (req.method === 'GET') {
      return json(res, { role: user.role, publisher_request_status: user.publisher_request_status });
    }
    if (req.method === 'POST') {
      if (user.role !== 'viewer') {
        return json(res, { role: user.role, publisher_request_status: user.publisher_request_status }, 200);
      }
      if (user.publisher_request_status === 'pending') {
        return json(res, { role: user.role, publisher_request_status: 'pending' }, 200);
      }
      await query(`UPDATE wisdomintech.user_profiles
                   SET publisher_request_status = 'pending', publisher_requested_at = now()
                   WHERE id = $1`, [user.id]);
      return json(res, { role: 'viewer', publisher_request_status: 'pending' }, 201);
    }
    return error(res, 'Method not allowed', 405);
  } catch (e) {
    return error(res, 'Failed to process publisher request', 500, { detail: e.message });
  }
};
