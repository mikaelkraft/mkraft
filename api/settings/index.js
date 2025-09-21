import { json, error } from '../_lib/respond.js';
import { query } from '../_lib/db.js';

export async function GET() {
  try {
    const sql = `SELECT * FROM wisdomintech.site_settings LIMIT 1`;
    const { rows } = await query(sql);
    return json(rows[0] || {});
  } catch (e) {
    return error('Failed to load settings', 500, { detail: e.message });
  }
}
