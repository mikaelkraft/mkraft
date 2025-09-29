const { resolveBaseUrl } = require('./_lib/respond.js');
const { query } = require('./_lib/db.js');

function xmlEscape(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'GET') { res.statusCode = 405; res.end('Method Not Allowed'); return; }
    const base = resolveBaseUrl();
    const { rows } = await query(`SELECT id, updated_at, created_at FROM wisdomintech.projects WHERE status='published' ORDER BY updated_at DESC NULLS LAST LIMIT 2000`);
    const nowIso = new Date().toISOString();
    const xml = rows.map(r => {
      const lastmod = (r.updated_at || r.created_at || nowIso).toISOString ? (r.updated_at || r.created_at || nowIso).toISOString() : (r.updated_at || r.created_at || nowIso);
      return `\n  <url><loc>${xmlEscape(base + '/project/' + r.id)}</loc><lastmod>${xmlEscape(lastmod)}</lastmod><changefreq>weekly</changefreq><priority>0.55</priority></url>`;
    }).join('');
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}\n</urlset>`;
    res.statusCode = 200; res.setHeader('content-type', 'application/xml; charset=utf-8'); res.setHeader('cache-control', 'public, max-age=600'); res.end(body);
  } catch (e) {
    res.statusCode = 500; res.setHeader('content-type', 'text/plain'); res.end('projects sitemap generation failed');
  }
};
