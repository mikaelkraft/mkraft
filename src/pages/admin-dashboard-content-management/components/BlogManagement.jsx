import React, { useState, useEffect } from 'react';
import RoleBadge from '../../../components/ui/RoleBadge';
import ReactMarkdown from 'react-markdown';
import { validateBlog } from '../../../utils/validation';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';
import FileUpload from '../../../components/ui/FileUpload';

const BlogManagement = ({ blogPosts, onPostUpdate, onPostDelete, onPostCreate, onOpenEditor }) => {
  const MarkdownEditor = ({ id = 'md-editor', value, onChange, placeholder = 'Write your post in Markdown...' }) => {
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
      setTimeout(() => {
        ta.focus();
      }, 0);
    };
    const insertLink = () => {
      const url = prompt('Enter URL');
      if (url) applyWrap('[', `](${url})`);
    };
    const insertCodeBlock = () => {
      const ta = document.getElementById(id);
      const lang = prompt('Language (optional)') || '';
      if (!ta) return onChange(`${value || ''}\n\n\
\n\n`);
      const start = ta.selectionStart ?? 0;
      const end = ta.selectionEnd ?? 0;
      const before = value.slice(0, start);
      const selected = value.slice(start, end) || 'code';
      const after = value.slice(end);
      const next = `${before}\n\n\
${lang}\n${selected}\n\
\n\n${after}`;
      onChange(next);
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
        </div>
        <textarea
          id={id}
          className="w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg min-h-[220px] font-mono text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showCreatePreview, setShowCreatePreview] = useState(false);
  const [showEditPreview, setShowEditPreview] = useState(false);

  const Modal = ({ title, onClose, onSubmit, submitText = 'Save', children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-border-accent/20 rounded-lg shadow-glow-primary w-full max-w-3xl">
        <div className="px-6 py-4 border-b border-border-accent/20 flex items-center justify-between">
          <h3 className="text-lg font-heading font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-primary">✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {children}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">{submitText}</Button>
          </div>
        </form>
      </div>
    </div>
  );

  // Create/Edit form state
  const [createForm, setCreateForm] = useState({
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
  });
  const [editForm, setEditForm] = useState({});

  // Disable demo auto-seeding when a create handler is provided (wired to backend)
  useEffect(() => {
    if ((!blogPosts || blogPosts.length === 0) && !onPostCreate) {
      // Keep UI empty if parent manages data; demo seed only when unmanaged
      // (No-op when onPostCreate exists)
    }
  }, [blogPosts, onPostCreate]);

  const filteredPosts = (blogPosts || [])
    .filter(post => {
      const matchesSearch = post?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post?.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post?.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || post?.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') return (new Date(a?.publishDate || 0) - new Date(b?.publishDate || 0)) * modifier;
      if (sortBy === 'title') return (a?.title || '').localeCompare(b?.title || '') * modifier;
      if (sortBy === 'views') return ((a?.views || 0) - (b?.views || 0)) * modifier;
      if (sortBy === 'comments') return ((a?.comments || 0) - (b?.comments || 0)) * modifier;
      return 0;
    });

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPosts(
      selectedPosts.length === filteredPosts.length 
        ? [] 
        : filteredPosts.map(p => p?.id).filter(Boolean)
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedPosts.length} selected posts?`)) {
      setIsLoading(true);
      try {
        for (const id of selectedPosts) {
          if (onPostDelete) {
            await onPostDelete(id);
          }
        }
        setSelectedPosts([]);
      } catch (error) {
        console.error('Error deleting posts:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const openCreate = () => {
    if (onOpenEditor) return onOpenEditor({ mode: 'create' });
    setCreateForm({ title: '', excerpt: '', content: '', category: '', tags: '', featuredImage: '', status: 'draft', readTime: 5 });
    setShowCreateModal(true);
  };

  const openEdit = (post) => {
    if (onOpenEditor) return onOpenEditor({ mode: 'edit', post });
    // Initialize edit form from the selected post
    setEditForm({
      title: post?.title || '',
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      category: post?.category || '',
      tags: (post?.tags || []).join(', '),
      featuredImage: post?.featuredImage || '',
      status: post?.status || 'draft',
      readTime: post?.readTime || 5,
      slug: post?.slug || '',
      featured: !!post?.featured,
      metaTitle: post?.metaTitle || '',
      metaDescription: post?.metaDescription || '',
      publishedAt: post?.publishedAt || '',
    });
    setEditingPost(post);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    const errs = validateBlog(createForm);
    setFormErrors(errs);
    if (Object.keys(errs).length) return;
    const tags = (createForm.tags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    // auto-generate slug if empty
    const slug = (createForm.slug || createForm.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // naive read-time estimation: ~200 wpm
    const words = (createForm.content || '').trim().split(/\s+/).filter(Boolean).length;
    const estRead = Math.max(1, Math.ceil(words / 200));

    await onPostCreate({
      title: createForm.title,
      excerpt: createForm.excerpt,
      content: createForm.content,
      category: createForm.category || undefined,
      tags,
      featuredImage: createForm.featuredImage || undefined,
      status: createForm.status,
      readTime: Number(createForm.readTime || estRead) || estRead,
      slug,
      featured: !!createForm.featured,
      metaTitle: createForm.metaTitle || undefined,
      metaDescription: createForm.metaDescription || undefined,
      publishDate: createForm.publishedAt || (createForm.status === 'published' ? new Date().toISOString() : null),
    });
    setShowCreateModal(false);
    setShowCreatePreview(false);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Delete this post?')) {
      setIsLoading(true);
      try {
        if (onPostDelete) {
          await onPostDelete(postId);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const PostRow = ({ post }) => (
    <tr className="border-b border-border-accent/10 hover:bg-primary/5 transition-colors duration-fast">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={selectedPosts.includes(post?.id)}
          onChange={() => handleSelectPost(post?.id)}
          className="w-4 h-4 text-primary bg-surface border-border-accent rounded focus:ring-primary focus:ring-2"
        />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-12 rounded-lg overflow-hidden bg-surface">
            <Image 
              src={post?.featuredImage || '/assets/images/no_image.png'} 
              alt={post?.title || 'Post image'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-medium text-text-primary truncate">{post?.title || 'Untitled'}</div>
              <RoleBadge role={post?.authorRole} />
            </div>
            <div className="text-sm text-text-secondary font-caption truncate">
              {post?.excerpt || 'No excerpt available'}
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-1 text-xs text-text-secondary font-caption">
                <Icon name="Eye" size={12} />
                <span>{post?.views || 0}</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-text-secondary font-caption">
                <Icon name="MessageCircle" size={12} />
                <span>{post?.comments || 0}</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-text-secondary font-caption">
                <Icon name="Heart" size={12} />
                <span>{post?.likes || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1">
          {(post?.tags || []).slice(0, 2).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-caption">
              {tag}
            </span>
          ))}
          {(post?.tags || []).length > 2 && (
            <span className="px-2 py-1 bg-surface text-text-secondary text-xs rounded-full font-caption">
              +{(post?.tags || []).length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          post?.status === 'published' ? 'bg-success/10 text-success' :
          post?.status === 'draft' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
        }`}>
          {post?.status || 'draft'}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-text-secondary font-caption">
        {post?.publishDate ? new Date(post.publishDate).toLocaleDateString() : 'No date'}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(post)}
            iconName="Edit"
            className="p-2"
            title="Edit post"
            disabled={isLoading}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeletePost(post?.id)}
            iconName="Trash2"
            className="p-2 text-error hover:text-error"
            title="Delete post"
            disabled={isLoading}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/blog/${post?.slug || post?.id}`, '_blank')}
            iconName="ExternalLink"
            className="p-2"
            title="View post"
          />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Blog Management</h1>
          <p className="text-text-secondary font-caption mt-2">
            Create, edit, and manage your blog content
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreate}
          iconName="PenTool"
          iconPosition="left"
          disabled={isLoading}
        >
          New Blog Post
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-surface rounded-lg p-6 border border-border-accent/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary font-caption">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-surface border border-border-accent/20 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary font-caption">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface border border-border-accent/20 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="views">Views</option>
                <option value="comments">Comments</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                iconName={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'}
                className="p-2"
              />
            </div>
            {selectedPosts.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                iconName="Trash2"
                iconPosition="left"
                disabled={isLoading}
              >
                Delete ({selectedPosts.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Blog Posts Table */}
      <div className="bg-surface rounded-lg border border-border-accent/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/5 border-b border-border-accent/20">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary bg-surface border-border-accent rounded focus:ring-primary focus:ring-2"
                  />
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center space-x-2 text-sm font-heading font-semibold text-text-primary hover:text-primary transition-colors duration-fast"
                  >
                    <span>Post</span>
                    <Icon name="ArrowUpDown" size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-sm font-heading font-semibold text-text-primary">
                  Tags
                </th>
                <th className="px-4 py-4 text-left text-sm font-heading font-semibold text-text-primary">
                  Status
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center space-x-2 text-sm font-heading font-semibold text-text-primary hover:text-primary transition-colors duration-fast"
                  >
                    <span>Date</span>
                    <Icon name="ArrowUpDown" size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-sm font-heading font-semibold text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <PostRow key={post?.id} post={post} />
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <Icon name="BookOpen" size={48} className="text-text-secondary/50 mx-auto mb-4" />
            <div className="text-text-secondary font-caption">
              {searchTerm || filterStatus !== 'all' ? 'No posts match your filters' : 'No blog posts found'}
            </div>
            <Button
              variant="primary"
              onClick={openCreate}
              iconName="PenTool"
              iconPosition="left"
              className="mt-4"
              disabled={isLoading}
            >
              Create Your First Post
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-surface rounded-lg p-4 border border-border-accent/20">
          <div className="text-2xl font-heading font-bold text-primary">{(blogPosts || []).length}</div>
          <div className="text-sm text-text-secondary font-caption">Total Posts</div>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-accent/20">
          <div className="text-2xl font-heading font-bold text-success">
            {(blogPosts || []).filter(p => p?.status === 'published').length}
          </div>
          <div className="text-sm text-text-secondary font-caption">Published</div>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-accent/20">
          <div className="text-2xl font-heading font-bold text-warning">
            {(blogPosts || []).filter(p => p?.status === 'draft').length}
          </div>
          <div className="text-sm text-text-secondary font-caption">Drafts</div>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-accent/20">
          <div className="text-2xl font-heading font-bold text-text-primary">
            {(blogPosts || []).reduce((sum, post) => sum + (post?.views || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-text-secondary font-caption">Total Views</div>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-accent/20">
          <div className="text-2xl font-heading font-bold text-text-primary">
            {(blogPosts || []).reduce((sum, post) => sum + (post?.comments || 0), 0)}
          </div>
          <div className="text-sm text-text-secondary font-caption">Total Comments</div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-text-primary">Processing...</span>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <Modal title="Create Blog Post" onClose={() => setShowCreateModal(false)} onSubmit={submitCreate} submitText="Create">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Title</label>
              <Input value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Slug</label>
              <Input value={createForm.slug} onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })} placeholder="auto-generated from title" />
              {formErrors.slug && <p className="mt-1 text-xs text-error">{formErrors.slug}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Status</label>
              <select className="w-full bg-surface border border-border-accent/20 rounded-lg px-3 py-2 text-sm" value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="create-featured" type="checkbox" className="w-4 h-4" checked={!!createForm.featured} onChange={(e) => setCreateForm({ ...createForm, featured: e.target.checked })} />
              <label htmlFor="create-featured" className="text-sm text-text-secondary">Featured</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Excerpt</label>
              <textarea className="w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg" rows={3} value={createForm.excerpt} onChange={(e) => setCreateForm({ ...createForm, excerpt: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm text-text-secondary mb-1">Content</label>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowCreatePreview(v => !v)}>
                  {showCreatePreview ? 'Hide Preview' : 'Preview Markdown'}
                </Button>
              </div>
              <MarkdownEditor id="md-editor-create" value={createForm.content} onChange={(val) => setCreateForm({ ...createForm, content: val })} />
              {formErrors.content && <p className="mt-1 text-xs text-error">{formErrors.content}</p>}
              {showCreatePreview && (
                <div className="mt-3 p-3 border border-border-accent/20 rounded bg-background/40 prose prose-invert max-w-none">
                  <ReactMarkdown>{createForm.content || ''}</ReactMarkdown>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Category</label>
              <Input value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} />
            </div>
            {formErrors.title && <p className="mt-1 text-xs text-error">{formErrors.title}</p>}
            <div>
              <label className="block text-sm text-text-secondary mb-1">Tags (comma-separated)</label>
              <Input value={createForm.tags} onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })} />
            </div>
            {formErrors.featuredImage && <p className="mt-1 text-xs text-error">{formErrors.featuredImage}</p>}
            <div className="md:col-span-2">
              <FileUpload
                label="Featured Image"
                value={createForm.featuredImage}
                onChange={(url) => setCreateForm({ ...createForm, featuredImage: url })}
                bucket="media"
                pathPrefix="blog/featured"
                accept="image"
                helperText="Select or drop an image to upload."
              />
            </div>
            {formErrors.readTime && <p className="mt-1 text-xs text-error">{formErrors.readTime}</p>}
            <div>
              <label className="block text-sm text-text-secondary mb-1">Read Time (minutes)</label>
              <Input type="number" min="1" value={createForm.readTime} onChange={(e) => setCreateForm({ ...createForm, readTime: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Publish Date</label>
              <Input type="datetime-local" value={createForm.publishedAt} onChange={(e) => setCreateForm({ ...createForm, publishedAt: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Meta Title</label>
              <Input value={createForm.metaTitle} onChange={(e) => setCreateForm({ ...createForm, metaTitle: e.target.value })} />
              {formErrors.metaTitle && <p className="mt-1 text-xs text-error">{formErrors.metaTitle}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Meta Description</label>
              <textarea className="w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg" rows={3} value={createForm.metaDescription} onChange={(e) => setCreateForm({ ...createForm, metaDescription: e.target.value })} />
              {formErrors.metaDescription && <p className="mt-1 text-xs text-error">{formErrors.metaDescription}</p>}
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <Modal title="Edit Blog Post" onClose={() => { setEditingPost(null); setShowEditPreview(false); }} onSubmit={async (e) => {
          e.preventDefault();
          const errs = validateBlog(editForm);
          setFormErrors(errs);
          if (Object.keys(errs).length) return;
          const tags = (editForm.tags || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
          // auto-generate slug if empty or changed
          const slug = (editForm.slug || editForm.title || '')
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/(^-|-$)/g, '');
          // recompute read time if content changed and readTime not provided
          const words = (editForm.content || '').trim().split(/\s+/).filter(Boolean).length;
          const estRead = Math.max(1, Math.ceil(words / 200));
          await onPostUpdate(editingPost.id, {
            title: editForm.title,
            excerpt: editForm.excerpt,
            content: editForm.content,
            category: editForm.category || undefined,
            tags,
            featuredImage: editForm.featuredImage || undefined,
            status: editForm.status,
            readTime: Number(editForm.readTime || estRead) || estRead,
            slug,
            featured: !!editForm.featured,
            metaTitle: editForm.metaTitle || undefined,
            metaDescription: editForm.metaDescription || undefined,
            publishDate: editForm.publishedAt || (editForm.status === 'published' ? (editingPost.publishDate || new Date().toISOString()) : null),
          });
          setEditingPost(null);
          setShowEditPreview(false);
        }} submitText="Save Changes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Title</label>
              <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
              {formErrors.title && <p className="mt-1 text-xs text-error">{formErrors.title}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Slug</label>
              <Input value={editForm.slug || ''} onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })} />
              {formErrors.slug && <p className="mt-1 text-xs text-error">{formErrors.slug}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Status</label>
              <select className="w-full bg-surface border border-border-accent/20 rounded-lg px-3 py-2 text-sm" value={editForm.status || 'draft'} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="edit-featured" type="checkbox" className="w-4 h-4" checked={!!editForm.featured} onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })} />
              <label htmlFor="edit-featured" className="text-sm text-text-secondary">Featured</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Excerpt</label>
              <textarea className="w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg" rows={3} value={editForm.excerpt || ''} onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm text-text-secondary mb-1">Content</label>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowEditPreview(v => !v)}>
                  {showEditPreview ? 'Hide Preview' : 'Preview Markdown'}
                </Button>
              </div>
              <MarkdownEditor id="md-editor-edit" value={editForm.content || ''} onChange={(val) => setEditForm({ ...editForm, content: val })} />
              {formErrors.content && <p className="mt-1 text-xs text-error">{formErrors.content}</p>}
              {showEditPreview && (
                <div className="mt-3 p-3 border border-border-accent/20 rounded bg-background/40 prose prose-invert max-w-none">
                  <ReactMarkdown>{editForm.content || ''}</ReactMarkdown>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Category</label>
              <Input value={editForm.category || ''} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Tags (comma-separated)</label>
              <Input value={editForm.tags || ''} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <FileUpload
                label="Featured Image"
                value={editForm.featuredImage || ''}
                onChange={(url) => setEditForm({ ...editForm, featuredImage: url })}
                bucket="media"
                pathPrefix="blog/featured"
                accept="image"
                helperText="Select or drop an image to upload."
              />
              {formErrors.featuredImage && <p className="mt-1 text-xs text-error">{formErrors.featuredImage}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Read Time (minutes)</label>
              <Input type="number" min="1" value={editForm.readTime || 5} onChange={(e) => setEditForm({ ...editForm, readTime: e.target.value })} />
              {formErrors.readTime && <p className="mt-1 text-xs text-error">{formErrors.readTime}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Publish Date</label>
              <Input type="datetime-local" value={editForm.publishedAt || ''} onChange={(e) => setEditForm({ ...editForm, publishedAt: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Meta Title</label>
              <Input value={editForm.metaTitle || ''} onChange={(e) => setEditForm({ ...editForm, metaTitle: e.target.value })} />
              {formErrors.metaTitle && <p className="mt-1 text-xs text-error">{formErrors.metaTitle}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Meta Description</label>
              <textarea className="w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg" rows={3} value={editForm.metaDescription || ''} onChange={(e) => setEditForm({ ...editForm, metaDescription: e.target.value })} />
              {formErrors.metaDescription && <p className="mt-1 text-xs text-error">{formErrors.metaDescription}</p>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BlogManagement;