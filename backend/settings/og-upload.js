const { requireAdmin } = require("../_lib/auth");
const respond = require("../_lib/respond");
const db = require("../_lib/db");
const fs = require("fs");
const path = require("path");

module.exports = async function handler(req, res) {
  if (req.method !== "PUT") return respond.methodNotAllowed(res);
  const user = await requireAdmin(req, res);
  if (!user) return;
  try {
    const { image } = req.body || {};
    if (!image || typeof image !== "string")
      return respond.badRequest(res, "Missing image");

    let finalUrl = null;
    if (/^data:image\//i.test(image)) {
      // data URI
      const m = image.match(
        /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i,
      );
      if (!m) return respond.badRequest(res, "Invalid data URI");
      const ext = m[1].split("/")[1].replace("jpeg", "jpg");
      const buf = Buffer.from(m[2], "base64");
      const fileName = "og-default." + ext;
      const outDir = path.join(process.cwd(), "public", "assets", "images");
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, fileName);
      fs.writeFileSync(outPath, buf);
      finalUrl = "/assets/images/" + fileName + "?v=" + Date.now();
    } else if (/^https?:\/\//i.test(image)) {
      finalUrl = image;
    } else {
      return respond.badRequest(
        res,
        "Image must be https URL or base64 data URI",
      );
    }

    await db.query(
      `UPDATE site_settings SET og_default_image_url = $1, updated_at = now() WHERE id = 1`,
      [finalUrl],
    );
    return respond.ok(res, { og_default_image_url: finalUrl });
  } catch (e) {
    return respond.error(res, "Failed to update OG image");
  }
};
