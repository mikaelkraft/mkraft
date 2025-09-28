import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import blogService from 'utils/blogService';
import HeaderNavigation from 'components/ui/HeaderNavigation';
import useFeature from 'hooks/useFeature';
import Icon from 'components/AppIcon';

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const enabled = useFeature('full_text_search', true);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!enabled || !q.trim()) { setResults([]); return; }
    setLoading(true); setError(null);
    (async () => {
      const res = await blogService.searchPosts(q.trim());
      if (!active) return;
      if (res.success) setResults(res.data);
      else setError(res.error || 'Search failed');
      setLoading(false);
    })();
    return () => { active = false; };
  }, [q, enabled]);

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2"><Icon name="Search" size={22}/> Search</h1>
        {!enabled && <p className="text-text-secondary">Search is currently disabled.</p>}
        {enabled && (
          <>
            <p className="text-sm text-text-secondary mb-4">Query: <span className="font-mono text-text-primary">{q || '—'}</span></p>
            {loading && <p className="text-sm text-text-secondary">Searching…</p>}
            {error && <p className="text-error text-sm">{error}</p>}
            {!loading && !error && enabled && q && results.length === 0 && (
              <p className="text-sm text-text-secondary">No results found.</p>
            )}
            <ul className="space-y-4">
              {results.map(r => {
                const snippetHtml = r.snippet || '';
                const hasSnippet = /<mark>/i.test(snippetHtml);
                return (
                  <li key={r.id} className="p-4 rounded border border-border-accent/20 bg-surface hover:border-primary/60 transition">
                    <Link to={`/blog/${r.slug}`} className="group block">
                      <h2 className="font-medium group-hover:text-primary line-clamp-1">{r.title}</h2>
                      {hasSnippet && (
                        <p className="text-sm text-text-secondary mt-1 line-clamp-3" dangerouslySetInnerHTML={{ __html: snippetHtml }} />
                      )}
                      {!hasSnippet && r.excerpt && (
                        <p className="text-sm text-text-secondary line-clamp-2 mt-1">{r.excerpt}</p>
                      )}
                      <div className="mt-2 text-[10px] uppercase tracking-wide text-text-secondary/70 flex items-center gap-2">
                        {r.published_at && <time dateTime={r.published_at}>{new Date(r.published_at).toLocaleDateString()}</time>}
                        {typeof r.rank === 'number' && <span>Rank: {r.rank.toFixed(2)}</span>}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
