const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');

// GET /api/blog/search?q=...&limit=10
module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'GET') return error(res, 'Method not allowed', 405);
    const url = getUrl(req);
    const q = url.searchParams.get('q');
    const limit = Math.min(Number(url.searchParams.get('limit') || 20), 50);
    if (!q || !q.trim()) return json(res, []);
    const term = q.trim();
    // plainto_tsquery for simplicity; upgrade to websearch_to_tsquery later for operators
    const sql = `
      SELECT id, slug, title, excerpt, published_at,
             ts_rank_cd(search_vector, plainto_tsquery('english', $1)) AS rank
      FROM wisdomintech.blog_posts
      WHERE status = 'published'
        AND search_vector @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC, published_at DESC NULLS LAST
      LIMIT $2
    `;
    const { rows } = await query(sql, [term, limit]);
    return json(res, rows.map(r => ({ ...r, rank: Number(r.rank) })));
  } catch (e) {
    return error(res, 'Search failed', 500, { detail: e.message });
  }
};
