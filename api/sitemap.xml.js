const { resolveBaseUrl } = require('./_lib/respond.js');
const { query } = require('./_lib/db.js');

function xmlEscape(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.statusCode = 405; res.end('Method Not Allowed'); return;
    }
    const base = resolveBaseUrl();
    // Fetch published blog posts & projects
    const { rows: posts } = await query(`SELECT slug, updated_at, created_at FROM wisdomintech.blog_posts WHERE status='published' ORDER BY updated_at DESC NULLS LAST LIMIT 5000`);
    const { rows: projects } = await query(`SELECT id, updated_at, created_at FROM wisdomintech.projects WHERE status='published' ORDER BY updated_at DESC NULLS LAST LIMIT 2000`);
    const { rows: categories } = await query(`SELECT DISTINCT category FROM wisdomintech.blog_posts WHERE status='published' AND category IS NOT NULL LIMIT 500`);

    const now = new Date().toISOString();

    // Base static routes
    const staticEntries = [
      { loc: base + '/', priority: '1.0', changefreq: 'daily', lastmod: now },
      { loc: base + '/blog-content-hub', priority: '0.8', changefreq: 'daily', lastmod: now },
      { loc: base + '/projects-portfolio-grid', priority: '0.8', changefreq: 'daily', lastmod: now }
    ];

    const postEntries = posts.map(p => ({
      loc: `${base}/blog/${encodeURIComponent(p.slug)}`,
      lastmod: (p.updated_at || p.created_at || now).toISOString ? (p.updated_at || p.created_at || now).toISOString() : (p.updated_at || p.created_at || now),
      changefreq: 'weekly',
      priority: '0.6'
    }));
    const projectEntries = projects.map(pr => ({
      loc: `${base}/project/${pr.id}`,
      lastmod: (pr.updated_at || pr.created_at || now).toISOString ? (pr.updated_at || pr.created_at || now).toISOString() : (pr.updated_at || pr.created_at || now),
      changefreq: 'weekly',
      priority: '0.6'
    }));
    const categoryEntries = categories.filter(c => c.category).map(c => ({
      loc: `${base}/blog-content-hub?category=${encodeURIComponent(c.category)}`,
      lastmod: now,
      changefreq: 'daily',
      priority: '0.5'
    }));

    const all = [...staticEntries, ...categoryEntries, ...postEntries, ...projectEntries];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      all.map(e => `\n  <url><loc>${xmlEscape(e.loc)}</loc><lastmod>${xmlEscape(e.lastmod)}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`).join('') +
      `\n</urlset>`;
    res.statusCode = 200;
    res.setHeader('content-type', 'application/xml; charset=utf-8');
    res.setHeader('cache-control', 'public, max-age=300');
    res.end(body);
  } catch (e) {
    res.statusCode = 500; res.setHeader('content-type', 'text/plain'); res.end('sitemap generation failed');
  }
};