const { json, error } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { getFeatureFlags } = require("../_lib/featureFlags.js");

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

    // Process memory and uptime stats
    const mem = process.memoryUsage();
    const memory = {
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external,
    };
    const uptimeSec = Math.round(process.uptime());

    // Feature flag cache diagnostics (non-blocking)
    let flagCache = {};
    try {
      const flags = await getFeatureFlags(false);
      const ttlMs = Number(process.env.FEATURE_FLAGS_TTL_MS || 30000);
      const now = Date.now();
      const loadedAt =
        require("../_lib/featureFlags.js").__cache?.loadedAt || 0;
      flagCache = {
        count: Object.keys(flags).length,
        ttlMs,
        ageMs: loadedAt ? now - loadedAt : null,
        stale: loadedAt ? now - loadedAt > ttlMs : null,
      };
    } catch (_) {}

    return json(res, {
      status: "ok",
      db: rows[0]?.ok === 1 ? "up" : "unknown",
      dbLatencyMs,
      timestamp: new Date().toISOString(),
      version,
      commit,
      patches: patchInfo,
      metrics,
      memory,
      uptimeSec,
      flagCache,
    });
  } catch (e) {
    return error(res, "Unhealthy", 500, { detail: e.message });
  }
};
