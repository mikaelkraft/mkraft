const { json, error } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { requireAdmin } = require("../_lib/auth.js");
const { loadFlagsFresh, getFeatureFlags } = require("../_lib/featureFlags.js");

// GET /api/feature-flags -> list flags
// POST /api/feature-flags { key, enabled, note? } -> upsert (admin only)
module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const flags = await getFeatureFlags(true); // always refresh on explicit GET
      return json(res, { flags });
    }
    if (req.method === "POST") {
      const admin = await requireAdmin(req, res);
      if (!admin) return; // response already sent
      let body = "";
      req.on("data", (c) => (body += c));
      await new Promise((r) => req.on("end", r));
      let data = {};
      try {
        data = JSON.parse(body || "{}");
      } catch {
        return error(res, "Invalid JSON body", 400);
      }
      const { key, enabled, note } = data;
      if (!key || typeof enabled !== "boolean")
        return error(res, "key and enabled(boolean) required", 400);
      await query(
        `INSERT INTO wisdomintech.feature_flags (flag_key, enabled, note)
                   VALUES ($1, $2, COALESCE($3, note))
                   ON CONFLICT (flag_key) DO UPDATE SET enabled = EXCLUDED.enabled, note = COALESCE(EXCLUDED.note, wisdomintech.feature_flags.note), updated_at = now()`,
        [key, enabled, note || null],
      );
      await loadFlagsFresh();
      return json(res, { updated: { key, enabled, note: note || null } });
    }
    return error(res, "Method not allowed", 405);
  } catch (e) {
    return error(res, "Feature flags op failed", 500, { detail: e.message });
  }
};
