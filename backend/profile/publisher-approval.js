const { json, error } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { requireAdmin } = require("../_lib/auth.js");
const { getJsonBody } = require("../_lib/body.js");
const { log } = require("../_lib/log.js");

// POST { user_id, action: 'approve'|'reject' }
module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return error(res, "Method not allowed", 405);
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const body = await getJsonBody(req);
    const { user_id, action } = body;
    if (!user_id || !["approve", "reject"].includes(action))
      return error(res, "Invalid payload", 400);
    // Capture previous state for auditing
    let previous = null;
    try {
      const prevRes = await query(
        "SELECT id, email, role, publisher_request_status FROM wisdomintech.user_profiles WHERE id = $1",
        [user_id],
      );
      previous = prevRes.rows[0] || null;
    } catch (e) {
      // non-fatal; continue
    }
    let sql, params;
    if (action === "approve") {
      sql = `UPDATE wisdomintech.user_profiles
             SET role = 'publisher', publisher_request_status = 'approved', role_updated_at = now()
             WHERE id = $1
             RETURNING id, email, role, publisher_request_status`;
      params = [user_id];
    } else {
      sql = `UPDATE wisdomintech.user_profiles
             SET publisher_request_status = 'rejected'
             WHERE id = $1
             RETURNING id, email, role, publisher_request_status`;
      params = [user_id];
    }
    const { rows } = await query(sql, params);
    if (!rows.length) return error(res, "Not found", 404);
    const updated = rows[0];
    // Structured audit log
    log.info("publisher_request_moderated", {
      action,
      moderator_id: admin.id,
      moderator_email: admin.email,
      target_user_id: updated.id,
      target_email: updated.email,
      previous_role: previous?.role || null,
      new_role: updated.role,
      previous_status: previous?.publisher_request_status || null,
      new_status: updated.publisher_request_status,
      requestId: req.id,
    });
    return json(res, updated);
  } catch (e) {
    log.error("publisher_request_moderated_error", {
      err: e.message,
      stack: e.stack,
      requestId: req.id,
    });
    return error(res, "Failed to process approval", 500, { detail: e.message });
  }
};
