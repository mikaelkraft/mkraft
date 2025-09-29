const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { requireAdmin } = require('../_lib/auth.js');
const { getJsonBody } = require('../_lib/body.js');
const { ensureUserProfile } = require('../_lib/profile.js');
const { sanitize } = require('../_lib/sanitize.js');

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
             json_build_object('full_name', up.full_name, 'email', up.email, 'role', up.role) as author,
             up.role as author_role
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
      // Allow publishers (flag gated) & admins. Publishers always forced to draft & cannot set featured/published directly.
      const { requireAdmin, requirePublisherOrAdmin, getUserWithRole } = require('../_lib/auth.js');
      const { rows: flagRows } = await query('SELECT enabled FROM wisdomintech.feature_flags WHERE flag_key = $1', ['publisher_program']);
      const publisherProgramEnabled = !!flagRows.find(r => r.enabled);
      let user = null;
      if (publisherProgramEnabled) {
        user = await requirePublisherOrAdmin(req, res);
      } else {
        user = await requireAdmin(req, res); // legacy behavior before flag on
      }
      if (!user) return;
      if (user.banned) {
        return error(res, 'Account banned', 403, { reason: user.ban_reason || 'policy_violation' });
      }
      await ensureUserProfile(user);
  const body = await getJsonBody(req);
  if (body.content) {
    const { rows: settings } = await query('SELECT enable_video FROM wisdomintech.site_settings ORDER BY created_at DESC NULLS LAST LIMIT 1');
    const allowVideo = !!settings[0]?.enable_video;
    let processed = sanitize(body.content, { allowVideo });
    if (allowVideo) {
      // Wrap iframes in responsive container if not already wrapped
      processed = processed.replace(/<iframe([^>]*)><\/iframe>/g, '<iframe$1></iframe>'); // normalize empty
      processed = processed.replace(/<iframe([^>]*)><\/iframe>/g, '<iframe$1></iframe>');
      processed = processed.replace(/<iframe([\s\S]*?)<\/iframe>/g, (m) => {
        if (/class="[^"]*video-embed-container/.test(m)) return m; // already wrapped indirectly
        return `<div class="video-embed-container">${m}</div>`;
      });
    }
    body.content = processed;
  }
      const slug = (body.slug && String(body.slug).trim()) ? String(body.slug).trim().toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/(^-|-$)/g,'') : String(body.title || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
      let desiredStatus = body.status || 'draft';
      let publishedAt = body.published_at ? new Date(body.published_at) : (desiredStatus === 'published' ? new Date() : null);
      if (user.role === 'publisher' && publisherProgramEnabled) {
        // Enforce draft for publishers, ignore attempts to publish or feature
        desiredStatus = 'draft';
        publishedAt = null;
        body.featured = false;
      }
      const insertSql = `
        INSERT INTO wisdomintech.blog_posts (
          slug, title, excerpt, content, featured_image, source_url, tags, category, status, featured, author_id, published_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING *
      `;
      const params = [slug, body.title || '', body.excerpt || null, body.content || null, body.featured_image || null, body.source_url || null, body.tags || null, body.category || null, desiredStatus, !!body.featured, user.id, publishedAt];
      const { rows } = await query(insertSql, params);
      return json(res, rows[0], 201);
    }

    if (req.method === 'PUT') {
      const user = await requireAdmin(req, res);
      if (!user) return;
      const id = url.searchParams.get('id');
      if (!id) return error(res, 'id is required', 400);
      const body = await getJsonBody(req);
      // Capture existing row for revision BEFORE applying updates
      try {
        const existingRes = await query('SELECT * FROM wisdomintech.blog_posts WHERE id = $1', [id]);
        if (existingRes.rows.length) {
          const r = existingRes.rows[0];
          await query(`
            INSERT INTO wisdomintech.blog_post_revisions (
              blog_post_id, title, excerpt, content, tags, category, status, featured, featured_image, source_url, author_id
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          `, [r.id, r.title, r.excerpt, r.content, r.tags, r.category, r.status, r.featured, r.featured_image, r.source_url, r.author_id]);
        }
      } catch (revErr) {
        // Non-fatal: log but continue update
        console.error('revision_capture_failed', { id, message: revErr.message });
      }
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
  if ('content' in body) {
        const { rows: settings2 } = await query('SELECT enable_video FROM wisdomintech.site_settings ORDER BY created_at DESC NULLS LAST LIMIT 1');
        const allowVideo2 = !!settings2[0]?.enable_video;
        if (body.content) {
          let processed = sanitize(body.content, { allowVideo: allowVideo2 });
          if (allowVideo2) {
            processed = processed.replace(/<iframe([\s\S]*?)<\/iframe>/g, (m) => {
              if (/class="[^"]*video-embed-container/.test(m)) return m;
              return `<div class="video-embed-container">${m}</div>`;
            });
          }
          setField('content', processed);
        } else {
          setField('content', null);
        }
      }
      if ('featured_image' in body) setField('featured_image', body.featured_image);
      if ('source_url' in body) setField('source_url', body.source_url);
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
