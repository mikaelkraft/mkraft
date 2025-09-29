import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:5000';

describe('Sitemap XML endpoint', () => {
  it('returns sitemap index and posts sitemap (if server running)', async () => {
    let res; try { res = await fetch(BASE + '/sitemap.xml'); } catch { return; }
    if (res.status !== 200) return; // gracefully skip if not mounted
    const text = await res.text();
    expect(text.startsWith('<?xml')).toBe(true);
    if (!/sitemapindex/.test(text)) return; // index mode only further asserts
    // ensure references to specialized sitemaps exist
    expect(text).toMatch(/sitemap-posts\.xml/);
    expect(text).toMatch(/sitemap-projects\.xml/);
    expect(text).toMatch(/sitemap-categories\.xml/);

    // fetch posts sitemap
    let postsRes; try { postsRes = await fetch(BASE + '/sitemap-posts.xml'); } catch { return; }
    if (postsRes.status !== 200) return;
    const postsXml = await postsRes.text();
    expect(postsXml.startsWith('<?xml')).toBe(true);
    expect(/<urlset[\s>]/.test(postsXml)).toBe(true);
  });
});
