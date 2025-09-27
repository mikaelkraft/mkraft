const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');

// Heuristic: related by tag overlap first, then fallback by simple title/excerpt keyword match
module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'GET') return error(res, 'Method not allowed', 405);
    const url = getUrl(req);
    const slug = url.searchParams.get('slug');
    if (!slug) return error(res, 'slug required', 400);
    // Get target post tags
    const { rows: targetRows } = await query(`SELECT id, tags FROM wisdomintech.blog_posts WHERE slug = $1 AND status = 'published' LIMIT 1`, [slug]);
    if (!targetRows.length) return json(res, []);
    const target = targetRows[0];
    const tagArray = target.tags || [];
    let related = [];
    if (tagArray.length) {
      const { rows } = await query(`
        SELECT id, slug, title, excerpt, tags
        FROM wisdomintech.blog_posts
        WHERE status = 'published'
          AND id <> $1
          AND tags && $2::text[]
        ORDER BY published_at DESC NULLS LAST
        LIMIT 5
      `, [target.id, tagArray]);
      related = rows;
    }
    // If not enough, fallback by naive keyword match in title/excerpt using first tag tokens
    if (related.length < 3) {
      const keywords = tagArray.slice(0, 3);
      if (keywords.length) {
        const likeClauses = keywords.map((_, i) => `(title ILIKE $${i + 2} OR excerpt ILIKE $${i + 2})`).join(' OR ');
        const params = [target.id, ...keywords.map(k => `%${k}%`)];
        const { rows: fallback } = await query(`
          SELECT id, slug, title, excerpt, tags
          FROM wisdomintech.blog_posts
          WHERE status = 'published'
            AND id <> $1
            AND (${likeClauses})
          ORDER BY published_at DESC NULLS LAST
          LIMIT 5
        `, params);
        // Merge ensuring uniqueness
        const map = new Map();
        [...related, ...fallback].forEach(r => map.set(r.id, r));
        related = Array.from(map.values());
      }
    }
    // Simple score: tag overlap count descending
    related.sort((a, b) => {
      const aOverlap = (a.tags || []).filter(t => tagArray.includes(t)).length;
      const bOverlap = (b.tags || []).filter(t => tagArray.includes(t)).length;
      return bOverlap - aOverlap;
    });
    return json(res, related.slice(0, 3));
  } catch (e) {
    return error(res, 'Failed to load related posts', 500, { detail: e.message });
  }
};
