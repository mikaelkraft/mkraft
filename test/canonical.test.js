import { describe, it, expect } from "vitest";
import { getCanonicalUrl } from "../src/utils/canonical.js";

// Minimal mock for window when needed
function withWindow(mock, fn) {
  const original = globalThis.window;
  globalThis.window = { ...original, ...mock };
  try {
    return fn();
  } finally {
    globalThis.window = original;
  }
}

describe("getCanonicalUrl", () => {
  it("joins relative path with base (window.location.origin)", () => {
    withWindow({ location: { origin: "https://example.com" } }, () => {
      expect(getCanonicalUrl("/posts")).toBe("https://example.com/posts");
    });
  });
  it("returns absolute url unchanged (trim trailing /)", () => {
    expect(getCanonicalUrl("https://foo.com/bar/")).toBe("https://foo.com/bar");
  });
  it("falls back gracefully when bad URL", () => {
    withWindow({ location: { origin: "https://ex.com" } }, () => {
      expect(getCanonicalUrl("not a valid path")).toContain("https://ex.com");
    });
  });
});

describe("suppression / component props (smoke)", () => {
  it("helper exposed to window", () => {
    withWindow({ location: { origin: "https://x.dev" } }, () => {
      getCanonicalUrl("/x");
      expect(typeof window.__CANONICAL_HELPER__).toBe("function");
    });
  });
});
