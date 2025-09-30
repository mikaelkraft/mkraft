// Frontend canonical URL helper.
// Uses Vite-exposed env if available, else window.location.origin.
// VITE_SITE_BASE_URL can be optionally supplied (mirrors SITE_BASE_URL on server).
export function getCanonicalUrl(pathOrUrl = "/") {
  // Order of precedence:
  // 1. Vite client env (import.meta.env)
  // 2. Injected runtime global (window.__SITE_BASE_URL__)
  // 3. Node/SSR environment variable (process.env.SITE_BASE_URL) for tests / prerender
  // 4. window.location.origin (browser fallback)
  let rawBase;
  try {
    const viteVar =
      (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.VITE_SITE_BASE_URL) ||
      null;
    const winBase =
      (typeof window !== "undefined" && window.__SITE_BASE_URL__) || null;
    const envBase =
      (typeof process !== "undefined" &&
        process.env &&
        process.env.SITE_BASE_URL) ||
      null;
    const locBase =
      (typeof window !== "undefined" &&
        window.location &&
        window.location.origin) ||
      null;
    rawBase = viteVar || winBase || envBase || locBase || "http://localhost";
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
