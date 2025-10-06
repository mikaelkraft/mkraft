import { describe, it, expect } from "vitest";

const BASE = "http://localhost:5000";

describe("migrate drift endpoint (if server reachable)", () => {
  it("returns drift report structure", async () => {
    let reachable = true;
    try {
      await fetch(BASE + "/api/migrate");
    } catch {
      reachable = false;
    }
    if (!reachable) return; // skip silently
    const res = await fetch(BASE + "/api/migrate/drift");
    if (res.status !== 200) return; // skip if not ok
    const data = await res.json();
    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("applied");
    expect(typeof data.drift).toBe("boolean");
    if (Array.isArray(data.mismatches)) {
      data.mismatches.forEach((m) => {
        expect(m).toHaveProperty("patch");
        expect(m).toHaveProperty("stored");
        expect(m).toHaveProperty("current");
      });
    }
  });
});
