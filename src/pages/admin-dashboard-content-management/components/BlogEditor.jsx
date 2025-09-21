import React, { useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { validateBlog } from '../../../utils/validation';
import FileUpload from '../../../components/ui/FileUpload';
import storageService from '../../../utils/storageService';

const MarkdownEditor = ({ id = 'md-editor', value, onChange, placeholder = 'Write your post in Markdown...' }) => {
  const fileInputRef = useRef(null);
  const applyWrap = (prefix, suffix = prefix) => {
    const ta = document.getElementById(id);
    if (!ta) return onChange((value || '') + `${prefix}${suffix}`);
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);
    const next = `${before}${prefix}${selected || 'text'}${suffix}${after}`;
    onChange(next);
    setTimeout(() => { ta.focus(); }, 0);
  };
  const insertLink = () => {
    const url = prompt('Enter URL');
    if (url) applyWrap('[', `](${url})`);
  };
  const insertCodeBlock = () => {
    const ta = document.getElementById(id);
    const lang = prompt('Language (optional)') || '';
    const start = ta?.selectionStart ?? 0;
    const end = ta?.selectionEnd ?? 0;
    const before = value.slice(0, start);
    const selected = value.slice(start, end) || 'code';
    const after = value.slice(end);
    const block = '\n\n```' + lang + '\n' + selected + '\n```\n\n';
    onChange(before + block + after);
    setTimeout(() => { ta?.focus(); }, 0);
  };
  const insertList = (ordered = false) => {
    const ta = document.getElementById(id);
    const bullet = ordered ? '1.' : '-';
    if (!ta) return onChange(`${value || ''}\n${bullet} item`);
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const before = value.slice(0, start);
    const selected = (value.slice(start, end) || 'item').replace(/^/gm, `${bullet} `);
    const after = value.slice(end);
    const next = `${before}\n${selected}${after}`;
    onChange(next);
  };
  const onPickImage = () => fileInputRef.current?.click();
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await storageService.uploadFile(file, { bucket: 'media', pathPrefix: 'blog/content' });
    if (res.success) {
      const url = res.data.url;
      const ta = document.getElementById(id);
      const start = ta?.selectionStart ?? value.length;
      const end = ta?.selectionEnd ?? value.length;
      const before = value.slice(0, start);
      const after = value.slice(end);
      const md = `![image](${url})`;
      onChange(before + md + after);
    }
    e.target.value = '';
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        <Button type="button" size="sm" variant="outline" onClick={() => applyWrap('**')}>Bold</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => applyWrap('*')}>Italic</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => applyWrap('`')}>Code</Button>
        <Button type="button" size="sm" variant="outline" onClick={insertCodeBlock}>Code Block</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => applyWrap('> ' , '')}>Quote</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => insertList(false)}>• List</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => insertList(true)}>1. List</Button>
        <Button type="button" size="sm" variant="outline" onClick={insertLink}>Link</Button>
        <Button type="button" size="sm" variant="outline" onClick={onPickImage} iconName="Image">Image</Button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </div>
      <textarea
        id={id}
        className="w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg min-h-[320px] font-mono text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

const BlogEditor = ({ mode = 'create', initialData = {}, onCancel, onSave }) => {
  const [form, setForm] = useState(() => ({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featuredImage: '',
    status: 'draft',
    readTime: 5,
    slug: '',
    featured: false,
    metaTitle: '',
    metaDescription: '',
    publishedAt: '',
    ...initialData,
    ...(initialData?.tags !== undefined ? { tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || '') } : {}),
  }));
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(false);

  const headerTitle = useMemo(() => mode === 'edit' ? 'Edit Blog Post' : 'Create Blog Post', [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateBlog(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const tags = (form.tags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const slug = (form.slug || form.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const words = (form.content || '').trim().split(/\s+/).filter(Boolean).length;
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
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      publishDate: form.publishedAt || (form.status === 'published' ? new Date().toISOString() : null),
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-border-accent/20 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-heading font-semibold text-text-primary">{headerTitle}</h2>
            <p className="text-xs text-text-secondary font-caption">Write comfortably with full-page editor</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel} iconName="ArrowLeft" iconPosition="left">Back</Button>
            <Button onClick={handleSubmit} iconName="Save" iconPosition="left">{mode === 'edit' ? 'Save Changes' : 'Create Post'}</Button>
          </div>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              {errors.title && <p className="mt-1 text-xs text-error">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Slug</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from title" />
              {errors.slug && <p className="mt-1 text-xs text-error">{errors.slug}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Status</label>
              <select className="w-full bg-surface border border-border-accent/20 rounded-lg px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="featured" type="checkbox" className="w-4 h-4" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              <label htmlFor="featured" className="text-sm text-text-secondary">Featured</label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Excerpt</label>
            <textarea className="w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg" rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm text-text-secondary mb-1">Content</label>
              <Button type="button" size="sm" variant="outline" onClick={() => setPreview(v => !v)}>
                {preview ? 'Hide Preview' : 'Preview Markdown'}
              </Button>
            </div>
            <MarkdownEditor id="blog-md-editor" value={form.content} onChange={(val) => setForm({ ...form, content: val })} />
            {errors.content && <p className="mt-1 text-xs text-error">{errors.content}</p>}
            {preview && (
              <div className="mt-3 p-3 border border-border-accent/20 rounded bg-background/40 prose prose-invert max-w-none">
                <ReactMarkdown>{form.content || ''}</ReactMarkdown>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Category</label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Tags (comma-separated)</label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
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
              {errors.featuredImage && <p className="mt-1 text-xs text-error">{errors.featuredImage}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Read Time (minutes)</label>
              <Input type="number" min="1" value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} />
              {errors.readTime && <p className="mt-1 text-xs text-error">{errors.readTime}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Publish Date</label>
              <Input type="datetime-local" value={form.publishedAt || ''} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Meta Title</label>
              <Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
              {errors.metaTitle && <p className="mt-1 text-xs text-error">{errors.metaTitle}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Meta Description</label>
              <textarea className="w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg" rows={3} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
              {errors.metaDescription && <p className="mt-1 text-xs text-error">{errors.metaDescription}</p>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogEditor;
