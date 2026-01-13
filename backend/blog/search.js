const { json, error, getUrl } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { logRequestMetric } = require("../_lib/metrics.js"); // assume metrics helper exists (Track 1)

// GET /api/blog/search?q=...&limit=10
module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") return error(res, "Method not allowed", 405);
    const url = getUrl(req);
    const q = url.searchParams.get("q");
    const limit = Math.min(Number(url.searchParams.get("limit") || 20), 50);
    if (!q || !q.trim()) return json(res, []);
    const term = q.trim();
    // Use websearch_to_tsquery for more natural query operator support.
    // Weighted ranking: give higher weight to title (A) vs content (B/C) when computing rank.
    // Provide snippet using ts_headline for basic highlighting (HTML safe output assumed; will sanitize client side).
    const sql = `
      WITH q AS (SELECT websearch_to_tsquery('english', $1) AS tsq)
      SELECT bp.id, bp.slug, bp.title, bp.excerpt, bp.published_at,
             ts_rank_cd(bp.search_vector, q.tsq, 32) * 1.0 +
             (CASE WHEN bp.title ILIKE '%' || $1 || '%' THEN 0.25 ELSE 0 END) AS rank,
             ts_headline('english', COALESCE(bp.excerpt, '' ) || ' ' || COALESCE(bp.content, ''), q.tsq, 'StartSel=<mark>,StopSel=</mark>,MaxFragments=2,FragmentDelimiter= … ') AS snippet
      FROM wisdomintech.blog_posts bp CROSS JOIN q
      WHERE bp.status = 'published'
        AND q.tsq @@ bp.search_vector
      ORDER BY rank DESC, bp.published_at DESC NULLS LAST
      LIMIT $2
    `;
    const { rows } = await query(sql, [term, limit]);
    logRequestMetric &&
      logRequestMetric("search", { qlen: term.length, results: rows.length });
    return json(
      res,
      rows.map((r) => ({ ...r, rank: Number(r.rank) })),
    );
  } catch (e) {
    return error(res, "Search failed", 500, { detail: e.message });
  }
};
