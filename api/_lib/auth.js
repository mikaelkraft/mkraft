const https = require('https');

async function fetchSupabaseUser(accessToken) {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !accessToken) return null;

  const url = new URL('/auth/v1/user', SUPABASE_URL.replace(/\/$/, ''));
  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY || ''
      }
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

async function verifyAuth(req) {
  try {
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth || !auth.startsWith('Bearer ')) return { user: null };
    const token = auth.slice(7);
    const user = await fetchSupabaseUser(token);
    if (!user || !user.id) return { user: null };
    return { user: { id: user.id, email: user.email } };
  } catch {
    return { user: null };
  }
}

const { query } = require('./db.js');

async function getUserWithRole(req) {
  const { user } = await verifyAuth(req);
  if (!user) return null;
  try {
    const { rows } = await query('SELECT id, email, role, publisher_request_status FROM wisdomintech.user_profiles WHERE id = $1', [user.id]);
    let role = rows[0]?.role || 'viewer';
    const adminEmail = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL;
    // Auto-promote configured admin email for backward compatibility
    if (adminEmail && user.email === adminEmail && role !== 'admin') {
      await query('UPDATE wisdomintech.user_profiles SET role = \'admin\', role_updated_at = now() WHERE id = $1', [user.id]);
      role = 'admin';
    }
    return { ...user, role, publisher_request_status: rows[0]?.publisher_request_status || null };
  } catch {
    return { ...user, role: 'viewer' };
  }
}

async function requireAdmin(req, res) {
  const user = await getUserWithRole(req);
  if (!user || user.role !== 'admin') {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}

async function requirePublisherOrAdmin(req, res) {
  const user = await getUserWithRole(req);
  if (!user || (user.role !== 'admin' && user.role !== 'publisher')) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}

module.exports = { verifyAuth, requireAdmin, requirePublisherOrAdmin, getUserWithRole };
