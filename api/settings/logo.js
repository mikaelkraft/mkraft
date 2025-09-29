const { json, error } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { requireAdmin } = require('../_lib/auth.js');
const { getJsonBody } = require('../_lib/body.js');

// PUT /api/settings/logo { url: "https://..." }
// Optionally accept base64 in future; for now expect a stored URL (e.g., Supabase public URL)
module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'PUT') return error(res, 'Method not allowed', 405);
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const body = await getJsonBody(req);
    let { url } = body;
    if (!url || typeof url !== 'string') return error(res, 'url required', 400);
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) return error(res, 'url must be absolute http(s)', 400);
    // Upsert logic (single row semantics)
    const existing = await query('SELECT id FROM wisdomintech.site_settings LIMIT 1');
    if (existing.rows.length) {
      const { rows } = await query('UPDATE wisdomintech.site_settings SET logo_url=$1, site_logo_url=$1, updated_at=now() WHERE id=$2 RETURNING logo_url, site_logo_url', [url, existing.rows[0].id]);
      return json(res, { success: true, logo_url: rows[0].logo_url, site_logo_url: rows[0].site_logo_url });
    } else {
      const { rows } = await query('INSERT INTO wisdomintech.site_settings (logo_url, site_logo_url) VALUES ($1,$1) RETURNING logo_url, site_logo_url', [url]);
      return json(res, { success: true, logo_url: rows[0].logo_url, site_logo_url: rows[0].site_logo_url }, 201);
    }
  } catch (e) {
    return error(res, 'Failed to set logo', 500, { detail: e.message });
  }
};
