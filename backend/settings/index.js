const { json, error } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { requireAdmin } = require("../_lib/auth.js");
const { getJsonBody } = require("../_lib/body.js");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const sql = `SELECT * FROM wisdomintech.site_settings LIMIT 1`;
      const { rows } = await query(sql);
      const row = rows[0] || {};
      if (row.logo_url && !row.site_logo_url) row.site_logo_url = row.logo_url; // alias
      // Provide theme-specific fallback chain
      if (!row.logo_light_url)
        row.logo_light_url = row.site_logo_url || row.logo_url || null;
      if (!row.logo_dark_url)
        row.logo_dark_url = row.site_logo_url || row.logo_url || null;
      if (!row.og_default_image_url)
        row.og_default_image_url = row.site_logo_url || row.logo_url || null;
      // Backward compatibility: expose ui_settings / ads_settings aliases
      if (row.ui && !row.ui_settings) row.ui_settings = row.ui;
      if (row.ads && !row.ads_settings) row.ads_settings = row.ads;
      return json(res, row);
    }
    if (req.method === "PUT") {
      const user = await requireAdmin(req, res);
      if (!user) return;
      const body = await getJsonBody(req);
      // Accept both naming conventions
      if (body.ui_settings && !body.ui) body.ui = body.ui_settings;
      if (body.ads_settings && !body.ads) body.ads = body.ads_settings;
      const existing = await query(
        "SELECT id FROM wisdomintech.site_settings LIMIT 1",
      );
      if (existing.rows.length) {
        const updateSql = `UPDATE wisdomintech.site_settings SET site_title=$1, site_tagline=$2, site_description=$3, contact_email=$4, admin_email=$5, enable_video=$6, default_theme=$7, default_font_size=$8, logo_url=$9, favicon_url=$10, resume_url=$11, hero_image_url=$12, social_media=$13, seo_settings=$14, maintenance_mode=$15, custom_css=$16, custom_js=$17, ui=$18, ads=$19, logo_light_url=$20, logo_dark_url=$21, og_default_image_url=$22, updated_at=now() WHERE id=$23 RETURNING *`;
        const id = existing.rows[0].id;
        const params = [
          body.site_title || null,
          body.site_tagline || null,
          body.site_description || null,
          body.contact_email || null,
          body.admin_email || null,
          body.enable_video ?? null,
          body.default_theme || null,
          body.default_font_size || null,
          body.logo_url || null,
          body.favicon_url || null,
          body.resume_url || null,
          body.hero_image_url || null,
          body.social_media || null,
          body.seo_settings || null,
          body.maintenance_mode ?? null,
          body.custom_css || null,
          body.custom_js || null,
          body.ui || null,
          body.ads || null,
          body.logo_light_url || null,
          body.logo_dark_url || null,
          body.og_default_image_url || null,
          id,
        ];
        const { rows } = await query(updateSql, params);
        const out = rows[0];
        if (out.logo_url && !out.site_logo_url)
          out.site_logo_url = out.logo_url;
        if (!out.logo_light_url)
          out.logo_light_url = out.site_logo_url || out.logo_url;
        if (!out.logo_dark_url)
          out.logo_dark_url = out.site_logo_url || out.logo_url;
        if (!out.og_default_image_url)
          out.og_default_image_url = out.site_logo_url || out.logo_url;
        if (out.ui && !out.ui_settings) out.ui_settings = out.ui;
        if (out.ads && !out.ads_settings) out.ads_settings = out.ads;
        return json(res, out);
      } else {
        const insertSql = `INSERT INTO wisdomintech.site_settings (site_title, site_tagline, site_description, contact_email, admin_email, enable_video, default_theme, default_font_size, logo_url, favicon_url, resume_url, hero_image_url, social_media, seo_settings, maintenance_mode, custom_css, custom_js, ui, ads, logo_light_url, logo_dark_url, og_default_image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING *`;
        const params = [
          body.site_title || null,
          body.site_tagline || null,
          body.site_description || null,
          body.contact_email || null,
          body.admin_email || null,
          body.enable_video ?? null,
          body.default_theme || null,
          body.default_font_size || null,
          body.logo_url || null,
          body.favicon_url || null,
          body.resume_url || null,
          body.hero_image_url || null,
          body.social_media || null,
          body.seo_settings || null,
          body.maintenance_mode ?? null,
          body.custom_css || null,
          body.custom_js || null,
          body.ui || null,
          body.ads || null,
          body.logo_light_url || null,
          body.logo_dark_url || null,
          body.og_default_image_url || null,
        ];
        const { rows } = await query(insertSql, params);
        const out = rows[0];
        if (out.logo_url && !out.site_logo_url)
          out.site_logo_url = out.logo_url;
        if (!out.logo_light_url)
          out.logo_light_url = out.site_logo_url || out.logo_url;
        if (!out.logo_dark_url)
          out.logo_dark_url = out.site_logo_url || out.logo_url;
        if (!out.og_default_image_url)
          out.og_default_image_url = out.site_logo_url || out.logo_url;
        if (out.ui && !out.ui_settings) out.ui_settings = out.ui;
        if (out.ads && !out.ads_settings) out.ads_settings = out.ads;
        return json(res, out, 201);
      }
    }
    return error(res, "Method not allowed", 405);
  } catch (e) {
    return error(res, "Failed to handle settings", 500, { detail: e.message });
  }
};
