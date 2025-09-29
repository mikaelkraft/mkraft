const { json, error } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { requireAdmin } = require('../_lib/auth.js');
const { getJsonBody } = require('../_lib/body.js');

// GET: list field rules (public; only enabled ones unless ?all=true by admin auth)
// POST (admin): upsert rules { field_name, enabled, editable_roles, required }
module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const allParam = (req.url || '').includes('all=true');
      let isAdmin = false;
      if (allParam) {
        const admin = await requireAdmin(req, { status: () => ({ json: () => {} }) });
        if (admin) isAdmin = true; // silent check; ignore failure
      }
      const sql = isAdmin && allParam ? 'SELECT * FROM wisdomintech.profile_field_rules ORDER BY field_name' : 'SELECT * FROM wisdomintech.profile_field_rules WHERE enabled = true ORDER BY field_name';
      const { rows } = await query(sql, []);
      return json(res, rows);
    }
    if (req.method === 'POST') {
      const admin = await requireAdmin(req, res);
      if (!admin) return; // response already sent
      const body = await getJsonBody(req);
      if (!body || !Array.isArray(body.rules)) return error(res, 'rules array required', 400);
      const results = [];
      for (const r of body.rules) {
        if (!r.field_name) continue;
        const { rows } = await query(`INSERT INTO wisdomintech.profile_field_rules (field_name, enabled, editable_roles, required)
          VALUES ($1,$2,COALESCE($3,ARRAY['admin','publisher','viewer']),COALESCE($4,false))
          ON CONFLICT (field_name) DO UPDATE SET enabled = EXCLUDED.enabled, editable_roles = EXCLUDED.editable_roles, required = EXCLUDED.required, updated_at = now()
          RETURNING *`, [r.field_name, r.enabled !== false, r.editable_roles || ['admin','publisher','viewer'], r.required === true]);
        results.push(rows[0]);
      }
      return json(res, { updated: results.length, rules: results });
    }
    return error(res, 'Method not allowed', 405);
  } catch (e) {
    return error(res, 'Failed to process field rules', 500, { detail: e.message });
  }
};
