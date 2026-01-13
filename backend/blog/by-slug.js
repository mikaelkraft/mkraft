const { json, error, getUrl } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");

// GET /api/blog/by-slug?slug=...
module.exports = async function handler(req, res) {
  try {
    const url = getUrl(req);
    const slug = url.searchParams.get("slug");
    if (!slug) return error(res, "slug is required");

    const postSql = `
      SELECT 
        bp.id as post_id,
        bp.slug,
        bp.title,
        bp.excerpt,
        bp.content,
        bp.featured_image,
        bp.status,
        bp.published_at,
        bp.view_count,
        bp.like_count,
        bp.comment_count,
        bp.tags,
        json_build_object('full_name', up.full_name, 'email', up.email) as author,
        COALESCE(
          (
            SELECT json_agg(json_build_object(
              'id', c.id,
              'author_name', c.author_name,
              'author_email', c.author_email,
              'content', c.content,
              'created_at', c.created_at
            ) ORDER BY c.created_at DESC)
            FROM wisdomintech.comments c WHERE c.blog_post_id = bp.id AND c.is_approved = true
          ), '[]'::json
        ) AS comments
      FROM wisdomintech.blog_posts bp
      LEFT JOIN wisdomintech.user_profiles up ON up.id = bp.author_id
      WHERE bp.slug = $1
      LIMIT 1
    `;

    const { rows } = await query(postSql, [slug]);
    if (!rows || rows.length === 0) return error(res, "Not found", 404);
    return json(res, rows[0]);
  } catch (e) {
    return error(res, "Failed to load blog post", 500, { detail: e.message });
  }
};
