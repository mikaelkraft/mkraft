const { json, error } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { requireAdmin } = require('../_lib/auth.js');
const { getJsonBody } = require('../_lib/body.js');

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const sql = `SELECT * FROM wisdomintech.site_settings LIMIT 1`;
      const { rows } = await query(sql);
      return json(res, rows[0] || {});
    }
    if (req.method === 'PUT') {
      const user = await requireAdmin(req, res);
      if (!user) return;
      const body = await getJsonBody(req);
      const existing = await query('SELECT id FROM wisdomintech.site_settings LIMIT 1');
      if (existing.rows.length) {
        const updateSql = `UPDATE wisdomintech.site_settings SET site_title=$1, site_tagline=$2, site_description=$3, contact_email=$4, admin_email=$5, enable_video=$6, default_theme=$7, default_font_size=$8, logo_url=$9, favicon_url=$10, resume_url=$11, hero_image_url=$12, social_media=$13, seo_settings=$14, maintenance_mode=$15, custom_css=$16, custom_js=$17, ui=$18, ads=$19, updated_at=now() WHERE id=$20 RETURNING *`;
        const id = existing.rows[0].id;
        const params = [body.site_title||null, body.site_tagline||null, body.site_description||null, body.contact_email||null, body.admin_email||null, body.enable_video??null, body.default_theme||null, body.default_font_size||null, body.logo_url||null, body.favicon_url||null, body.resume_url||null, body.hero_image_url||null, body.social_media||null, body.seo_settings||null, body.maintenance_mode??null, body.custom_css||null, body.custom_js||null, body.ui||null, body.ads||null, id];
        const { rows } = await query(updateSql, params);
        return json(res, rows[0]);
      } else {
        const insertSql = `INSERT INTO wisdomintech.site_settings (site_title, site_tagline, site_description, contact_email, admin_email, enable_video, default_theme, default_font_size, logo_url, favicon_url, resume_url, hero_image_url, social_media, seo_settings, maintenance_mode, custom_css, custom_js, ui, ads) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`;
        const params = [body.site_title||null, body.site_tagline||null, body.site_description||null, body.contact_email||null, body.admin_email||null, body.enable_video??null, body.default_theme||null, body.default_font_size||null, body.logo_url||null, body.favicon_url||null, body.resume_url||null, body.hero_image_url||null, body.social_media||null, body.seo_settings||null, body.maintenance_mode??null, body.custom_css||null, body.custom_js||null, body.ui||null, body.ads||null];
        const { rows } = await query(insertSql, params);
        return json(res, rows[0], 201);
      }
    }
    return error(res, 'Method not allowed', 405);
  } catch (e) {
    return error(res, 'Failed to handle settings', 500, { detail: e.message });
  }
}
