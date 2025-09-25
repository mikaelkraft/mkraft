const { json, error } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { rateLimit } = require('../_lib/rateLimit.js');

const viewLimiter = rateLimit({ windowMs: 60_000, max: 120 });

module.exports = async function handler(req, res) {
  try {
  if (req.method !== 'POST') return error(res, 'Method not allowed', 405);
  let proceed = false; await new Promise(r => viewLimiter(req, res, () => { proceed = true; r(); })); if (!proceed) return;
    let body = '';
    req.on('data', c => body += c);
    await new Promise(r => req.on('end', r));
    const data = JSON.parse(body || '{}');
    const { content_type, content_id } = data;
    if (!content_type || !content_id) return error(res, 'content_type and content_id are required');

    let table = { project: 'projects', blog_post: 'blog_posts', hero_slide: 'hero_slides' }[content_type];
    if (!table) return error(res, 'invalid content_type', 400);
    await query(`UPDATE wisdomintech.${table} SET view_count = COALESCE(view_count,0) + 1 WHERE id = $1`, [content_id]);
    return json(res, { success: true });
  } catch (e) {
    return error(res, 'Failed to increment view', 500, { detail: e.message });
  }
}
