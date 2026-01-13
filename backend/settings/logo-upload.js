const { json, error } = require("../_lib/respond.js");
const { requireAdmin } = require("../_lib/auth.js");
const { getJsonBody } = require("../_lib/body.js");
const { query } = require("../_lib/db.js");
const fs = require("fs");
const path = require("path");

// PUT /api/settings/logo-upload { light: base64?|url, dark: base64?|url }
// Accepts either absolute URL (http/https) or data URI (data:image/png;base64,...)
// Saves files into public/assets/images/ with deterministic names (logo-light.ext, logo-dark.ext)
module.exports = async function handler(req, res) {
  try {
    if (req.method !== "PUT") return error(res, "Method not allowed", 405);
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const body = await getJsonBody(req);
    const out = {};

    const ensureDir = (p) => {
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    };
    const imagesDir = path.join(process.cwd(), "public", "assets", "images");
    ensureDir(imagesDir);

    async function handleVariant(kind, val) {
      if (!val) return null;
      if (/^https?:\/\//i.test(val)) {
        out[kind] = val;
        return val;
      }
      const m = /^data:(image\/(?:png|jpeg|jpg|gif|webp));base64,(.+)$/i.exec(
        val,
      );
      if (!m) throw new Error("Unsupported value for " + kind);
      const mime = m[1];
      const buf = Buffer.from(m[2], "base64");
      const ext = mime.split("/")[1].replace("jpeg", "jpg");
      const filename = `logo-${kind}.${ext}`;
      const filePath = path.join(imagesDir, filename);
      fs.writeFileSync(filePath, buf);
      const publicPath = `/assets/images/${filename}`;
      out[kind] = publicPath;
      return publicPath;
    }

    const lightUrl = await handleVariant("light", body.light);
    const darkUrl = await handleVariant("dark", body.dark);

    if (!lightUrl && !darkUrl)
      return error(res, "No logo variants provided", 400);

    const existing = await query(
      "SELECT id FROM wisdomintech.site_settings LIMIT 1",
    );
    if (existing.rows.length) {
      const id = existing.rows[0].id;
      const { rows } = await query(
        "UPDATE wisdomintech.site_settings SET logo_light_url = COALESCE($1, logo_light_url), logo_dark_url = COALESCE($2, logo_dark_url), updated_at = now() WHERE id = $3 RETURNING logo_light_url, logo_dark_url",
        [lightUrl, darkUrl, id],
      );
      return json(res, { success: true, ...rows[0] });
    } else {
      const { rows } = await query(
        "INSERT INTO wisdomintech.site_settings (logo_light_url, logo_dark_url) VALUES ($1,$2) RETURNING logo_light_url, logo_dark_url",
        [lightUrl, darkUrl],
      );
      return json(res, { success: true, ...rows[0] }, 201);
    }
  } catch (e) {
    return error(res, "Failed to upload logos", 500, { detail: e.message });
  }
};
