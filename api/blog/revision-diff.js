const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { requireAdmin } = require('../_lib/auth.js');

// GET /api/blog/revision-diff?revisionId=...  -> returns { before, after }
module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'GET') return error(res, 'Method not allowed', 405);
    const user = await requireAdmin(req, res);
    if (!user) return;
    const url = getUrl(req);
    const revisionId = url.searchParams.get('revisionId');
    if (!revisionId) return error(res, 'revisionId required', 400);
    const revRes = await query('SELECT * FROM wisdomintech.blog_post_revisions WHERE id = $1', [revisionId]);
    if (!revRes.rows.length) return error(res, 'Revision not found', 404);
    const rev = revRes.rows[0];
    const postRes = await query('SELECT * FROM wisdomintech.blog_posts WHERE id = $1', [rev.blog_post_id]);
    if (!postRes.rows.length) return error(res, 'Post not found', 404);
    // Truncate long content for transport optimization (UI may request full separately later)
    const truncate = (s) => s && s.length > 50000 ? s.slice(0, 50000) + '\n...[truncated]' : s;
    return json(res, {
      before: { title: postRes.rows[0].title, content: truncate(postRes.rows[0].content || ''), excerpt: postRes.rows[0].excerpt },
      after: { title: rev.title, content: truncate(rev.content || ''), excerpt: rev.excerpt },
      meta: { revision_id: rev.id, blog_post_id: rev.blog_post_id, created_at: rev.created_at }
    });
  } catch (e) {
    return error(res, 'Failed to diff revision', 500, { detail: e.message });
  }
};
