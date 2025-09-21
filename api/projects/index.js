const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');

// GET /api/projects?published=true|false&featured=true|false
module.exports = async function handler(req, res) {
  try {
    const url = getUrl(req);
    const published = url.searchParams.get('published');
    const featured = url.searchParams.get('featured');

    const conditions = [];
    if (published === 'true') conditions.push("status = 'published'");
    if (featured === 'true') conditions.push('featured = true');

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `
      SELECT p.*, 
             json_build_object('full_name', up.full_name, 'email', up.email) as author
      FROM wisdomintech.projects p
      LEFT JOIN wisdomintech.user_profiles up ON up.id = p.author_id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT $1
    `;

    const limit = Number(url.searchParams.get('limit') || 100);
    const { rows } = await query(sql, [limit]);
    return json(res, rows);
  } catch (e) {
    return error(res, 'Failed to load projects', 500, { detail: e.message });
  }
}
