const loaded = new Set();

export async function loadExternalScript(src, attrs = {}) {
  if (typeof document === 'undefined' || !src) return false;
  if (loaded.has(src)) return true;
  if (document.querySelector(`script[src="${src}"]`)) {
    loaded.add(src);
    return true;
  }
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    Object.entries(attrs).forEach(([k, v]) => {
      if (v != null) s.setAttribute(k, v);
    });
    s.onload = () => { loaded.add(src); resolve(true); };
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}
