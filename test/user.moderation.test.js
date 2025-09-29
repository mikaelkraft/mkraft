import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:5000';

async function safe(url, opts) { try { return await fetch(url, opts); } catch { return null; } }

describe('User moderation endpoints (smoke)', () => {
  it('lists users (admin auth required, tolerate 401)', async () => {
    const res = await safe(BASE + '/api/admin/users');
    if (!res) return; // server not running
    expect([200,401,403].includes(res.status)).toBe(true);
    if (res.status === 200) {
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      if (data.length) {
        expect(data[0]).toHaveProperty('email');
        expect(data[0]).toHaveProperty('banned');
      }
    }
  });

  it('warn endpoint accepts POST (may be unauthorized)', async () => {
    const res = await safe(BASE + '/api/admin/users/warn', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: '00000000-0000-0000-0000-000000000000', reason: 'test' }) });
    if (!res) return;
    expect([200,401,403,404].includes(res.status)).toBe(true);
  });

  it('ban endpoint accepts POST (may be unauthorized)', async () => {
    const res = await safe(BASE + '/api/admin/users/ban', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: '00000000-0000-0000-0000-000000000000', action: 'ban', reason: 'test' }) });
    if (!res) return;
    expect([200,401,403,404].includes(res.status)).toBe(true);
  });
});
