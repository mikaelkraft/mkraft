const { json, error } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");

module.exports = async function handler(req, res) {
  const { snapshot } = require("../_lib/metrics");
  try {
    const start = Date.now();
    const { rows } = await query("SELECT 1 as ok");
    const dbLatencyMs = Date.now() - start;

    // Patch count + optional latest patch name (defensive: table might not exist yet)
    let patchInfo = { applied: 0 };
    try {
      const r = await query(
        "SELECT count(*)::int AS applied FROM wisdomintech.__applied_patches",
      );
      patchInfo.applied = r.rows[0].applied;
    } catch (_) {}

    // Version / commit info (env injected at build/deploy optionally)
    const version = process.env.APP_VERSION || "0.0.0";
    const commit =
      process.env.GIT_COMMIT || process.env.VERCEL_GIT_COMMIT_SHA || "unknown";

    const metrics = snapshot();
    return json(res, {
      status: "ok",
      db: rows[0]?.ok === 1 ? "up" : "unknown",
      dbLatencyMs,
      timestamp: new Date().toISOString(),
      version,
      commit,
      patches: patchInfo,
      metrics,
    });
  } catch (e) {
    return error(res, "Unhealthy", 500, { detail: e.message });
  }
};
