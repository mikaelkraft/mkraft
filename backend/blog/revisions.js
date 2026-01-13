const { json, error, getUrl } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { requireAdmin } = require("../_lib/auth.js");

// GET /api/blog/revisions?postId=...&limit=10
// POST /api/blog/revisions/restore  body: { revisionId }
module.exports = async function handler(req, res) {
  try {
    const url = getUrl(req);
    if (req.method === "GET") {
      const postId = url.searchParams.get("postId");
      const limit = Number(url.searchParams.get("limit") || 20);
      if (!postId) return error(res, "postId required", 400);
      const { rows } = await query(
        `
        SELECT id, blog_post_id, title, excerpt, created_at
        FROM wisdomintech.blog_post_revisions
        WHERE blog_post_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
        [postId, limit],
      );
      return json(res, rows);
    }

    if (req.method === "POST") {
      const user = await requireAdmin(req, res);
      if (!user) return;
      // Restore revision
      let body = "";
      await new Promise((resolve) => {
        req.on("data", (c) => (body += c));
        req.on("end", resolve);
      });
      let data = {};
      try {
        data = JSON.parse(body || "{}");
      } catch {}
      const revisionId = data.revisionId;
      if (!revisionId) return error(res, "revisionId required", 400);
      const revRes = await query(
        "SELECT * FROM wisdomintech.blog_post_revisions WHERE id = $1",
        [revisionId],
      );
      if (!revRes.rows.length) return error(res, "Revision not found", 404);
      const r = revRes.rows[0];
      // Update blog post with revision content
      const updateSql = `UPDATE wisdomintech.blog_posts
        SET title = $2, excerpt = $3, content = $4, tags = $5, category = $6, status = $7, featured = $8, featured_image = $9, source_url = $10, updated_at = now()
        WHERE id = $1 RETURNING *`;
      const updateParams = [
        r.blog_post_id,
        r.title,
        r.excerpt,
        r.content,
        r.tags,
        r.category,
        r.status,
        r.featured,
        r.featured_image,
        r.source_url,
      ];
      const updated = await query(updateSql, updateParams);
      return json(res, { restored: updated.rows[0] });
    }

    return error(res, "Method not allowed", 405);
  } catch (e) {
    return error(res, "Failed revisions operation", 500, { detail: e.message });
  }
};
