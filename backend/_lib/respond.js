function json(res, body, status = 200) {
  res
    .status(status)
    .setHeader("content-type", "application/json; charset=utf-8");
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
  if (process.env.SITE_BASE_URL)
    return process.env.SITE_BASE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  if (process.env.PUBLIC_BASE_URL)
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  return "http://localhost";
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

// Build a canonical absolute URL for SEO (path should start with '/' or be a URL object/string)
function buildCanonicalUrl(pathOrUrl) {
  const base = resolveBaseUrl();
  let target;
  try {
    if (typeof pathOrUrl === "string" && !/^https?:\/\//i.test(pathOrUrl)) {
      // Ensure leading slash for relative paths
      const p = pathOrUrl.startsWith("/") ? pathOrUrl : "/" + pathOrUrl;
      target = new URL(p, base).toString();
    } else {
      target = new URL(pathOrUrl, base).toString();
    }
  } catch {
    target = base; // fallback
  }
  return target.replace(/\/$/, "");
}

// Emit a runtime warning if production uses localhost base (misconfiguration)
if (process.env.NODE_ENV === "production") {
  const b = resolveBaseUrl();
  if (/localhost(:\d+)?$/.test(b)) {
    console.warn(
      "[config-warning] SITE_BASE_URL/VERCEL_URL not set; canonical URLs will use localhost.",
    );
  }
}

module.exports = { json, error, getUrl, resolveBaseUrl, buildCanonicalUrl };
