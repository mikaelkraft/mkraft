import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function MediaLibrary() {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [tag, setTag] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [alt, setAlt] = useState('');
  const pageSize = 24;

  useEffect(() => {
    fetchAssets(); // eslint-disable-next-line
  }, [page, tag]);

  async function fetchAssets() {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ limit: pageSize, offset: (page - 1) * pageSize });
      if (tag) params.set('tag', tag);
      const res = await fetch(`/api/media?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAssets(data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      if (alt) form.append('alt', alt);
      if (tag) form.append('tags', tag);
      const res = await fetch('/api/media/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setFile(null); setAlt('');
      fetchAssets();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  if (!user?.is_admin) {
    return <div className="p-6 text-red-600">Admin access required.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Media Library</h1>
      <form onSubmit={handleUpload} className="mb-6 flex flex-col gap-2 md:flex-row md:items-end">
        <div>
          <label className="block text-sm font-medium">File</label>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Alt Text</label>
          <input className="border rounded px-2 py-1" value={alt} onChange={e => setAlt(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Tag</label>
            <input className="border rounded px-2 py-1" value={tag} onChange={e => { setTag(e.target.value); setPage(1); }} />
        </div>
        <button disabled={uploading || !file} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" type="submit">
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? <div>Loading...</div> : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {assets.map(a => (
            <figure key={a.id} className="border rounded overflow-hidden bg-white shadow-sm">
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                <img src={a.url} alt={a.altText || ''} className="object-cover w-full h-full" loading="lazy" />
              </div>
              <figcaption className="p-2 text-xs break-words">
                <div className="font-medium truncate" title={a.url}>{a.url.split('/').pop()}</div>
                <div className="text-gray-500">{a.width}x{a.height}</div>
                {a.tags?.length ? <div className="mt-1 flex flex-wrap gap-1">{a.tags.map(t => <span key={t} className="bg-gray-200 px-1 rounded">{t}</span>)}</div> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      <div className="mt-6 flex gap-2">
        <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <span className="px-2 py-1">Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  );
}
