import { json, error } from '../_lib/respond.js';
import { query } from '../_lib/db.js';

// GET /api/blog?published=true&featured=true&limit=10
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const published = url.searchParams.get('published');
    const featured = url.searchParams.get('featured');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const tag = url.searchParams.get('tag');

    const conditions = [];
    if (published === 'true') conditions.push("status = 'published'");
    if (featured === 'true') conditions.push('featured = true');
    if (category) conditions.push('category = $cat$' + category + '$cat$');
    if (search) {
      const q = `%${search}%`;
      conditions.push(`(title ILIKE $q$${q}$q$ OR excerpt ILIKE $q$${q}$q$ OR content ILIKE $q$${q}$q$)`);
    }
    if (tag) {
      conditions.push(`tags @> $tags$["${tag}"]$tags$`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const sql = `
      SELECT bp.*, 
             json_build_object('full_name', up.full_name, 'email', up.email) as author
      FROM wisdomintech.blog_posts bp
      LEFT JOIN wisdomintech.user_profiles up ON up.id = bp.author_id
      ${where}
      ORDER BY bp.published_at DESC NULLS LAST
      LIMIT $1
    `;

    const limit = Number(url.searchParams.get('limit') || 50);
    const { rows } = await query(sql, [limit]);
    return json(rows);
  } catch (e) {
    return error('Failed to load blog posts', 500, { detail: e.message });
  }
}
