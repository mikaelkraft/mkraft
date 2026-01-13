const { json, error, getUrl } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { requireAdmin } = require("../_lib/auth.js");
const { getJsonBody } = require("../_lib/body.js");

module.exports = async function handler(req, res) {
  try {
    const url = getUrl(req);
    const published = url.searchParams.get("published");
    const where = published === "true" ? "WHERE status = 'published'" : "";

    const sql = `
      SELECT * FROM wisdomintech.hero_slides
      ${where}
      ORDER BY display_order ASC
    `;

    if (req.method === "GET") {
      const { rows } = await query(sql);
      return json(res, rows);
    }

    if (req.method === "POST") {
      const user = await requireAdmin(req, res);
      if (!user) return;
      const body = await getJsonBody(req);
      const { rows: maxRow } = await query(
        "SELECT COALESCE(MAX(display_order),0)+1 as next FROM wisdomintech.hero_slides",
      );
      const next = maxRow?.[0]?.next || 1;
      const insertSql = `INSERT INTO wisdomintech.hero_slides (title, subtitle, image_url, cta_label, cta_url, status, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
      const { rows } = await query(insertSql, [
        body.title || null,
        body.subtitle || null,
        body.image_url || null,
        body.cta_label || null,
        body.cta_url || null,
        body.status || "published",
        body.display_order || next,
      ]);
      return json(res, rows[0], 201);
    }

    if (req.method === "PUT") {
      const user = await requireAdmin(req, res);
      if (!user) return;
      const id = url.searchParams.get("id");
      if (!id) return error(res, "id is required", 400);
      const body = await getJsonBody(req);
      const updateSql = `UPDATE wisdomintech.hero_slides SET title = COALESCE($2,title), subtitle = COALESCE($3,subtitle), image_url = COALESCE($4,image_url), cta_label = COALESCE($5,cta_label), cta_url = COALESCE($6,cta_url), status = COALESCE($7,status), display_order = COALESCE($8,display_order), updated_at = now() WHERE id = $1 RETURNING *`;
      const { rows } = await query(updateSql, [
        id,
        body.title ?? null,
        body.subtitle ?? null,
        body.image_url ?? null,
        body.cta_label ?? null,
        body.cta_url ?? null,
        body.status ?? null,
        body.display_order ?? null,
      ]);
      if (!rows.length) return error(res, "Not found", 404);
      return json(res, rows[0]);
    }

    if (req.method === "DELETE") {
      const user = await requireAdmin(req, res);
      if (!user) return;
      const id = url.searchParams.get("id");
      if (!id) return error(res, "id is required", 400);
      await query("DELETE FROM wisdomintech.hero_slides WHERE id = $1", [id]);
      return json(res, { success: true });
    }

    return error(res, "Method not allowed", 405);
  } catch (e) {
    return error(res, "Failed to load slides", 500, { detail: e.message });
  }
};
