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

// Engagement weighting heuristic: base 0.5 + scaled views + likes up to 0.9.
function computePriority(row) {
  const views = Number(row.view_count || row.views || 0);
  const likes = Number(row.like_count || row.likes || 0);
  // logarithmic dampening
  const viewScore = views > 0 ? Math.log10(views + 1) / 4 : 0; // ~0.5 at 10k views
  const likeScore = likes > 0 ? Math.log10(likes + 1) / 5 : 0; // smaller influence
  const p = 0.5 + Math.min(0.4, viewScore + likeScore);
  return p.toFixed(2);
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
      `SELECT slug, updated_at, created_at, view_count, like_count FROM wisdomintech.blog_posts WHERE status='published' ORDER BY updated_at DESC NULLS LAST LIMIT 5000`,
    );
    const nowIso = new Date().toISOString();
    const xml = rows
      .map((r) => {
        const lastmod = (r.updated_at || r.created_at || nowIso).toISOString
          ? (r.updated_at || r.created_at || nowIso).toISOString()
          : r.updated_at || r.created_at || nowIso;
        return `\n  <url><loc>${xmlEscape(base + "/blog/" + encodeURIComponent(r.slug))}</loc><lastmod>${xmlEscape(lastmod)}</lastmod><changefreq>weekly</changefreq><priority>${computePriority(r)}</priority></url>`;
      })
      .join("");
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}\n</urlset>`;
    res.statusCode = 200;
    res.setHeader("content-type", "application/xml; charset=utf-8");
    res.setHeader("cache-control", "public, max-age=300");
    res.end(body);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain");
    res.end("posts sitemap generation failed");
  }
};
