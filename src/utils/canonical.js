// Frontend canonical URL helper.
// Uses Vite-exposed env if available, else window.location.origin.
// VITE_SITE_BASE_URL can be optionally supplied (mirrors SITE_BASE_URL on server).
export function getCanonicalUrl(pathOrUrl = "/") {
  // Order of precedence (window override takes priority so tests / runtime can override build-time):
  // 1. Injected runtime global (window.__SITE_BASE_URL__)
  // 2. window.location.origin (browser location)
  // 3. Vite client env (import.meta.env)
  // 4. Node/SSR environment variable (process.env.SITE_BASE_URL) for tests / prerender
  // 5. Fallback http://localhost
  let rawBase;
  try {
    const winBase =
      (typeof window !== "undefined" && window.__SITE_BASE_URL__) || null;
    const locBase =
      (typeof window !== "undefined" &&
        window.location &&
        window.location.origin) ||
      null;
    const viteVar =
      (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.VITE_SITE_BASE_URL) ||
      null;
    const envBase =
      (typeof process !== "undefined" &&
        process.env &&
        process.env.SITE_BASE_URL) ||
      null;
    rawBase = winBase || locBase || viteVar || envBase || "http://localhost";
  } catch {
    rawBase = "http://localhost";
  }
  const base = rawBase.replace(/\/$/, "");
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl.replace(/\/$/, "");
  const p = pathOrUrl.startsWith("/") ? pathOrUrl : "/" + pathOrUrl;
  try {
    return new URL(p, base).toString().replace(/\/$/, "");
  } catch {
    return base + p;
  }
}

// Optionally expose helper to window for debugging
if (typeof window !== "undefined") {
  if (!window.__CANONICAL_HELPER__)
    window.__CANONICAL_HELPER__ = getCanonicalUrl;
}

// Lightweight Canonical React component used in App.jsx
// Renders a <link rel="canonical"> for the current location (SSR-safe noop pre-hydration)
// (Component version lives at components/seo/Canonical.jsx)
