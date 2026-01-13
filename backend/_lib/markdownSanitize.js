const { JSDOM } = require("jsdom");
// Minimal markdown converter (headings, bold, italic, code inline) to avoid full parser dependency.
function miniMarkdown(md) {
  const placeholders = [];
  let body = md.replace(/<iframe[^>]*>.*?<\/iframe>/gis, (m) => {
    const idx = placeholders.push(m) - 1;
    return `{{IFRAMEPH${idx}}}`; // no underscores to avoid italic regex side-effects
  });
  // Escape then basic formatting
  body = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  body = body
    .replace(/^###### (.*)$/gm, "<h6>$1</h6>")
    .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
    .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(
      /^(?!<h\d|<ul|<ol|<p|<blockquote|<table|<pre)(.+)$/gm,
      "<p>$1</p>",
    );
  // Restore placeholders (now safe from markdown formatting side effects)
  body = body.replace(/\{\{IFRAMEPH(\d+)}}/g, (_, i) => placeholders[i]);
  return body;
}
// We avoid server-side dompurify dependency to reduce complexity; implement a conservative whitelist scrub instead.
const window = new JSDOM("").window;

// Basic allowed iframe origin patterns (sync with client embed helpers)
const allowedIframeSrc = [
  /^https:\/\/www\.youtube\.com\//,
  /^https:\/\/player\.vimeo\.com\//,
  /^https:\/\/open\.spotify\.com\//,
];

function sanitizeMarkdown(md) {
  if (!md) return "";
  const rawHtml = miniMarkdown(md);
  const dom = new JSDOM(`<body>${rawHtml}</body>`);
  const { document } = dom.window;

  // Allowed tags (conservative). Disallowed tags are removed entirely.
  const allowedTags = new Set([
    "A",
    "ABBR",
    "B",
    "BLOCKQUOTE",
    "BR",
    "CODE",
    "EM",
    "STRONG",
    "I",
    "UL",
    "OL",
    "LI",
    "P",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "PRE",
    "SPAN",
    "IMG",
    "TABLE",
    "THEAD",
    "TBODY",
    "TR",
    "TH",
    "TD",
    "HR",
    "IFRAME",
  ]);
  const urlAttrs = new Set(["href", "src", "poster"]);
  const allowedImgAttrs = new Set([
    "src",
    "alt",
    "title",
    "width",
    "height",
    "loading",
  ]);
  const allowedIframeAttrs = new Set([
    "src",
    "allow",
    "allowfullscreen",
    "frameborder",
    "loading",
    "referrerpolicy",
  ]);

  function scrub(node) {
    if (node.nodeType !== 1) return; // element only
    const tag = node.tagName;
    if (!allowedTags.has(tag)) {
      node.remove();
      return;
    }
    // Attribute filtering
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (tag === "IMG") {
        if (!allowedImgAttrs.has(name)) node.removeAttribute(name);
      } else if (tag === "IFRAME") {
        if (!allowedIframeAttrs.has(name)) node.removeAttribute(name);
      } else {
        // For other tags keep only href on A (no javascript:) and title
        if (tag === "A") {
          if (!["href", "title"].includes(name)) node.removeAttribute(name);
        } else {
          if (!["class", "id"].includes(name)) node.removeAttribute(name); // optionally strip most
        }
      }
      // Strip javascript: and data: except data:image for img src
      if (urlAttrs.has(name)) {
        const val = attr.value.trim();
        if (/^javascript:/i.test(val)) node.removeAttribute(name);
        if (name === "src" && tag !== "IMG" && /^data:/i.test(val))
          node.removeAttribute(name);
      }
    });
    // Special: enforce iframe origin allow list
    if (tag === "IFRAME") {
      const src = node.getAttribute("src") || "";
      if (!allowedIframeSrc.some((rx) => rx.test(src))) {
        node.remove();
        return;
      }
      node.setAttribute("loading", "lazy");
      if (!node.getAttribute("referrerpolicy"))
        node.setAttribute("referrerpolicy", "no-referrer");
    }
    // Recurse children (convert to array to avoid live list issues)
    [...node.children].forEach(scrub);
  }
  [...document.body.children].forEach(scrub);
  return document.body.innerHTML;
}

module.exports = { sanitizeMarkdown };
