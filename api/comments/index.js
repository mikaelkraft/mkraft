const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');

// GET /api/comments?postId=uuid -> returns top-level comments with replies
// POST /api/comments -> create new comment or reply
module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const url = getUrl(req);
      const postId = url.searchParams.get('postId');
      if (!postId) return error(res, 'postId is required');

      const topSql = `
        SELECT c.*
        FROM wisdomintech.comments c
        WHERE c.blog_post_id = $1 AND c.is_approved = true AND c.parent_comment_id IS NULL
        ORDER BY c.created_at DESC
      `;
      const { rows: topLevel } = await query(topSql, [postId]);

      // Fetch replies for all comments
      const ids = topLevel.map(c => c.id);
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

      const payload = topLevel.map(c => ({ ...c, replies: repliesByParent[c.id] || [] }));
      return json(res, payload);
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      await new Promise(resolve => req.on('end', resolve));
      const data = JSON.parse(body || '{}');

      const { blog_post_id, parent_comment_id = null, author_name, author_email, content } = data;
      if (!blog_post_id || !author_name || !content) {
        return error(res, 'blog_post_id, author_name and content are required', 400);
      }

      const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || null;
      const userAgent = req.headers['user-agent'] || '';

      const insertSql = `
        INSERT INTO wisdomintech.comments (blog_post_id, parent_comment_id, author_name, author_email, content, is_approved, visitor_ip, user_agent)
        VALUES ($1, $2, $3, $4, $5, true, $6::inet, $7)
        RETURNING *
      `;
      const { rows } = await query(insertSql, [blog_post_id, parent_comment_id, author_name, author_email || null, content, ip, userAgent]);

      // Update blog post comment_count
      const countSql = `
        UPDATE wisdomintech.blog_posts bp
        SET comment_count = (
          SELECT count(1) FROM wisdomintech.comments c WHERE c.blog_post_id = bp.id AND c.is_approved = true
        )
        WHERE bp.id = $1
      `;
      await query(countSql, [blog_post_id]);

      return json(res, rows[0], 201);
    }

    return error(res, 'Method not allowed', 405);
  } catch (e) {
    return error(res, 'Failed to handle comments', 500, { detail: e.message });
  }
}
