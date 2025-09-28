import { useEffect, useState } from 'react';

// ----------------------------------------------------------------------------
// Module‑scope state & utilities
// ----------------------------------------------------------------------------
let _flags = null;              // Server fetched flags: { key: { enabled, note } }
let _pending = null;            // In‑flight fetch promise
let _lastFetch = 0;             // Timestamp of last successful fetch
const STALE_MS = 30_000;        // Consider stale after 30s

// Local override support (URL + localStorage) --------------------------------
let _overrides = {};            // { key: boolean }
const LS_KEY = 'featureFlagOverrides:v1';
const hasWindow = typeof window !== 'undefined';

function loadStoredOverrides() {
  if (!hasWindow) return {};
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; } catch { return {}; }
}

function persistOverrides() {
  if (!hasWindow) return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(_overrides)); } catch { /* ignore */ }
}

function parseUrlOverrides() {
  if (!hasWindow) return {};
  try {
    const sp = new URLSearchParams(window.location.search);
    const raw = sp.get('ff');
    if (!raw) return {};
    const out = {};
    raw.split(',').map(s => s.trim()).filter(Boolean).forEach(pair => {
      const [k, v] = pair.split(':');
      if (!k) return;
      // Treat absence of value or explicit 'on/true/1' as true; off/false/0 as false
      const val = v == null ? true : /^(on|true|1)$/i.test(v) ? true : /^(off|false|0)$/i.test(v) ? false : true;
      out[k] = val;
    });
    return out;
  } catch { return {}; }
}

function initOverrides() {
  // Merge localStorage + URL (URL wins)
  const stored = loadStoredOverrides();
  const url = parseUrlOverrides();
  _overrides = { ...stored, ...url };
  if (Object.keys(url).length) persistOverrides(); // persist if new URL overrides present
}
initOverrides();

export function setFeatureOverride(key, value) {
  _overrides[key] = !!value; persistOverrides();
  notifyListeners();
}
export function clearFeatureOverride(key) {
  delete _overrides[key]; persistOverrides();
  notifyListeners();
}
export function resetAllFeatureOverrides() {
  _overrides = {}; persistOverrides();
  notifyListeners();
}

// Listener fanout so hooks can update immediately when cache changes ---------
const listeners = new Set();
function notifyListeners() { listeners.forEach(fn => { try { fn(); } catch { /* ignore */ } }); }

// Fetch logic ----------------------------------------------------------------
async function loadFlags(force = false) {
  const now = Date.now();
  if (!force && _flags && (now - _lastFetch) < STALE_MS) return _flags;
  if (!force && _pending) return _pending;
  _pending = fetch((import.meta.env.VITE_API_BASE_URL || '/api') + '/settings/features')
    .then(r => r.ok ? r.json() : [])
    .then(rows => {
      _flags = rows.reduce((acc, f) => { acc[f.flagKey || f.flag_key] = f; return acc; }, {});
      _lastFetch = Date.now();
      _pending = null;
      notifyListeners();
      return _flags;
    })
    .catch(() => { _pending = null; return _flags || {}; });
  return _pending;
}

// Background revalidation loop (lightweight) ----------------------------------
let loopStarted = false;
function startLoop() {
  if (loopStarted || !hasWindow) return; loopStarted = true;
  // Tick every 5s: if stale, refetch; also refetch on window focus
  setInterval(() => { if (Date.now() - _lastFetch >= STALE_MS) loadFlags(); }, 5000);
  window.addEventListener('focus', () => loadFlags(true));
}

// Effective flag resolution ---------------------------------------------------
function isFlagEnabled(key, defaultValue) {
  if (Object.prototype.hasOwnProperty.call(_overrides, key)) return !!_overrides[key];
  if (_flags && _flags[key]) return !!_flags[key].enabled;
  return !!defaultValue;
}

// Public React hook -----------------------------------------------------------
export function useFeature(flagKey, defaultValue = false) {
  const [enabled, setEnabled] = useState(() => isFlagEnabled(flagKey, defaultValue));

  useEffect(() => {
    let mounted = true;
    function sync() { if (mounted) setEnabled(isFlagEnabled(flagKey, defaultValue)); }
    listeners.add(sync);
    // Initial fetch / resolve
    loadFlags().then(() => sync());
    startLoop();
    return () => { mounted = false; listeners.delete(sync); };
  }, [flagKey, defaultValue]);

  return enabled;
}

export default useFeature;
