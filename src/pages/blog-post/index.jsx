import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import blogService from "utils/blogService";

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [related, setRelated] = useState([]);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    const res = await blogService.getPostBySlug(slug);
    if (res.success) {
      setPost(res.data);
    } else {
      setError(res.error || "Failed to load post");
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      try {
        const rel = await blogService.getRelatedPosts(slug);
        if (rel.success) setRelated(rel.data);
      } catch {}
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderNavigation />
        <div className="max-w-3xl mx-auto p-6">Loading...</div>
      </div>
    );
  }
  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderNavigation />
        <div className="max-w-3xl mx-auto p-6 text-error">
          {error || "Not found"}
        </div>
      </div>
    );
  }

  const title = post.title || "Untitled";
  const desc = post.excerpt || (post.content || "").slice(0, 140);

  return (
    <div className="min-h-screen bg-background">
      <OGMeta
        title={title + " — Blog"}
        description={desc}
        image={post.featured_image || undefined}
      />
      <Helmet>
        <title>{title} — Blog</title>
        <meta name="description" content={desc} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://mkraft.tech/blog/${slug}`} />
        <meta
          property="og:image"
          content={post.featured_image || "/assets/images/no_image.png"}
        />
      </Helmet>
      <HeaderNavigation />
      <main className="max-w-3xl mx-auto p-6">
        <article>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            {title}
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                const shareData = {
                  title,
                  text: desc,
                  url: window.location.href,
                };
                if (navigator.share) {
                  navigator.share(shareData).catch(() => {});
                } else {
                  try {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard");
                  } catch {}
                }
              }}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-border-accent/40 rounded hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors"
              aria-label="Share this post"
            >
              <Icon name="Share2" size={14} /> Share
            </button>
          </div>
          {post.author?.full_name && (
            <div className="text-sm text-text-secondary mb-6 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Icon name="User" size={16} />
                <span className="text-text-primary font-medium">
                  {post.author.full_name}
                </span>
              </div>
              <RoleBadge
                role={post.author.role}
                email={post.author.email}
                adminEmail={import.meta.env.VITE_ADMIN_EMAIL}
              />
              {post.published_at && (
                <time className="text-xs" dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString()}
                </time>
              )}
            </div>
          )}
          {post.featured_image && (
            <img
              src={post.featured_image}
              alt="Featured"
              className="w-full rounded mb-6 object-cover max-h-[420px]"
            />
          )}
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
          {post.tags?.length ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs bg-border-accent/30 px-2 py-1 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </article>

        <section className="mt-14">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Icon name="Link" size={18} /> Related Posts
          </h2>
          {!related.length && (
            <p className="text-text-secondary text-sm">No related posts yet.</p>
          )}
          <ul className="space-y-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/blog/${r.slug}`}
                  className="group block p-4 rounded bg-surface border border-border-accent/20 hover:border-primary transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-medium group-hover:text-primary truncate">
                      {r.title}
                    </h3>
                    {r.author?.role && (
                      <RoleBadge
                        role={r.author.role}
                        email={r.author.email}
                        adminEmail={import.meta.env.VITE_ADMIN_EMAIL}
                      />
                    )}
                  </div>
                  {r.excerpt && (
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {r.excerpt}
                    </p>
                  )}
                  {r.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-border-accent/40 px-1 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default BlogPost;
