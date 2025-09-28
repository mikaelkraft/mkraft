import React, { useEffect, useState } from 'react';
import HeaderNavigation from 'components/ui/HeaderNavigation';
import useFeature from 'hooks/useFeature';

export default function FeatureFlagsPage() {
  const adminGateEnabled = useFeature('feature_flags_admin', true); // always true until gated separately
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null); // flag key currently saving

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || '/api') + '/settings/features');
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setFlags(data);
    } catch (e) {
      setError(e.message || 'Failed to load flags');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function toggleFlag(key, current) {
    setSaving(key);
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || '/api') + '/settings/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag_key: key, enabled: !current })
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setFlags(f => f.map(ff => ff.flagKey === updated.flagKey ? updated : ff));
    } catch (e) {
      // surface error temporarily
      alert('Update failed: ' + e.message);
    } finally { setSaving(null); }
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation />
      <main className="max-w-4xl mx-auto pt-28 px-6 pb-24">
        <h1 className="text-2xl font-semibold mb-6">Feature Flags</h1>
        {!adminGateEnabled && <p className="text-text-secondary">Access disabled.</p>}
        {adminGateEnabled && (
          <>
            {loading && <p className="text-sm text-text-secondary">Loading…</p>}
            {error && <p className="text-error text-sm">{error}</p>}
            <div className="overflow-x-auto border border-border-accent/20 rounded-lg shadow-sm bg-surface">
              <table className="w-full text-sm">
                <thead className="bg-border-accent/10 text-text-secondary">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Flag</th>
                    <th className="text-left px-4 py-2 font-medium">Enabled</th>
                    <th className="text-left px-4 py-2 font-medium">Note</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {flags.map(f => (
                    <tr key={f.flagKey} className="border-t border-border-accent/10">
                      <td className="px-4 py-2 font-mono text-xs">{f.flagKey}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] uppercase tracking-wide ${f.enabled ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-border-accent/20 text-text-secondary border border-border-accent/40'}`}>{f.enabled ? 'On' : 'Off'}</span>
                      </td>
                      <td className="px-4 py-2 text-text-secondary/80 max-w-[280px] truncate" title={f.note || ''}>{f.note || '—'}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          disabled={saving === f.flagKey}
                          onClick={() => toggleFlag(f.flagKey, f.enabled)}
                          className="text-xs px-3 py-1.5 rounded bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving === f.flagKey ? 'Saving…' : (f.enabled ? 'Disable' : 'Enable')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11px] text-text-secondary/70">Changes take effect on next feature lookup (cached up to 30s).</p>
          </>
        )}
      </main>
    </div>
  );
}
