const { resolveBaseUrl } = require('./_lib/respond.js');

function xmlEscape(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// This endpoint now serves as a sitemap index referencing specialized sitemaps
// to keep payloads small & allow differential cache TTLs per content type.
module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'GET') { res.statusCode = 405; res.end('Method Not Allowed'); return; }
    const base = resolveBaseUrl();
    const now = new Date().toISOString();
    const sitemaps = [
      { loc: `${base}/sitemap-posts.xml`, lastmod: now },
      { loc: `${base}/sitemap-projects.xml`, lastmod: now },
      { loc: `${base}/sitemap-categories.xml`, lastmod: now }
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      sitemaps.map(sm => `\n  <sitemap><loc>${xmlEscape(sm.loc)}</loc><lastmod>${xmlEscape(sm.lastmod)}</lastmod></sitemap>`).join('') +
      `\n</sitemapindex>`;
    res.statusCode = 200;
    res.setHeader('content-type', 'application/xml; charset=utf-8');
    res.setHeader('cache-control', 'public, max-age=300');
    res.end(body);
  } catch (e) {
    res.statusCode = 500; res.setHeader('content-type', 'text/plain'); res.end('sitemap index generation failed');
  }
};