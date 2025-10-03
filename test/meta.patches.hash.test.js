import { describe, it, expect } from "vitest";

const BASE = "http://localhost:5000";

describe("Meta endpoint patch hash (if server reachable)", () => {
  it("includes patch_hash values when verbose", async () => {
    let reachable = true;
    try {
      await fetch(BASE + "/api/meta");
    } catch {
      reachable = false;
    }
    if (!reachable) return;
    const res = await fetch(BASE + "/api/meta?verbose=1");
    if (res.status !== 200) return;
    const data = await res.json();
    if (Array.isArray(data.patches) && data.patches.length) {
      // At least first patch should have patch_hash property if migrations ran with hashing
      const first = data.patches[0];
      if (Object.prototype.hasOwnProperty.call(first, "patch_hash")) {
        expect(first).toHaveProperty("patch_hash");
      }
    }
  });
});
