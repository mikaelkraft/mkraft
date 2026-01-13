const { json, error } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { requireAdmin } = require("../_lib/auth.js");

// POST /api/slides/reorder { order: [ { id, display_order }, ... ] }
module.exports = async function handler(req, res) {
  try {
    const user = await requireAdmin(req, res);
    if (!user) return;
    if (req.method !== "POST") return error(res, "Method not allowed", 405);

    let body = "";
    req.on("data", (c) => (body += c));
    await new Promise((r) => req.on("end", r));
    const data = JSON.parse(body || "{}");
    if (!Array.isArray(data.order))
      return error(res, "order array required", 400);

    // Use a single transaction
    await query("BEGIN");
    try {
      for (const item of data.order) {
        if (!item.id || typeof item.display_order !== "number") continue;
        await query(
          `UPDATE wisdomintech.hero_slides SET display_order=$2, updated_at=now() WHERE id=$1`,
          [item.id, item.display_order],
        );
      }
      await query("COMMIT");
    } catch (e) {
      await query("ROLLBACK");
      throw e;
    }
    return json(res, { success: true });
  } catch (e) {
    return error(res, "Failed to reorder slides", 500, { detail: e.message });
  }
};
