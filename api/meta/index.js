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
    const verbose = /(?:^|[?&])verbose=1/.test(req.originalUrl);

    // Applied patches
    let patches = [];
    try {
      const r = await query(
        "SELECT patch_name, applied_at FROM wisdomintech.__applied_patches ORDER BY applied_at ASC",
      );
      patches = r.rows;
    } catch (_) {}

    let featureFlags = {};
    let flagCount = 0;
    try {
      const r = await query(
        "SELECT flag_key as key, enabled, note, updated_at FROM wisdomintech.feature_flags ORDER BY flag_key ASC",
      );
      featureFlags = Object.fromEntries(r.rows.map((r) => [r.key, r.enabled]));
      flagCount = r.rows.length;
      if (verbose) featureFlags = { list: r.rows, map: featureFlags };
    } catch (_) {
      try {
        const r2 = await query(
          "SELECT ui FROM wisdomintech.site_settings LIMIT 1",
        );
        if (r2.rows[0]?.ui && r2.rows[0].ui.featureFlags) {
          featureFlags = r2.rows[0].ui.featureFlags;
          flagCount = Object.keys(featureFlags).length;
        }
      } catch (_) {}
    }

    const payload = {
      status: "ok",
      version,
      commit,
      patches,
      featureFlags,
      flagCount,
      timestamp: new Date().toISOString(),
    };
    if (verbose) {
      try {
        const { rows } = await query(
          "SELECT 'blog_posts'::text AS table, count(*)::int AS count FROM wisdomintech.blog_posts UNION ALL SELECT 'projects', count(*)::int FROM wisdomintech.projects",
        );
        payload.tableCounts = rows;
      } catch (_) {}
    }
    return json(res, payload);
  } catch (e) {
    return error(res, "Meta error", 500, { detail: e.message });
  }
};
