const { json, error, getUrl } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { rateLimit } = require("../_lib/rateLimit.js");
const { sanitize } = require("../_lib/sanitize.js");

// GET /api/comments?postId=uuid -> returns top-level comments with replies
// POST /api/comments -> create new comment or reply
const postLimiter = rateLimit({ windowMs: 60_000, max: 20 });

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const url = getUrl(req);
      const postId = url.searchParams.get("postId");
      if (!postId) return error(res, "postId is required");

      const topSql = `
        SELECT c.*
        FROM wisdomintech.comments c
        WHERE c.blog_post_id = $1 AND c.is_approved = true AND c.parent_comment_id IS NULL
        ORDER BY c.created_at DESC
      `;
      const { rows: topLevel } = await query(topSql, [postId]);

      // Fetch replies for all comments
      const ids = topLevel.map((c) => c.id);
      let repliesByParent = {};
      if (ids.length) {
        const repSql = `
          SELECT c.*
          FROM wisdomintech.comments c
          WHERE c.parent_comment_id = ANY($1::uuid[])
          ORDER BY c.created_at ASC
        `;
        const { rows: replies } = await query(repSql, [ids]);
        repliesByParent = replies.reduce((acc, r) => {
          acc[r.parent_comment_id] = acc[r.parent_comment_id] || [];
          acc[r.parent_comment_id].push(r);
          return acc;
        }, {});
      }

      const payload = topLevel.map((c) => ({
        ...c,
        replies: repliesByParent[c.id] || [],
      }));
      return json(res, payload);
    }

    if (req.method === "POST") {
      let proceed = false;
      await new Promise((r) =>
        postLimiter(req, res, () => {
          proceed = true;
          r();
        }),
      );
      if (!proceed) return;
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      await new Promise((resolve) => req.on("end", resolve));
      const data = JSON.parse(body || "{}");

      const {
        blog_post_id,
        parent_comment_id = null,
        author_name,
        author_email,
        content,
      } = data;
      if (!blog_post_id || !author_name || !content) {
        return error(
          res,
          "blog_post_id, author_name and content are required",
          400,
        );
      }

      const ip = (req.headers["x-forwarded-for"] || "").split(",")[0] || null;
      const userAgent = req.headers["user-agent"] || "";

      const insertSql = `
        INSERT INTO wisdomintech.comments (blog_post_id, parent_comment_id, author_name, author_email, content, visitor_ip, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const cleanContent = sanitize(content).slice(0, 5000);
      const { rows } = await query(insertSql, [
        blog_post_id,
        parent_comment_id,
        author_name,
        author_email || null,
        cleanContent,
        ip,
        userAgent,
      ]);

      // Update blog post comment_count
      // Manual recount no longer needed (trigger handles approved changes); keep fallback recount for pending state only

      return json(res, rows[0], 201);
    }

    return error(res, "Method not allowed", 405);
  } catch (e) {
    return error(res, "Failed to handle comments", 500, { detail: e.message });
  }
};
