import { describe, it, expect } from 'vitest';

// This test is opportunistic: it will run only if the local API server is available and DB seeded.
// Flow: (1) fetch feature flag; (2) attempt to initiate publisher request; (3) (admin-only) approve.
// Because we lack an authenticated token in this environment, we only assert graceful handling / shapes.
// If an auth token is injected via environment (GLOBAL_TEST_BEARER), it will attempt full flow.

const BASE = 'http://localhost:5000';

async function safeFetch(url, opts) {
  try { return await fetch(url, opts); } catch { return null; }
}

describe('Publisher approval flow (graceful)', () => {
  it('handles request -> (optional) approval path without throwing', async () => {
    const token = process.env.GLOBAL_TEST_BEARER;
    const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

    // Check server reachability
    const health = await safeFetch(BASE + '/api/health');
    if (!health || health.status !== 200) return; // skip

    // Get status (may 401 if unauthenticated)
    const statusResp = await safeFetch(BASE + '/api/profile/publisher-request');
    if (!statusResp) return; // skip unreachable path
    if ([401,404].includes(statusResp.status)) return; // not enabled or unauthorized -> acceptable skip

    // Initiate request if possible
    const reqResp = await safeFetch(BASE + '/api/profile/publisher-request', {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    });
    if (!reqResp) return; // skip
    // Acceptable outcomes: 201 created (new pending) / 200 (already pending or elevated) / 401 unauthorized
    expect([200,201,401,404].includes(reqResp.status)).toBe(true);

    // Attempt approval only if we have token (simulated admin) and previous call not unauthorized
    if (token && ![401,404].includes(reqResp.status)) {
      // We don't know target user id without introspection; so just list pending and approve the first if any
      const listResp = await safeFetch(BASE + '/api/profile/publisher-requests', { headers });
      if (listResp && listResp.status === 200) {
        const list = await listResp.json();
        if (Array.isArray(list) && list.length) {
          const target = list[0];
          const approveResp = await safeFetch(BASE + '/api/profile/publisher-approval', {
            method: 'POST',
            headers,
            body: JSON.stringify({ user_id: target.id, action: 'approve' })
          });
          if (approveResp) {
            expect([200,401,403].includes(approveResp.status)).toBe(true);
            if (approveResp.status === 200) {
              const approved = await approveResp.json();
              expect(approved).toHaveProperty('role');
            }
          }
        }
      }
    }
  });
});
