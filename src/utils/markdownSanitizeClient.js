// Client-side markdown sanitizer aligned with server logic in api/_lib/markdownSanitize.js
// Intentionally mirrors allowed tags & iframe src allowlist for consistency.
import DOMPurify from "dompurify";

export const allowedIframeSrc = [
  /^https:\/\/www\.youtube\.com\//,
  /^https:\/\/player\.vimeo\.com\//,
  /^https:\/\/open\.spotify\.com\//,
];

export function sanitizeClientHtml(html) {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "loading",
      "referrerpolicy",
      "width",
      "height",
      "title",
      "alt",
      "src",
    ],
    FORBID_TAGS: ["script", "style"],
    FORBID_ATTR: ["onerror", "onclick", "onload"],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}
