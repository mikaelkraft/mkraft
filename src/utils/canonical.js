// Frontend canonical URL helper.
// Uses Vite-exposed env if available, else window.location.origin.
// VITE_SITE_BASE_URL can be optionally supplied (mirrors SITE_BASE_URL on server).
export function getCanonicalUrl(pathOrUrl = '/') {
  const rawBase = import.meta.env.VITE_SITE_BASE_URL || window.__SITE_BASE_URL__ || window.location.origin;
  const base = rawBase.replace(/\/$/, '');
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl.replace(/\/$/, '');
  const p = pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl;
  try {
    return new URL(p, base).toString().replace(/\/$/, '');
  } catch {
    return base + p;
  }
}

// Optionally expose helper to window for debugging
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  if (!window.__CANONICAL_HELPER__) window.__CANONICAL_HELPER__ = getCanonicalUrl;
}