import { useMemo, useState, useEffect } from "react";
import { validateBlog } from "../../../utils/validation";
import storageService from "../../../utils/storageService";
import MarkdownField from "../../../components/ui/MarkdownField";

// Removed inline MarkdownEditor in favor of shared MarkdownToolbar component.

const BlogEditor = ({
  mode = "create",
  initialData = {},
  onCancel,
  onSave,
}) => {
  const [form, setForm] = useState(() => ({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    featuredImage: "",
    status: "draft",
    readTime: 5,
    slug: "",
    featured: false,
    sourceUrl: "",
    metaTitle: "",
    metaDescription: "",
    publishedAt: "",
    ...initialData,
    ...(initialData?.tags !== undefined
      ? {
          tags: Array.isArray(initialData.tags)
            ? initialData.tags.join(", ")
            : initialData.tags || "",
        }
      : {}),
  }));
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(false);
  const [revisions, setRevisions] = useState([]);
  const [revLoading, setRevLoading] = useState(false);
  const [diffRevisionId, setDiffRevisionId] = useState(null);
  const [showRevisionsPanel, setShowRevisionsPanel] = useState(false);
  const base = import.meta.env.VITE_API_BASE_URL || "/api";

  useEffect(() => {
    let mounted = true;
    const loadRevisions = async () => {
      if (mode !== "edit" || !initialData?.id) return;
      setRevLoading(true);
      try {
        const res = await fetch(
          base + "/blog/revisions?postId=" + initialData.id + "&limit=20",
        );
        if (res.ok) {
          const data = await res.json();
          if (mounted) setRevisions(data);
        }
      } catch {
      } finally {
        if (mounted) setRevLoading(false);
      }
    };
    loadRevisions();
    return () => {
      mounted = false;
    };
  }, [mode, initialData?.id]);

  const headerTitle = useMemo(
    () => (mode === "edit" ? "Edit Blog Post" : "Create Blog Post"),
    [mode],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateBlog(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const tags = (form.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const slug = (form.slug || form.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const words = (form.content || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    const estRead = Math.max(1, Math.ceil(words / 200));
    await onSave({
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      category: form.category || undefined,
      tags,
      featuredImage: form.featuredImage || undefined,
      status: form.status,
      readTime: Number(form.readTime || estRead) || estRead,
      slug,
      featured: !!form.featured,
      sourceUrl: form.sourceUrl || undefined,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      publishDate:
        form.publishedAt ||
        (form.status === "published" ? new Date().toISOString() : null),
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-border-accent/20 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-heading font-semibold text-text-primary">
              {headerTitle}
            </h2>
            <p className="text-xs text-text-secondary font-caption">
              Write comfortably with full-page editor
            </p>
          </div>
          <div className="flex items-center gap-2">
            {mode === "edit" && (
              <Button
                type="button"
                size="sm"
                variant={showRevisionsPanel ? "solid" : "outline"}
                iconName="History"
                onClick={() => setShowRevisionsPanel((v) => !v)}
              >
                {showRevisionsPanel ? "Hide Revisions" : "Revisions"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onCancel}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Back
            </Button>
            <Button onClick={handleSubmit} iconName="Save" iconPosition="left">
              {mode === "edit" ? "Save Changes" : "Create Post"}
            </Button>
          </div>
        </div>
      </div>

      {/* Body with optional side panel */}
      <div className="flex-1 overflow-hidden flex">
        {showRevisionsPanel && mode === "edit" && (
          <aside className="w-72 border-r border-border-accent/20 bg-background/60 backdrop-blur-sm flex flex-col">
            <div className="p-3 border-b border-border-accent/10 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide uppercase text-text-secondary">
                Revisions
              </span>
              <button
                type="button"
                className="text-text-secondary hover:text-text-primary"
                onClick={() => setShowRevisionsPanel(false)}
              >
                <Icon name="X" size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-1">
              {revLoading && (
                <div className="text-xs text-text-secondary py-2">Loading…</div>
              )}
              {!revLoading && revisions.length === 0 && (
                <div className="text-xs text-text-secondary py-2">
                  No revisions yet.
                </div>
              )}
              {!revLoading &&
                revisions.map((r) => (
                  <div
                    key={r.id}
                    className="group border border-border-accent/10 rounded-md px-2 py-1 hover:border-primary/50 transition flex flex-col gap-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => setDiffRevisionId(r.id)}
                      className="text-left text-xs font-medium text-text-primary/90 hover:text-primary truncate"
                    >
                      {new Date(r.created_at).toLocaleString()}
                    </button>
                    <div className="text-[10px] text-text-secondary line-clamp-2">
                      {r.title}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => setDiffRevisionId(r.id)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        Diff
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            !confirm(
                              "Restore this revision? This will overwrite the current content.",
                            )
                          )
                            return;
                          try {
                            const resp = await fetch(
                              base + "/blog/revisions/restore",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ revisionId: r.id }),
                              },
                            );
                            if (resp.ok) {
                              // Reload revisions (new revision should be created on next save anyway) and maybe refetch post? For now update local form.
                              setDiffRevisionId(null);
                              setShowRevisionsPanel(false);
                              // We could fetch the post again; assuming parent refresh after onSave not available yet.
                            } else {
                              console.error("Failed to restore");
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning hover:bg-warning/20"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </aside>
        )}
        <div className="flex-1 overflow-auto">
          <form
            onSubmit={handleSubmit}
            className="max-w-5xl mx-auto p-6 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Title
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-error">{errors.title}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Slug
                </label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generated from title"
                />
                {errors.slug && (
                  <p className="mt-1 text-xs text-error">{errors.slug}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Status
                </label>
                <select
                  className="w-full bg-surface border border-border-accent/20 rounded-lg px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="featured"
                  type="checkbox"
                  className="w-4 h-4"
                  checked={!!form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                />
                <label
                  htmlFor="featured"
                  className="text-sm text-text-secondary"
                >
                  Featured
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Excerpt
              </label>
              <textarea
                className="w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg"
                rows={3}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm text-text-secondary mb-1">
                  Content
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPreview((v) => !v)}
                >
                  {preview ? "Hide Preview" : "Preview Markdown"}
                </Button>
              </div>
              <MarkdownField
                id="blog-md-editor"
                value={form.content}
                onChange={(val) => setForm({ ...form, content: val })}
                onUploadImage={async (file) => {
                  const res = await storageService.uploadFile(file, {
                    bucket: "media",
                    pathPrefix: "blog/content",
                  });
                  if (res.success) return res.data.url;
                  throw new Error("Upload failed");
                }}
                textareaClassName="min-h-[320px] mt-2"
                placeholder="Write your post in Markdown..."
              />
              {errors.content && (
                <p className="mt-1 text-xs text-error">{errors.content}</p>
              )}
              {preview && (
                <div className="mt-3 p-3 border border-border-accent/20 rounded bg-background/40 prose prose-invert max-w-none">
                  <ReactMarkdown>{form.content || ""}</ReactMarkdown>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Category
                </label>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Tags (comma-separated)
                </label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <FileUpload
                  label="Featured Image"
                  value={form.featuredImage}
                  onChange={(url) => setForm({ ...form, featuredImage: url })}
                  bucket="media"
                  pathPrefix="blog/featured"
                  accept="image"
                  helperText="Select or drop an image to upload."
                />
                {errors.featuredImage && (
                  <p className="mt-1 text-xs text-error">
                    {errors.featuredImage}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Source URL (optional)
                </label>
                <Input
                  type="url"
                  value={form.sourceUrl || ""}
                  onChange={(e) =>
                    setForm({ ...form, sourceUrl: e.target.value })
                  }
                  placeholder="https://example.com/original-source"
                  helperText="Reference link if content is based on or inspired by another source"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Read Time (minutes)
                </label>
                <Input
                  type="number"
                  min="1"
                  value={form.readTime}
                  onChange={(e) =>
                    setForm({ ...form, readTime: e.target.value })
                  }
                />
                {errors.readTime && (
                  <p className="mt-1 text-xs text-error">{errors.readTime}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Publish Date
                </label>
                <Input
                  type="datetime-local"
                  value={form.publishedAt || ""}
                  onChange={(e) =>
                    setForm({ ...form, publishedAt: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-text-secondary mb-1">
                  Meta Title
                </label>
                <Input
                  value={form.metaTitle}
                  onChange={(e) =>
                    setForm({ ...form, metaTitle: e.target.value })
                  }
                />
                {errors.metaTitle && (
                  <p className="mt-1 text-xs text-error">{errors.metaTitle}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-text-secondary mb-1">
                  Meta Description
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg"
                  rows={3}
                  value={form.metaDescription}
                  onChange={(e) =>
                    setForm({ ...form, metaDescription: e.target.value })
                  }
                />
                {errors.metaDescription && (
                  <p className="mt-1 text-xs text-error">
                    {errors.metaDescription}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      {diffRevisionId && (
        <React.Suspense
          fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 text-sm">
              Loading diff…
            </div>
          }
        >
          {/* Inline import fallback if code splitting added later */}
          <RevisionDiffPortal
            revisionId={diffRevisionId}
            onClose={() => setDiffRevisionId(null)}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default BlogEditor;

// Local portal component referencing already bundled viewer
function RevisionDiffPortal({ revisionId, onClose }) {
  return <RevisionDiffViewer revisionId={revisionId} onClose={onClose} />;
}
