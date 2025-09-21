import { createRemoteJWKSet, jwtVerify } from 'jose';

// Verifies Supabase JWT on incoming requests (if provided)
export async function verifyAuth(req) {
  try {
    const auth = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!auth) return { user: null };

    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return { user: null };

    const jwksUrl = process.env.SUPABASE_JWKS_URL || (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '') + '/auth/v1/keys';
    if (!jwksUrl) return { user: null };

    const JWKS = createRemoteJWKSet(new URL(jwksUrl));
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: 'supabase',
      audience: undefined
    });

    return { user: payload?.sub ? { id: payload.sub, email: payload.email } : null };
  } catch (e) {
    return { user: null };
  }
}
