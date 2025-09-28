const { json, error } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { requireAdmin } = require('../_lib/auth.js');

// Admin: list pending requests
module.exports = async function handler(req, res) {
  try {
    const user = await requireAdmin(req, res);
    if (!user) return;
    const { rows } = await query(`SELECT id, email, full_name, publisher_request_status, publisher_requested_at
                                  FROM wisdomintech.user_profiles
                                  WHERE publisher_request_status = 'pending'
                                  ORDER BY publisher_requested_at ASC NULLS LAST`);
    return json(res, rows);
  } catch (e) {
    return error(res, 'Failed to load publisher requests', 500, { detail: e.message });
  }
};
