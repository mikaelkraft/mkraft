const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { getJsonBody } = require('../_lib/body.js');
const { getUserWithRole, requireAdmin } = require('../_lib/auth.js');

async function loadRules() {
  const { rows } = await query('SELECT field_name, enabled, editable_roles, required FROM wisdomintech.profile_field_rules', []);
  const map = {};
  rows.forEach(r => { map[r.field_name] = r; });
  return map;
}

module.exports = async function handler(req, res) {
  try {
    const url = getUrl(req);
    if (req.method === 'GET') {
      const me = await getUserWithRole(req);
      if (!me) return error(res, 'Unauthorized', 401);
      const targetId = url.searchParams.get('userId') && me.role === 'admin' ? url.searchParams.get('userId') : me.id;
      const { rows } = await query(`SELECT id, email, full_name, avatar_url, role, bio, website_url, twitter_handle, github_handle, linkedin_handle, location, headline, profile_meta, banned, warning_count FROM wisdomintech.user_profiles WHERE id = $1`, [targetId]);
      if (!rows.length) return error(res, 'Not found', 404);
      const rules = await loadRules();
      // Filter out disabled fields for non-admin
      const profile = rows[0];
      if (me.role !== 'admin') {
        Object.keys(rules).forEach(field => {
          if (!rules[field].enabled) delete profile[field];
        });
      }
      return json(res, { profile, editable_fields: Object.entries(rules).filter(([k,v]) => v.enabled && v.editable_roles.includes(me.role)).map(([k]) => k) });
    }
    if (req.method === 'PUT') {
      const me = await getUserWithRole(req);
      if (!me) return error(res, 'Unauthorized', 401);
      const body = await getJsonBody(req);
      const rules = await loadRules();
      const targetUserId = body.userId && me.role === 'admin' ? body.userId : me.id;
      // Build update
      const allowedFields = ['full_name','bio','website_url','twitter_handle','github_handle','linkedin_handle','location','headline','profile_meta'];
      const sets = []; const params = [targetUserId]; let i = 2;
      for (const f of allowedFields) {
        if (!(f in body)) continue;
        const rule = rules[f];
        if (!rule || !rule.enabled) continue; // skip disabled entirely
        if (me.role !== 'admin' && !(rule.editable_roles || []).includes(me.role)) continue;
        sets.push(`${f} = $${i}`); params.push(body[f]); i++;
      }
      if (!sets.length) return error(res, 'No editable fields in payload', 400);
      sets.push('updated_at = now()');
      const sql = `UPDATE wisdomintech.user_profiles SET ${sets.join(', ')} WHERE id = $1 RETURNING id, email, full_name, avatar_url, role, bio, website_url, twitter_handle, github_handle, linkedin_handle, location, headline, profile_meta`;
      const { rows } = await query(sql, params);
      if (!rows.length) return error(res, 'Not found', 404);
      return json(res, rows[0]);
    }
    return error(res, 'Method not allowed', 405);
  } catch (e) {
    return error(res, 'Failed to process profile', 500, { detail: e.message });
  }
};
