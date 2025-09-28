import supabase from './supabase';

const base = import.meta.env.VITE_API_BASE_URL || '/api';

async function authHeaders() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' };
  } catch {}
  return { 'Content-Type': 'application/json' };
}

const publisherProgramService = {
  async status() {
    try {
      const h = await authHeaders();
      const res = await fetch(base + '/profile/publisher-request', { headers: h });
      if (!res.ok) return { success: false, error: 'Failed status' };
      return { success: true, data: await res.json() };
    } catch { return { success: false, error: 'Network error' }; }
  },
  async requestAccess() {
    try {
      const h = await authHeaders();
      const res = await fetch(base + '/profile/publisher-request', { method: 'POST', headers: h });
      if (!res.ok) return { success: false, error: 'Failed request' };
      return { success: true, data: await res.json() };
    } catch { return { success: false, error: 'Network error' }; }
  },
  async listPending() {
    try {
      const h = await authHeaders();
      const res = await fetch(base + '/profile/publisher-requests', { headers: h });
      if (!res.ok) return { success: false, error: 'Failed list' };
      return { success: true, data: await res.json() };
    } catch { return { success: false, error: 'Network error' }; }
  },
  async approve(user_id) {
    try {
      const h = await authHeaders();
      const res = await fetch(base + '/profile/publisher-approval', { method: 'POST', headers: h, body: JSON.stringify({ user_id, action: 'approve' }) });
      if (!res.ok) return { success: false, error: 'Failed approve' };
      return { success: true, data: await res.json() };
    } catch { return { success: false, error: 'Network error' }; }
  },
  async reject(user_id) {
    try {
      const h = await authHeaders();
      const res = await fetch(base + '/profile/publisher-approval', { method: 'POST', headers: h, body: JSON.stringify({ user_id, action: 'reject' }) });
      if (!res.ok) return { success: false, error: 'Failed reject' };
      return { success: true, data: await res.json() };
    } catch { return { success: false, error: 'Network error' }; }
  }
};

export default publisherProgramService;
