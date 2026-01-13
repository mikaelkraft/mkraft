const { json, error, getUrl } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { requireAdmin } = require("../_lib/auth.js");
const { getJsonBody } = require("../_lib/body.js");

// GET  /api/settings/features          -> list flags
// POST /api/settings/features { flag_key, enabled?, note? } -> upsert (admin)
module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { rows } = await query(
        "SELECT flag_key, enabled, note, updated_at FROM wisdomintech.feature_flags ORDER BY flag_key",
      );
      return json(res, rows);
    }
    if (req.method === "POST") {
      const user = await requireAdmin(req, res);
      if (!user) return; // auth helper already responded
      const body = await getJsonBody(req);
      const key = body.flag_key || body.key;
      if (!key) return error(res, "flag_key required", 400);
      const enabled = typeof body.enabled === "boolean" ? body.enabled : true;
      const note = body.note || null;
      const upsertSql = `
        INSERT INTO wisdomintech.feature_flags (flag_key, enabled, note)
        VALUES ($1,$2,$3)
        ON CONFLICT (flag_key)
        DO UPDATE SET enabled = EXCLUDED.enabled, note = COALESCE(EXCLUDED.note, wisdomintech.feature_flags.note), updated_at = now()
        RETURNING flag_key, enabled, note, updated_at
      `;
      const { rows } = await query(upsertSql, [key, enabled, note]);
      return json(res, rows[0], 201);
    }
    return error(res, "Method not allowed", 405);
  } catch (e) {
    return error(res, "Failed to process feature flags request", 500, {
      detail: e.message,
    });
  }
};
