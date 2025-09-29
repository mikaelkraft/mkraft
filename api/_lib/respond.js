function json(res, body, status = 200) {
  res.status(status).setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function error(res, message, status = 400, extra = {}) {
  json(res, { error: message, ...extra }, status);
}

function resolveBaseUrl() {
  // Priority order:
  // 1. Explicit SITE_BASE_URL (full origin, e.g. https://example.com)
  // 2. VERCEL_URL (host only) -> https://VERCEL_URL
  // 3. Render/Netlify style PUBLIC_BASE_URL if later added
  // 4. Fallback localhost (protocol required by URL API)
  if (process.env.SITE_BASE_URL) return process.env.SITE_BASE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '');
  return 'http://localhost';
}

function getUrl(req) {
  const base = resolveBaseUrl();
  try {
    return new URL(req.url, base);
  } catch {
    const query = req.query || {};
    const params = new URLSearchParams(query);
    return new URL(`${req.url}?${params.toString()}`, base);
  }
}

module.exports = { json, error, getUrl, resolveBaseUrl };
