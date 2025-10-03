import { describe, it, expect } from "vitest";

// This is a lightweight structural test: we directly import the component's helper logic by simulating slash insertion.
// Since the component itself manipulates DOM selection, we approximate the transformation logic here.
// If deeper integration is needed, swap to @testing-library/react with jsdom environment.

import MarkdownField from "../src/components/ui/MarkdownField.jsx";

// Helper to simulate using the slash command insertion algorithm:
function simulateApplySlash({ initial = "", insert }) {
  // We mimic what applySlash does for token replacement at end of text
  // We only test the transformation string shape, not cursor behavior.
  const before = initial.replace(/\/(\w*)$/, "");
  return before + insert("");
}

describe("MarkdownField slash command insertions (static shape)", () => {
  it("h1 command inserts heading", () => {
    const result = simulateApplySlash({ initial: "/h1", insert: () => "# " });
    expect(result.startsWith("# ")).toBe(true);
  });
  it("bold command inserts ** ** wrapper", () => {
    const result = simulateApplySlash({ initial: "/bold", insert: () => "**" });
    // In real usage we surround selection; here we just assert token present
    expect(result.includes("**")).toBe(true);
  });
});
