const { resolveBaseUrl } = require("./_lib/respond.js");
const { query } = require("./_lib/db.js");

function xmlEscape(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }
    const base = resolveBaseUrl();
    const { rows } = await query(
      `SELECT DISTINCT category FROM wisdomintech.blog_posts WHERE status='published' AND category IS NOT NULL LIMIT 500`,
    );
    const nowIso = new Date().toISOString();
    const xml = rows
      .filter((r) => r.category)
      .map(
        (r) =>
          `\n  <url><loc>${xmlEscape(base + "/blog-content-hub?category=" + encodeURIComponent(r.category))}</loc><lastmod>${xmlEscape(nowIso)}</lastmod><changefreq>daily</changefreq><priority>0.50</priority></url>`,
      )
      .join("");
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}\n</urlset>`;
    res.statusCode = 200;
    res.setHeader("content-type", "application/xml; charset=utf-8");
    res.setHeader("cache-control", "public, max-age=1800");
    res.end(body);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain");
    res.end("categories sitemap generation failed");
  }
};
