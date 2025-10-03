import { describe, it, expect } from "vitest";
import {
  slashCommand,
  insertHeading,
  insertCodeBlock,
} from "../src/utils/markdownInsert";

describe("markdownInsert slashCommand dispatcher", () => {
  it("returns heading insertion object for h1", () => {
    const res = slashCommand("", 0, "h1");
    expect(res).not.toBeNull();
    expect(res.text.startsWith("# ")).toBe(true);
  });
  it("returns code block insertion for code", () => {
    const res = slashCommand("foo", 3, "code");
    expect(res.text).toMatch(/code/);
    expect(res.text.split("\n").length).toBeGreaterThan(3); // multiline block inserted
  });
  it("gracefully returns null for unknown command", () => {
    const res = slashCommand("", 0, "nope");
    expect(res).toBeNull();
  });
});
