// Minimal HTML sanitizer (simple whitelist). For stronger needs, add `sanitize-html` dependency.
// Allows basic formatting tags and strips event handlers / scripts.

const ALLOWED_TAGS = ['b','i','em','strong','p','br','ul','ol','li','pre','code','blockquote','h1','h2','h3','h4','h5','h6','a'];
const ALLOWED_ATTR = { a: ['href','title','target','rel'] };

function sanitize(html = '') {
  if (!html || typeof html !== 'string') return '';
  // Remove script/style tags entirely
  let out = html.replace(/<\/(script|style)>/gi,'').replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi,'');
  // Remove on* handlers and javascript: URLs
  out = out.replace(/on\w+\s*=\s*"[^"]*"/gi,'')
           .replace(/on\w+\s*=\s*'[^']*'/gi,'')
           .replace(/on\w+\s*=\s*[^\s>]+/gi,'')
           .replace(/javascript:/gi,'');
  // Strip tags not in allow list
  out = out.replace(/<([^>\/\s]+)([^>]*)>/gi, (m, tag, attrs) => {
    const t = tag.toLowerCase();
    if (!ALLOWED_TAGS.includes(t)) return '';
    if (!attrs) return `<${t}>`;
    const cleanAttrs = (attrs.match(/\s+[a-zA-Z:-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g) || [])
      .map(a => a.trim())
      .filter(a => {
        const eq = a.indexOf('=');
        if (eq === -1) return false;
        const name = a.slice(0, eq).toLowerCase();
        if (!ALLOWED_ATTR[t]) return false;
        if (!ALLOWED_ATTR[t].includes(name)) return false;
        return true;
      })
      .join(' ');
    return `<${t}${cleanAttrs ? ' ' + cleanAttrs : ''}>`;
  });
  // Close tags that are self-closing incorrectly not handled here (lightweight)
  return out;
}

module.exports = { sanitize };
