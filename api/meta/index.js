const { json, error } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const pkg = require("../../package.json");

// GET /api/meta
// Returns build + runtime metadata: version, commit, applied patches, feature flags snapshot
module.exports = async function handler(req, res) {
  try {
    const version = process.env.APP_VERSION || pkg.version || "0.0.0";
    const commit =
      process.env.GIT_COMMIT || process.env.VERCEL_GIT_COMMIT_SHA || "unknown";

    // Applied patches (defensive try)
    let patches = [];
    try {
      const r = await query(
        "SELECT patch_name, applied_at FROM wisdomintech.__applied_patches ORDER BY applied_at ASC",
      );
      patches = r.rows;
    } catch (_) {}

    // Feature flags: first try dedicated table, fallback to site_settings.ui JSON
    let featureFlags = {};
    try {
      const r = await query(
        "SELECT key, enabled FROM wisdomintech.feature_flags",
      );
      featureFlags = Object.fromEntries(r.rows.map((r) => [r.key, r.enabled]));
    } catch (_) {
      try {
        const r2 = await query(
          "SELECT ui FROM wisdomintech.site_settings LIMIT 1",
        );
        if (r2.rows[0]?.ui && r2.rows[0].ui.featureFlags) {
          featureFlags = r2.rows[0].ui.featureFlags;
        }
      } catch (_) {}
    }

    return json(res, {
      status: "ok",
      version,
      commit,
      patches,
      featureFlags,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return error(res, "Meta error", 500, { detail: e.message });
  }
};
