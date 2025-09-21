const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');

// GET /api/blog?published=true&featured=true&limit=10
module.exports = async function handler(req, res) {
  try {
    const url = getUrl(req);
    const published = url.searchParams.get('published');
    const featured = url.searchParams.get('featured');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const tag = url.searchParams.get('tag');

    const conditions = [];
    const params = [];
    let i = 1;
    if (published === 'true') conditions.push("status = 'published'");
    if (featured === 'true') conditions.push('featured = true');
    if (category) {
      conditions.push(`category = $${i++}`);
      params.push(category);
    }
    if (search) {
      conditions.push(`(title ILIKE $${i} OR excerpt ILIKE $${i + 1} OR content ILIKE $${i + 2})`);
      const like = `%${search}%`;
      params.push(like, like, like);
      i += 3;
    }
    if (tag) {
      conditions.push(`tags @> ARRAY[$${i}]::text[]`);
      params.push(tag);
      i += 1;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const sql = `
      SELECT bp.*, 
             json_build_object('full_name', up.full_name, 'email', up.email) as author
      FROM wisdomintech.blog_posts bp
      LEFT JOIN wisdomintech.user_profiles up ON up.id = bp.author_id
      ${where}
      ORDER BY bp.published_at DESC NULLS LAST
      LIMIT $${i}
    `;

    const limit = Number(url.searchParams.get('limit') || 50);
    params.push(limit);
    const { rows } = await query(sql, params);
    return json(res, rows);
  } catch (e) {
    return error(res, 'Failed to load blog posts', 500, { detail: e.message });
  }
}
