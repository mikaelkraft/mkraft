import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import blogService from 'utils/blogService';
import Icon from 'components/AppIcon';

/**
 * RelatedPosts Component
 * Fetches and displays related posts for a given slug.
 * Includes safeguards against memory leaks / race conditions.
 */
export default function RelatedPosts({ slug, limit = 3, heading = 'Related Posts' }) {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const requestIdRef = useRef(0); // incremental id to discard stale responses
	const cacheRef = useRef(new Map()); // simple in-memory session cache
	const debounceRef = useRef(null);

	useEffect(() => {
		if (!slug) return;
		// Avoid refetch if already cached
		if (cacheRef.current.has(slug)) {
			setPosts(cacheRef.current.get(slug));
			return;
		}
		setLoading(true); setError(null);
		const currentReq = ++requestIdRef.current;
		clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(async () => {
			try {
				const res = await blogService.getRelatedPosts?.(slug, { limit });
				if (requestIdRef.current !== currentReq) return; // stale
				if (res?.success) {
					const data = (res.data || []).slice(0, limit);
						cacheRef.current.set(slug, data);
						setPosts(data);
				} else if (res?.error) {
					setError(res.error);
				}
			} catch (e) {
				if (requestIdRef.current === currentReq) setError('Failed to load related posts');
			} finally {
				if (requestIdRef.current === currentReq) setLoading(false);
			}
		}, 150); // small debounce to collapse quick slug changes

		return () => {
			// Mark any in-flight response as stale
			requestIdRef.current++;
			clearTimeout(debounceRef.current);
		};
	}, [slug, limit]);

	if (!slug) return null;
	return (
		<section aria-labelledby="related-posts-heading" className="mt-10">
			<h2 id="related-posts-heading" className="text-xl font-semibold mb-4 flex items-center gap-2">
				<Icon name="Link" size={18} /> {heading}
			</h2>
			{loading && (
				<ul className="space-y-3 animate-pulse">
					{Array.from({ length: limit }).map((_, i) => (
						<li key={i} className="p-4 rounded bg-surface/60 border border-border-accent/20">
							<div className="h-4 bg-border-accent/40 rounded w-2/3 mb-2" />
							<div className="h-3 bg-border-accent/30 rounded w-5/6" />
						</li>
					))}
				</ul>
			)}
			{!loading && error && <p className="text-error text-sm">{error}</p>}
			{!loading && !error && !posts.length && (
				<p className="text-text-secondary text-sm">No related posts yet.</p>
			)}
			{!loading && posts.length > 0 && (
				<ul className="space-y-3">
					{posts.map(p => (
						<li key={p.id}>
							<Link
								to={`/blog/${p.slug}`}
								className="group block p-4 rounded bg-surface border border-border-accent/20 hover:border-primary transition"
							>
								<h3 className="font-medium group-hover:text-primary line-clamp-1">{p.title}</h3>
								{p.excerpt && <p className="text-sm text-text-secondary line-clamp-2">{p.excerpt}</p>}
								{p.tags?.length ? (
									<div className="mt-2 flex flex-wrap gap-1">
										{p.tags.slice(0, 4).map(t => (
											<span key={t} className="text-[10px] bg-border-accent/40 px-1 rounded">{t}</span>
										))}
									</div>
								) : null}
							</Link>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
