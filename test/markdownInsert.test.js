import { describe, it, expect } from "vitest";
import {
  wrapInline,
  insertTable,
  insertEmoji,
  insertHeading,
} from "../src/utils/markdownInsert";

describe("markdownInsert utilities", () => {
  it("wrapInline inserts prefix/suffix around selection", () => {
    const base = "hello world";
    const { text } = wrapInline(base, 6, 11, "**");
    expect(text).toBe("hello **world**");
  });
  it("insertTable appends table at position", () => {
    const base = "content";
    const { text } = insertTable(base, base.length);
    expect(text).toContain("| Col 1 | Col 2 | Col 3 |");
  });
  it("insertEmoji inserts emoji at cursor", () => {
    const base = "abc";
    const { text } = insertEmoji(base, 1, 1, "😀");
    expect(text).toBe("a😀bc");
  });
  it("insertHeading applies heading level", () => {
    const base = "text";
    const { text } = insertHeading(base, 0, 4, 2);
    expect(text.startsWith("## ")).toBe(true);
  });
});
