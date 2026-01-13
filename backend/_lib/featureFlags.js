const { query } = require("./db");

let cache = {
  flags: {},
  loadedAt: 0,
};

const TTL_MS = Number(process.env.FEATURE_FLAGS_TTL_MS || 30000);

async function loadFlagsFresh() {
  // Attempt dedicated table first
  try {
    const res = await query(
      "SELECT flag_key as key, enabled FROM wisdomintech.feature_flags",
    );
    cache.flags = Object.fromEntries(res.rows.map((r) => [r.key, r.enabled]));
    cache.loadedAt = Date.now();
    return cache.flags;
  } catch (_) {
    // Fallback: site_settings.ui JSON path
    try {
      const res2 = await query(
        "SELECT ui FROM wisdomintech.site_settings LIMIT 1",
      );
      const ui = res2.rows[0]?.ui;
      if (ui && ui.featureFlags) {
        cache.flags = ui.featureFlags;
        cache.loadedAt = Date.now();
        return cache.flags;
      }
    } catch (_) {}
  }
  cache.loadedAt = Date.now();
  return cache.flags;
}

async function getFeatureFlags(force = false) {
  if (force || Date.now() - cache.loadedAt > TTL_MS) {
    return loadFlagsFresh();
  }
  return cache.flags;
}

function isEnabled(flag, defaultValue = false) {
  const v = cache.flags[flag];
  if (v === undefined || v === null) return defaultValue;
  return !!v;
}

module.exports = { getFeatureFlags, isEnabled, loadFlagsFresh, __cache: cache };
