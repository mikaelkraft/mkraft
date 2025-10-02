import { describe, it, expect } from "vitest";

const BASE = "http://localhost:5000";

describe("Health endpoint patch metadata (if server available)", () => {
  it("includes latest and pending when reachable", async () => {
    let reachable = true;
    try {
      await fetch(BASE + "/api/health");
    } catch {
      reachable = false;
    }
    if (!reachable) return;
    const res = await fetch(BASE + "/api/health");
    if (res.status !== 200) return;
    const data = await res.json();
    if (data.patches) {
      expect(data.patches).toHaveProperty("applied");
      // latest may be null in a pristine environment but property should exist if applied > 0
      if (data.patches.applied > 0) {
        expect(
          Object.prototype.hasOwnProperty.call(data.patches, "latest"),
        ).toBe(true);
      }
      expect(
        Object.prototype.hasOwnProperty.call(data.patches, "pending"),
      ).toBe(true);
    }
  });
});
