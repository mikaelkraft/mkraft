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

async function requireAdmin(req, res) {
  const { user } = await verifyAuth(req);
  const adminEmail = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL;
  if (!user || !user.email || (adminEmail && user.email !== adminEmail)) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}

module.exports = { verifyAuth, requireAdmin };
