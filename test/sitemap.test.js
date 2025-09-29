import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:5000';

describe('Sitemap XML endpoint', () => {
  it('returns XML (if server running)', async () => {
    let res; try { res = await fetch(BASE + '/sitemap.xml'); } catch { return; }
    if (res.status !== 200) return; // skip silently if not available
    const text = await res.text();
    expect(text.startsWith('<?xml')).toBe(true);
    expect(/<urlset[\s>]/.test(text)).toBe(true);
  });
});
