const { json, error } = require("../../_lib/respond.js");
const { query } = require("../../_lib/db.js");
const { requireAdmin } = require("../../_lib/auth.js");
const { log } = require("../../_lib/log.js");
const { getJsonBody } = require("../../_lib/body.js");

// POST { user_id, reason }
module.exports = async function handler(req, res) {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    if (req.method !== "POST") return error(res, "Method not allowed", 405);
    const body = await getJsonBody(req);
    const { user_id, reason } = body;
    if (!user_id) return error(res, "user_id required", 400);
    const sql = `UPDATE wisdomintech.user_profiles
                 SET warning_count = COALESCE(warning_count,0) + 1, last_warning_at = now()
                 WHERE id = $1
                 RETURNING id, email, warning_count, last_warning_at`;
    const { rows } = await query(sql, [user_id]);
    if (!rows.length) return error(res, "Not found", 404);
    const updated = rows[0];
    log.info("user_warned", {
      moderator_id: admin.id,
      moderator_email: admin.email,
      target_user_id: updated.id,
      reason: reason || null,
      warning_count: updated.warning_count,
      requestId: req.id,
    });
    return json(res, updated, 200);
  } catch (e) {
    log.error("user_warned_error", { err: e.message, requestId: req.id });
    return error(res, "Failed to warn user", 500, { detail: e.message });
  }
};
