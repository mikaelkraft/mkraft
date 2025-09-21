const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');

module.exports = async function handler(req, res) {
  try {
    const url = getUrl(req);
    const published = url.searchParams.get('published');
    const where = published === 'true' ? "WHERE status = 'published'" : '';

    const sql = `
      SELECT * FROM wisdomintech.hero_slides
      ${where}
      ORDER BY display_order ASC
    `;

    const { rows } = await query(sql);
    return json(res, rows);
  } catch (e) {
    return error(res, 'Failed to load slides', 500, { detail: e.message });
  }
}
