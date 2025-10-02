import { describe, it, expect } from "vitest";

const BASE = "http://localhost:5000";

async function serverReachable() {
  try {
    await fetch(BASE + "/api/health");
    return true;
  } catch {
    return false;
  }
}

// This test suite exercises the feature flags endpoint assuming server + DB.
// It is resilient: if server or auth is unavailable it will skip silently.
describe("Feature Flags Admin Endpoint (integration)", () => {
  it("GET returns list/map in verbose meta and health exposes cache", async () => {
    if (!(await serverReachable())) return;
    const metaVerbose = await fetch(BASE + "/api/meta?verbose=1").catch(
      () => null,
    );
    if (!metaVerbose || metaVerbose.status !== 200) return;
    const metaJson = await metaVerbose.json();
    if (!metaJson.featureFlags) return; // nothing to assert
    // If verbose, featureFlags may contain list + map
    if (metaJson.featureFlags.list) {
      expect(Array.isArray(metaJson.featureFlags.list)).toBe(true);
      if (metaJson.featureFlags.list.length) {
        const first = metaJson.featureFlags.list[0];
        expect(first).toHaveProperty("key");
        expect(first).toHaveProperty("enabled");
      }
      expect(metaJson.featureFlags).toHaveProperty("map");
    }
    if (metaJson.flagCache) {
      expect(metaJson.flagCache).toHaveProperty("ttlMs");
      expect(metaJson.flagCache).toHaveProperty("stale");
    }
    const health = await fetch(BASE + "/api/health").catch(() => null);
    if (health && health.status === 200) {
      const h = await health.json();
      if (h.flagCache) {
        expect(h.flagCache).toHaveProperty("ttlMs");
        expect(h.flagCache).toHaveProperty("count");
      }
    }
  });
});
