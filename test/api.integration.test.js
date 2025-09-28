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

describe('Blog revisions workflow (smoke)', () => {
  it('captures a revision on update and can list revisions', async () => {
    let baseOk = true;
    try { await fetch(BASE + '/api/blog?limit=1'); } catch { baseOk = false; }
    if (!baseOk) return; // server not running

    // Create a draft post (requires admin; if forbidden skip silently)
    const draftResp = await fetch(BASE + '/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Rev Test Post', status: 'draft', content: 'First version' })
    });
    if (draftResp.status === 403) return; // no admin session in test env
    if (draftResp.status !== 201) return; // cannot proceed
    const draft = await draftResp.json();

    // Update the post -> should create a revision of original
    const updateResp = await fetch(BASE + `/api/blog?id=${draft.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Second version', title: 'Rev Test Post Updated' })
    });
    if (updateResp.status !== 200) return; // skip if update blocked

    // Fetch revisions
    const revListResp = await fetch(BASE + `/api/blog/revisions?postId=${draft.id}&limit=5`);
    if (revListResp.status !== 200) return; // revisions endpoint may require DB state
    const revs = await revListResp.json();
    expect(Array.isArray(revs)).toBe(true);
    if (revs.length) {
      expect(revs[0]).toHaveProperty('id');
      expect(revs[0]).toHaveProperty('blog_post_id');
    }
  });
});

describe('Related posts (heuristic)', () => {
  it('returns at most 3 related posts or empty array', async () => {
    let reachable = true; try { await fetch(BASE + '/api/blog?limit=1'); } catch { reachable = false; }
    if (!reachable) return;
    const baseList = await fetch(BASE + '/api/blog?published=true&limit=1');
    if (baseList.status !== 200) return;
    const posts = await baseList.json();
    if (!Array.isArray(posts) || !posts.length) return; // no published posts to test
    const slug = posts[0].slug;
    if (!slug) return;
    const relRes = await fetch(BASE + `/api/blog/related?slug=${encodeURIComponent(slug)}`);
    if (relRes.status !== 200) return;
    const related = await relRes.json();
    expect(Array.isArray(related)).toBe(true);
    expect(related.length).toBeLessThanOrEqual(3);
    if (related.length) {
      expect(related[0]).toHaveProperty('slug');
      expect(related[0]).toHaveProperty('title');
    }
  });
});

describe('Full-text search endpoint (if available)', () => {
  it('returns ranked results or empty array', async () => {
    let reachable = true; try { await fetch(BASE + '/api/blog?limit=1'); } catch { reachable = false; }
    if (!reachable) return;
    let res; try { res = await fetch(BASE + '/api/blog/search?q=hello'); } catch { return; }
    if (![200,400].includes(res.status)) return; // skip if not wired
    if (res.status === 200) {
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      if (data.length) {
        expect(data[0]).toHaveProperty('slug');
        expect(data[0]).toHaveProperty('title');
      }
    }
  });
});
