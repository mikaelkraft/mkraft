import { describe, it, expect } from "vitest";
import { sanitizeMarkdown } from "../backend/_lib/markdownSanitize.js";

describe("sanitizeMarkdown", () => {
  it("allows basic formatting", () => {
    const html = sanitizeMarkdown("# Title\n\n**bold** _italic_");
    expect(html).toMatch(/<h1.*>Title<\/h1>/);
    expect(html).toMatch(/<strong>bold<\/strong>/);
  });
  it("strips disallowed iframe origins", () => {
    const html = sanitizeMarkdown(
      '<iframe src="https://evil.com/embed/123"></iframe>',
    );
    expect(html).not.toMatch(/iframe/);
  });
  it("keeps allowed youtube origin", () => {
    const html = sanitizeMarkdown(
      '<iframe src="https://www.youtube.com/embed/xyz" allow="autoplay"></iframe>',
    );
    expect(html).toMatch(/youtube/);
  });
});
