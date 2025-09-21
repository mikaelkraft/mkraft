const { json, error } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');

module.exports = async function handler(_req, res) {
  try {
    const sql = `SELECT * FROM wisdomintech.site_settings LIMIT 1`;
    const { rows } = await query(sql);
    return json(res, rows[0] || {});
  } catch (e) {
    return error(res, 'Failed to load settings', 500, { detail: e.message });
  }
}
