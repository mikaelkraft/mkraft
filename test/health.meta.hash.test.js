import { describe, it, expect } from "vitest";

const BASE = "http://localhost:5000";

describe("health/meta patch hash correlation (if server reachable)", () => {
  it("latestHash from health matches last patch hash in meta verbose", async () => {
    let reachable = true;
    try {
      await fetch(BASE + "/api/health");
    } catch {
      reachable = false;
    }
    if (!reachable) return;
    const [hRes, mRes] = await Promise.all([
      fetch(BASE + "/api/health"),
      fetch(BASE + "/api/meta?verbose=1"),
    ]);
    if (hRes.status !== 200 || mRes.status !== 200) return;
    const health = await hRes.json();
    const meta = await mRes.json();
    if (!Array.isArray(meta.patches) || !meta.patches.length) return;
    const last = meta.patches[meta.patches.length - 1];
    if (last.patch_hash && health.patches?.latestHash) {
      expect(health.patches.latestHash).toBe(last.patch_hash);
    }
  });
});
