import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import blogService from '../../utils/blogService';
import RelatedPosts from './RelatedPosts.jsx';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true); setError(null);
      const res = await blogService.getPostBySlug(slug);
      if (!active) return;
      if (res.success) setPost(res.data);
      else setError(res.error || 'Failed to load post');
      setLoading(false);
    })();
    return () => { active = false; };
  }, [slug]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!post) return <div className="p-6">Not found</div>;

  return (
    <article className="max-w-3xl mx-auto p-6 prose prose-invert">
      <h1>{post.title}</h1>
      {post.excerpt && <p className="lead text-gray-400">{post.excerpt}</p>}
      {post.featured_image && (
        <img src={post.featured_image} alt="Featured" className="rounded-lg shadow mb-6" />
      )}
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <div className="mt-8 border-t border-gray-700 pt-6">
        <RelatedPosts slug={post.slug} />
      </div>
    </article>
  );
}
