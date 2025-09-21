import { json, error } from '../_lib/respond.js';
import { query } from '../_lib/db.js';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const published = url.searchParams.get('published');
    const where = published === 'true' ? "WHERE status = 'published'" : '';

    const sql = `
      SELECT * FROM wisdomintech.hero_slides
      ${where}
      ORDER BY display_order ASC
    `;

    const { rows } = await query(sql);
    return json(rows);
  } catch (e) {
    return error('Failed to load slides', 500, { detail: e.message });
  }
}
