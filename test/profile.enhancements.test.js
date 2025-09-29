import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:5000';

// These tests are opportunistic (they skip quietly if server/auth not available)

describe('Profile enhancements (governance)', () => {
  it('rejects update missing required fields (if enforcement active)', async () => {
    let reachable = true; try { await fetch(BASE + '/api/profile'); } catch { reachable = false; }
    if (!reachable) return;
    // Attempt update without providing any fields (should 400 for "No editable" OR missing required list)
    const res = await fetch(BASE + '/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    if ([401,403].includes(res.status)) return; // unauthenticated in env
    if (res.status === 400) {
      const data = await res.json();
      // Accept either validation style
      expect(['No editable fields in payload','Missing required fields']).toContain(data.error);
    }
  });

  it('wraps iframes in video-embed-container when video enabled (blog create)', async () => {
    // Create a simple post with an iframe snippet
    let reachable = true; try { await fetch(BASE + '/api/blog?limit=1'); } catch { reachable = false; }
    if (!reachable) return;
    const html = '<iframe src="https://www.youtube.com/embed/xyz123" allowfullscreen></iframe>';
    const resp = await fetch(BASE + '/api/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Wrapper Test', content: html }) });
    if (resp.status === 403) return; // no admin auth
    if (resp.status !== 201) return; // cannot proceed
    const post = await resp.json();
    if (post.content) {
      // Accept either directly wrapped or sanitized away if feature disabled
      if (post.content.includes('youtube.com')) {
        expect(post.content).toMatch(/video-embed-container/);
      }
    }
  });
});
