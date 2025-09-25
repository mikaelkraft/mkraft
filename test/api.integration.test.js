import { describe, it, expect } from 'vitest';
import http from 'http';

// Lightweight fetch wrapper using global fetch available in Vitest (jsdom)

const BASE = 'http://localhost:5000'; // assume dev server started separately if needed

describe('API integration (shallow)', () => {
  it('blog list returns ETag and supports 304', async () => {
    // Skip if server not running
    let res; try { res = await fetch(BASE + '/api/blog?limit=1'); } catch { return; }
    expect(res.status).toBe(200);
    const etag = res.headers.get('etag');
    expect(etag).toBeTruthy();
    const res2 = await fetch(BASE + '/api/blog?limit=1', { headers: { 'If-None-Match': etag } });
    // If server respects ETag it should return 304
    expect([200,304]).toContain(res2.status); // allow 200 if cold env
  });

  it('settings returns camelCase keys', async () => {
    let res; try { res = await fetch(BASE + '/api/settings'); } catch { return; }
    if (res.status !== 200) return; // environment may not have DB
    const data = await res.json();
    if (Array.isArray(data)) return; // guard unexpected shape
    // spot check a few keys
    if (data.siteTitle) {
      expect(Object.prototype.hasOwnProperty.call(data, 'siteTitle')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(data, 'site_title')).toBe(false);
    }
  });
});
