const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { requireAdmin } = require('../_lib/auth.js');
const { getJsonBody } = require('../_lib/body.js');
const { ensureUserProfile } = require('../_lib/profile.js');

// GET /api/blog?published=true&featured=true&limit=10
module.exports = async function handler(req, res) {
  try {
    const url = getUrl(req);
    const published = url.searchParams.get('published');
    const featured = url.searchParams.get('featured');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const tag = url.searchParams.get('tag');

    const conditions = [];
    const params = [];
    let i = 1;
    if (published === 'true') conditions.push("status = 'published'");
    if (featured === 'true') conditions.push('featured = true');
    if (category) {
      conditions.push(`category = $${i++}`);
      params.push(category);
    }
    if (search) {
      conditions.push(`(title ILIKE $${i} OR excerpt ILIKE $${i + 1} OR content ILIKE $${i + 2})`);
      const like = `%${search}%`;
      params.push(like, like, like);
      i += 3;
    }
    if (tag) {
      conditions.push(`tags @> ARRAY[$${i}]::text[]`);
      params.push(tag);
      i += 1;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const sql = `
      SELECT bp.*, 
             json_build_object('full_name', up.full_name, 'email', up.email) as author
      FROM wisdomintech.blog_posts bp
      LEFT JOIN wisdomintech.user_profiles up ON up.id = bp.author_id
      ${where}
      ORDER BY bp.published_at DESC NULLS LAST
      LIMIT $${i}
    `;

    const limit = Number(url.searchParams.get('limit') || 50);
    params.push(limit);
    if (req.method === 'GET') {
      const { rows } = await query(sql, params);
      return json(res, rows);
    }

    if (req.method === 'POST') {
      const user = await requireAdmin(req, res);
      if (!user) return;
      await ensureUserProfile(user);
      const body = await getJsonBody(req);
      const slug = (body.slug && String(body.slug).trim()) ? String(body.slug).trim().toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/(^-|-$)/g,'') : String(body.title || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
      const publishedAt = body.published_at ? new Date(body.published_at) : (body.status === 'published' ? new Date() : null);
      const insertSql = `
        INSERT INTO wisdomintech.blog_posts (
          slug, title, excerpt, content, featured_image, tags, category, status, featured, author_id, published_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *
      `;
      const params = [slug, body.title || '', body.excerpt || null, body.content || null, body.featured_image || null, body.tags || null, body.category || null, body.status || 'draft', !!body.featured, user.id, publishedAt];
      const { rows } = await query(insertSql, params);
      return json(res, rows[0], 201);
    }

    if (req.method === 'PUT') {
      const user = await requireAdmin(req, res);
      if (!user) return;
      const id = url.searchParams.get('id');
      if (!id) return error(res, 'id is required', 400);
      const body = await getJsonBody(req);
      let slugPart = '';
      const paramsUpdate = [id];
      let i = 2;
      const sets = [];
      const setField = (col, val) => { sets.push(`${col} = $${i++}`); paramsUpdate.push(val); };
      if (typeof body.slug === 'string') {
        const slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/(^-|-$)/g,'');
        setField('slug', slug);
      } else if (body.title) {
        const slug = String(body.title).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
        setField('slug', slug);
      }
      if ('title' in body) setField('title', body.title);
      if ('excerpt' in body) setField('excerpt', body.excerpt);
      if ('content' in body) setField('content', body.content);
      if ('featured_image' in body) setField('featured_image', body.featured_image);
      if ('tags' in body) setField('tags', body.tags);
      if ('category' in body) setField('category', body.category);
      if ('status' in body) setField('status', body.status);
      if ('featured' in body) setField('featured', body.featured);
      if ('published_at' in body) setField('published_at', body.published_at);
      sets.push('updated_at = now()');
      const updateSql = `UPDATE wisdomintech.blog_posts SET ${sets.join(', ')} WHERE id = $1 RETURNING *`;
      const { rows } = await query(updateSql, paramsUpdate);
      if (!rows.length) return error(res, 'Not found', 404);
      return json(res, rows[0]);
    }

    if (req.method === 'DELETE') {
      const user = await requireAdmin(req, res);
      if (!user) return;
      const id = url.searchParams.get('id');
      if (!id) return error(res, 'id is required', 400);
      await query('DELETE FROM wisdomintech.blog_posts WHERE id = $1', [id]);
      return json(res, { success: true });
    }

    return error(res, 'Method not allowed', 405);
  } catch (e) {
    return error(res, 'Failed to load blog posts', 500, { detail: e.message });
  }
}
