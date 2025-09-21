import { json, error } from '../_lib/respond.js';
import { query } from '../_lib/db.js';

// GET /api/projects/by-id?id=uuid
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return error('id is required');

    const sql = `
      SELECT p.*, 
             json_build_object('full_name', up.full_name, 'email', up.email) as author
      FROM wisdomintech.projects p
      LEFT JOIN wisdomintech.user_profiles up ON up.id = p.author_id
      WHERE p.id = $1
      LIMIT 1
    `;

    const { rows } = await query(sql, [id]);
    if (!rows || rows.length === 0) return error('Not found', 404);
    return json(rows[0]);
  } catch (e) {
    return error('Failed to load project', 500, { detail: e.message });
  }
}
