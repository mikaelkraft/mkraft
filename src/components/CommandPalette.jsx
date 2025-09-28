import React, { useEffect, useState, useCallback, useRef } from 'react';
import useFeature from 'hooks/useFeature';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { coreActions, buildEphemeralActions } from './commandPalette/actions';
import blogService from 'utils/blogService';

// Simple fuzzy score: higher is better.
function score(str, query) {
  if (!query) return 0;
  str = str.toLowerCase();
  query = query.toLowerCase();
  if (str.includes(query)) return 100 + (50 - str.indexOf(query)); // prefer early matches
  // Non-contiguous scoring
  let s = 0, qi = 0;
  for (let i = 0; i < str.length && qi < query.length; i++) {
    if (str[i] === query[qi]) { s += 5; qi++; }
  }
  if (qi === query.length) s += 20; // full sequence matched
  return s;
}

export default function CommandPalette() {
  const enabled = useFeature('command_palette');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [postResults, setPostResults] = useState([]); // search suggestions
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef(new Map());
  const navigate = useNavigate();
  const inputRef = useRef(null);

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

  // Build action set (core + ephemeral)
  const ephemeral = buildEphemeralActions(query);
  let actionCandidates = [...coreActions, ...ephemeral];

  const baseQuery = query.startsWith('?') ? query.slice(1) : query; // allow leading ? for explicit search intent

  // Compute fuzzy scores
  const scored = baseQuery
    ? actionCandidates.map(a => ({ ...a, _score: score(a.title + ' ' + (a.keywords || []).join(' '), baseQuery) }))
      .filter(a => a._score > 0)
      .sort((a,b) => b._score - a._score)
    : actionCandidates.map(a => ({ ...a, _score: 0 }));

  // Posts group list
  const showPostSearch = baseQuery.length > 1; // simple heuristic
  const posts = postResults;

  const groups = [];
  groups.push({ label: 'Commands', items: scored.length ? scored : actionCandidates });
  if (showPostSearch) groups.push({ label: 'Posts', items: posts.map(p => ({
    id: 'post-' + p.slug,
    title: p.title,
    run: (nav) => nav('/blog/' + p.slug)
  })) });

  const flat = groups.flatMap(g => g.items.map(it => ({ group: g.label, ...it })));
  const clampedActive = Math.min(activeIndex, flat.length - 1);
  useEffect(() => { if (clampedActive !== activeIndex) setActiveIndex(clampedActive); }, [clampedActive, activeIndex]);

  // Fetch post suggestions (debounced) using blogService (falls back to simple search in Supabase mode)
  useEffect(() => {
    if (!open) return;
    const term = baseQuery.trim();
    if (term.length < 2) { setPostResults([]); return; }
    const key = term.toLowerCase();
    if (cacheRef.current.has(key)) { setPostResults(cacheRef.current.get(key)); return; }
    let aborted = false;
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await blogService.searchPosts?.(term);
        if (!aborted && res?.success) {
          cacheRef.current.set(key, res.data.slice(0,5));
          setPostResults(res.data.slice(0,5));
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    }, 240);
    return () => { aborted = true; clearTimeout(t); };
  }, [baseQuery, open]);

  const onKeyDown = useCallback((e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, flat.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); const item = flat[activeIndex]; if (item) { item.run(navigate); setOpen(false); } }
  }, [open, flat, activeIndex, navigate]);

  useEffect(() => {
    if (open) {
      // Focus input when palette opened
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery('');
      setPostResults([]);
      setActiveIndex(0);
    }
  }, [open]);

  return createPortal(
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-28">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-xl mx-auto bg-surface border border-border-accent/30 rounded-xl shadow-xl overflow-hidden">
            <input
              ref={inputRef}
              placeholder="Type a command or search… (↑↓ navigate)"
              className="w-full px-4 py-3 bg-transparent outline-none text-sm border-b border-border-accent/20"
              value={query}
              onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
              onKeyDown={onKeyDown}
            />
            <div className="max-h-80 overflow-y-auto" onKeyDown={onKeyDown}>
              {flat.length === 0 && (
                <div className="px-4 py-4 text-text-secondary text-sm">No matches</div>
              )}
              {groups.map(g => (
                <div key={g.label}>
                  <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wide text-text-secondary">{g.label}{g.label==='Posts' && loading ? ' • Loading…' : ''}</div>
                  <ul>
                    {g.items.map(item => {
                      const idx = flat.findIndex(f => f.id === item.id && f.group === g.label);
                      const isActive = idx === clampedActive;
                      return (
                        <li key={item.id}>
                          <button
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${isActive ? 'bg-primary/20 text-primary-foreground' : 'hover:bg-primary/10'}`}
                            onClick={() => { item.run(navigate); setOpen(false); }}
                            onMouseEnter={() => setActiveIndex(idx)}
                          >
                            {item.title}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 text-[10px] uppercase tracking-wide text-text-secondary border-t border-border-accent/20 flex justify-between">
              <span>Ctrl / Cmd + K</span>
              <span>Enter run • Esc close • post:Title create</span>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
