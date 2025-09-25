const { json, error } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');

module.exports = async function handler(req, res) {
  try {
    const { rows } = await query('SELECT 1 as ok');
    return json(res, { status: 'ok', db: rows[0]?.ok === 1 ? 'up' : 'unknown', timestamp: new Date().toISOString() });
  } catch (e) {
    return error(res, 'Unhealthy', 500, { detail: e.message });
  }
}
