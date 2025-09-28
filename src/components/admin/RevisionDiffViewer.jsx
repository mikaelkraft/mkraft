import React, { useEffect, useState } from 'react';
import { simpleLineDiff } from '../../utils/diff';

export default function RevisionDiffViewer({ revisionId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diffRows, setDiffRows] = useState([]);
  const base = import.meta.env.VITE_API_BASE_URL || '/api';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(base + '/blog/revision-diff?revisionId=' + revisionId);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!mounted) return;
        const diff = simpleLineDiff(data.before.content || '', data.after.content || '');
        setDiffRows(diff.slice(0, 4000)); // safety cap
      } catch (e) {
        if (mounted) setError('Failed to load diff');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [revisionId]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/90 backdrop-blur p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Revision Diff</h2>
        <button onClick={onClose} className="px-3 py-1 rounded bg-error text-background text-sm">Close</button>
      </div>
      {loading && <div className="text-sm text-text-secondary">Loading…</div>}
      {error && <div className="text-sm text-error mb-2">{error}</div>}
      <div className="flex-1 overflow-auto rounded border border-border-accent/30 bg-surface text-xs font-mono">
        {diffRows.map((r, i) => (
          <div key={i} className={
            r.type === 'context' ? 'flex px-2 py-0.5' : r.type === 'add' ? 'flex px-2 py-0.5 bg-success/10' : 'flex px-2 py-0.5 bg-error/10'
          }>
            <div className="w-1/2 pr-2 whitespace-pre-wrap break-words border-r border-border-accent/20">
              {r.before}
            </div>
            <div className="w-1/2 pl-2 whitespace-pre-wrap break-words">
              {r.after}
            </div>
          </div>
        ))}
        {!loading && diffRows.length === 0 && <div className="p-4 text-text-secondary">No differences.</div>}
      </div>
    </div>
  );
}
