const { json, error, getUrl } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { requireAdmin } = require("../_lib/auth.js");
const { getJsonBody } = require("../_lib/body.js");
const { ensureUserProfile } = require("../_lib/profile.js");

// GET /api/projects?published=true|false&featured=true|false
module.exports = async function handler(req, res) {
  try {
    const url = getUrl(req);
    const published = url.searchParams.get("published");
    const featured = url.searchParams.get("featured");

    const conditions = [];
    if (published === "true") conditions.push("status = 'published'");
    if (featured === "true") conditions.push("featured = true");

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
    const sql = `
      SELECT p.*, 
             json_build_object('full_name', up.full_name, 'email', up.email) as author
      FROM wisdomintech.projects p
      LEFT JOIN wisdomintech.user_profiles up ON up.id = p.author_id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT $1
    `;

    const limit = Number(url.searchParams.get("limit") || 100);
    if (req.method === "GET") {
      const { rows } = await query(sql, [limit]);
      return json(res, rows);
    }

    if (req.method === "POST") {
      const user = await requireAdmin(req, res);
      if (!user) return; // response sent
      await ensureUserProfile(user);
      const body = await getJsonBody(req);
      const insertSql = `
        INSERT INTO wisdomintech.projects (
          title, description, featured_image, gallery_images, type, video_url, video_poster,
          tags, category, status, featured, author_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING *
      `;
      const params = [
        body.title || "",
        body.description || null,
        body.featured_image || null,
        body.gallery_images || null,
        body.type || "image",
        body.video_url || null,
        body.video_poster || null,
        body.tags || null,
        body.category || null,
        body.status || "draft",
        !!body.featured,
        user.id,
      ];
      const { rows } = await query(insertSql, params);
      return json(res, rows[0], 201);
    }

    if (req.method === "PUT") {
      const user = await requireAdmin(req, res);
      if (!user) return;
      const id = url.searchParams.get("id");
      if (!id) return error(res, "id is required", 400);
      const body = await getJsonBody(req);
      const updateSql = `
        UPDATE wisdomintech.projects SET
          title = COALESCE($2, title),
          description = COALESCE($3, description),
          featured_image = COALESCE($4, featured_image),
          gallery_images = COALESCE($5, gallery_images),
          type = COALESCE($6, type),
          video_url = COALESCE($7, video_url),
          video_poster = COALESCE($8, video_poster),
          tags = COALESCE($9, tags),
          category = COALESCE($10, category),
          status = COALESCE($11, status),
          featured = COALESCE($12, featured),
          updated_at = now()
        WHERE id = $1
        RETURNING *
      `;
      const params = [
        id,
        body.title ?? null,
        body.description ?? null,
        body.featured_image ?? null,
        body.gallery_images ?? null,
        body.type ?? null,
        body.video_url ?? null,
        body.video_poster ?? null,
        body.tags ?? null,
        body.category ?? null,
        body.status ?? null,
        typeof body.featured === "boolean" ? body.featured : null,
      ];
      const { rows } = await query(updateSql, params);
      if (!rows.length) return error(res, "Not found", 404);
      return json(res, rows[0]);
    }

    if (req.method === "DELETE") {
      const user = await requireAdmin(req, res);
      if (!user) return;
      const id = url.searchParams.get("id");
      if (!id) return error(res, "id is required", 400);
      await query("DELETE FROM wisdomintech.projects WHERE id = $1", [id]);
      return json(res, { success: true });
    }

    return error(res, "Method not allowed", 405);
  } catch (e) {
    return error(res, "Failed to load projects", 500, { detail: e.message });
  }
};
