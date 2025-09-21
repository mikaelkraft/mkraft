const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function handle(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  async get(path, params) {
    const url = new URL((API_BASE + path).replace(/\/$/, ''), window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }
    return handle(await fetch(url.toString(), { headers: { 'accept': 'application/json' } }));
  }
};
