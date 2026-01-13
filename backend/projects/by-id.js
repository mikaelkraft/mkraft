const { json, error, getUrl } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");

// GET /api/projects/by-id?id=uuid
module.exports = async function (req, res) {
  try {
    const url = getUrl(req);
    const id = url.searchParams.get("id");
    if (!id) return error(res, "id is required");

    const sql = `
      SELECT p.*, 
             json_build_object('full_name', up.full_name, 'email', up.email) as author
      FROM wisdomintech.projects p
      LEFT JOIN wisdomintech.user_profiles up ON up.id = p.author_id
      WHERE p.id = $1
      LIMIT 1
    `;

    const { rows } = await query(sql, [id]);
    if (!rows || rows.length === 0) return error(res, "Not found", 404);
    return json(res, rows[0]);
  } catch (e) {
    return error(res, "Failed to load project", 500, { detail: e.message });
  }
};
