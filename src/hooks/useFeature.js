import { useEffect, useState } from 'react';

// Simple client-side cache (module scope)
let _flags = null; // { flag_key: { enabled, note } }
let _pending = null; // promise to prevent duplicate fetches
let _lastFetch = 0;
const STALE_MS = 30_000; // refresh every 30s when new subscribers appear

async function loadFlags() {
  const now = Date.now();
  if (_flags && (now - _lastFetch) < STALE_MS) return _flags;
  if (_pending) return _pending;
  _pending = fetch((import.meta.env.VITE_API_BASE_URL || '/api') + '/settings/features')
    .then(r => r.ok ? r.json() : [])
    .then(rows => {
      _flags = rows.reduce((acc, f) => { acc[f.flagKey || f.flag_key] = f; return acc; }, {});
      _lastFetch = Date.now();
      _pending = null;
      return _flags;
    })
    .catch(() => { _pending = null; return _flags || {}; });
  return _pending;
}

export function useFeature(flagKey, defaultValue = false) {
  const [enabled, setEnabled] = useState(() => {
    if (_flags && _flags[flagKey]) return !!_flags[flagKey].enabled;
    return defaultValue;
  });

  useEffect(() => {
    let active = true;
    loadFlags().then(f => {
      if (!active) return;
      if (f && f[flagKey]) setEnabled(!!f[flagKey].enabled);
    });
    return () => { active = false; };
  }, [flagKey]);

  return enabled;
}

export default useFeature;
