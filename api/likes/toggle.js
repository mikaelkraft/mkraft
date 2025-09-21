const { json, error } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') return error(res, 'Method not allowed', 405);
    let body = '';
    req.on('data', c => body += c);
    await new Promise(r => req.on('end', r));
    const data = JSON.parse(body || '{}');
    const { content_type, content_id, visitor_ip, user_agent } = data;
    if (!content_type || !content_id) return error(res, 'content_type and content_id are required');

    let cols = { project: 'projects', blog_post: 'blog_posts', hero_slide: 'hero_slides', comment: 'comments' };
    if (!cols[content_type]) return error(res, 'invalid content_type', 400);

    // Check if liked
    const checkSql = `SELECT id FROM wisdomintech.likes WHERE content_type=$1 AND ${content_type === 'project' ? 'project_id' : content_type === 'blog_post' ? 'blog_post_id' : content_type === 'hero_slide' ? 'slide_id' : 'comment_id'} = $2 AND visitor_ip = $3::inet`;
    const likeCol = content_type === 'project' ? 'project_id' : content_type === 'blog_post' ? 'blog_post_id' : content_type === 'hero_slide' ? 'slide_id' : 'comment_id';
    const { rows: existing } = await query(checkSql, [content_type, content_id, visitor_ip || null]);

    let liked;
    if (existing.length) {
      await query(`DELETE FROM wisdomintech.likes WHERE id = $1`, [existing[0].id]);
      liked = false;
    } else {
      await query(`INSERT INTO wisdomintech.likes (content_type, ${likeCol}, visitor_ip, user_agent) VALUES ($1,$2,$3::inet,$4)`, [content_type, content_id, visitor_ip || null, user_agent || '']);
      liked = true;
    }

    // Update aggregate like_count if column exists
    let table = cols[content_type];
    const aggSql = content_type === 'hero_slide' ?
      `UPDATE wisdomintech.${table} SET view_count = view_count WHERE id = $1` :
      `UPDATE wisdomintech.${table} SET like_count = (
        SELECT COUNT(1) FROM wisdomintech.likes WHERE content_type = $2 AND ${likeCol} = $1
      ) WHERE id = $1`;
    const params = content_type === 'hero_slide' ? [content_id] : [content_id, content_type];
    await query(aggSql, params);

    return json(res, { liked });
  } catch (e) {
    return error(res, 'Failed to toggle like', 500, { detail: e.message });
  }
}
