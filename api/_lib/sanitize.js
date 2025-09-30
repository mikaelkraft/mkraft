// Minimal HTML sanitizer (simple whitelist). For stronger needs, add `sanitize-html` dependency.
// Allows basic formatting tags and strips event handlers / scripts.

const BASE_ALLOWED_TAGS = [
  "b",
  "i",
  "em",
  "strong",
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "pre",
  "code",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
];
const BASE_ALLOWED_ATTR = { a: ["href", "title", "target", "rel"] };

function sanitize(html = "", opts = {}) {
  if (!html || typeof html !== "string") return "";
  const allowVideo = !!opts.allowVideo;
  const ALLOWED_TAGS = allowVideo
    ? [...BASE_ALLOWED_TAGS, "iframe"]
    : BASE_ALLOWED_TAGS;
  const ALLOWED_ATTR = { ...BASE_ALLOWED_ATTR };
  if (allowVideo)
    ALLOWED_ATTR.iframe = [
      "src",
      "title",
      "allow",
      "allowfullscreen",
      "width",
      "height",
      "frameborder",
    ];
  // Remove script/style tags entirely
  let out = html
    .replace(/<\/(script|style)>/gi, "")
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  // Remove on* handlers and javascript: URLs
  out = out
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
  // Strip tags not in allow list
  // Regex strips opening tags and captures tag + attributes. Escaped slash after '>' not needed.
  out = out.replace(/<([^>\s]+)([^>]*)>/gi, (m, tag, attrs) => {
    const t = tag.toLowerCase();
    if (!ALLOWED_TAGS.includes(t)) return "";
    if (!attrs) return `<${t}>`;
    const rawAttrs =
      attrs.match(/\s+[a-zA-Z:-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g) || [];
    let cleanAttrs = rawAttrs
      .map((a) => a.trim())
      .filter((a) => {
        const eq = a.indexOf("=");
        if (eq === -1) return false;
        const name = a.slice(0, eq).toLowerCase();
        if (!ALLOWED_ATTR[t]) return false;
        if (!ALLOWED_ATTR[t].includes(name)) return false;
        return true;
      })
      .join(" ");
    // Additional src whitelist for iframes (YouTube/Vimeo only)
    if (t === "iframe") {
      const srcMatch = /src=("([^"]*)"|'([^']*)')/.exec(attrs);
      const srcVal = srcMatch ? srcMatch[2] || srcMatch[3] || "" : "";
      const allowed =
        /^(https:\/\/(www\.)?(youtube\.com|youtu\.be|player\.vimeo\.com)\/)/i.test(
          srcVal,
        );
      if (!allowed) return ""; // strip entire iframe if not whitelisted
      // Force rel="noopener" not relevant for iframe; ensure no javascript: encoded
      // Sanitize allow attribute to a curated subset
      cleanAttrs = cleanAttrs.replace(/allow=("[^"]*"|'[^']*')/gi, (m) => {
        const val = m.split("=")[1].replace(/^["']|["']$/g, "");
        const features = val.split(/;|,/).map((v) => v.trim().toLowerCase());
        const allowedFeatures = [
          "accelerometer",
          "autoplay",
          "clipboard-write",
          "encrypted-media",
          "gyroscope",
          "picture-in-picture",
        ];
        const filtered = features.filter((f) => allowedFeatures.includes(f));
        return filtered.length ? `allow="${filtered.join("; ")}"` : "";
      });
    }
    return `<${t}${cleanAttrs ? " " + cleanAttrs : ""}>`;
  });
  // Remove orphan closing tags for disallowed iframes or others (simple pass)
  if (!allowVideo) {
    out = out.replace(/<\/iframe>/gi, "");
  }
  // Close tags that are self-closing incorrectly not handled here (lightweight)
  return out;
}

module.exports = { sanitize };
