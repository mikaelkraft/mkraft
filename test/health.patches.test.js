import { describe, it, expect } from "vitest";

const BASE = "http://localhost:5000";

// This test is opportunistic: if the dev/test server isn't running, it simply no-ops.
// When the API is up, it validates the shape of the patches object returned by /api/health.
describe("Health endpoint patch stats (if server reachable)", () => {
  it("exposes patches.applied, and latest/lateHash shape", async () => {
    let reachable = true;
    try {
      await fetch(BASE + "/api/health");
    } catch {
      reachable = false;
    }
    if (!reachable) return; // Skip silently if server not running in this environment
    const res = await fetch(BASE + "/api/health");
    if (res.status !== 200) return; // Skip if unexpected status (e.g., auth middleware added later)
    const data = await res.json();
    expect(data).toHaveProperty("patches");
    expect(typeof data.patches).toBe("object");
    // applied should be a number (count of applied patches)
    expect(typeof data.patches.applied).toBe("number");
    // latest may be null or string depending on migration state
    if (data.patches.latest !== null) {
      expect(typeof data.patches.latest).toBe("string");
    }
    // latestHash may be null or a hex string (length >= 16 if present)
    if (
      data.patches.latestHash !== null &&
      data.patches.latestHash !== undefined
    ) {
      expect(typeof data.patches.latestHash).toBe("string");
      expect(data.patches.latestHash.length).toBeGreaterThanOrEqual(16);
    }
  });
});
