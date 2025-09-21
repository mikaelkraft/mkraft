// Minimal AdSense script loader to ensure we only inject once per publisher
let loadedClientId = null;
let loadPromise = null;

export function ensureAdSenseLoaded(publisherId) {
  if (!publisherId || typeof document === 'undefined') return Promise.resolve(false);
  const clientParam = `ca-pub-${publisherId.replace('ca-pub-', '')}`;

  // If already loaded for this client, resolve
  if (loadedClientId === clientParam && window.adsbygoogle) return Promise.resolve(true);

  // If a script with this client already exists in DOM
  const existing = Array.from(document.querySelectorAll('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'))
    .find(s => s.src.includes(`client=${clientParam}`));
  if (existing) {
    loadedClientId = clientParam;
    return Promise.resolve(true);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise(resolve => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientParam}`;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      loadedClientId = clientParam;
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function pushAd() {
  try {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      window.adsbygoogle.push({});
      return true;
    }
  } catch (_) {}
  return false;
}
