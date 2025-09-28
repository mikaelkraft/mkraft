import React, { useEffect, useState, useCallback } from 'react';
import useFeature from 'hooks/useFeature';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const actions = [
  { id: 'new-post', title: 'New Blog Post', run: (nav) => nav('/admin-dashboard-content-management') },
  { id: 'media-library', title: 'Open Media Library', run: (nav) => nav('/admin/media') },
  { id: 'projects', title: 'Projects Dashboard', run: (nav) => nav('/projects-portfolio-grid') },
  { id: 'home', title: 'Go Home', run: (nav) => nav('/') },
];

export default function CommandPalette() {
  const enabled = useFeature('command_palette');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const listener = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setOpen(o => !o);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [listener]);

  if (!enabled) return null;

  const filtered = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  return createPortal(
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-28">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-xl mx-auto bg-surface border border-border-accent/30 rounded-xl shadow-xl overflow-hidden">
            <input
              autoFocus
              placeholder="Type a command or search..."
              className="w-full px-4 py-3 bg-transparent outline-none text-sm border-b border-border-accent/20"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <ul className="max-h-80 overflow-y-auto">
              {filtered.length === 0 && (
                <li className="px-4 py-4 text-text-secondary text-sm">No matches</li>
              )}
              {filtered.map(a => (
                <li key={a.id}>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-primary/10 text-sm flex items-center gap-2"
                    onClick={() => { a.run(navigate); setOpen(false); }}
                  >
                    {a.title}
                  </button>
                </li>
              ))}
            </ul>
            <div className="px-4 py-2 text-[10px] uppercase tracking-wide text-text-secondary border-t border-border-accent/20 flex justify-between">
              <span>Ctrl / Cmd + K</span>
              <span>Enter to run • Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
