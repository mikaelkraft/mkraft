import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';

const BlogManagement = ({ blogPosts, onPostUpdate, onPostDelete, onPostCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with default posts if none provided
  useEffect(() => {
    if (!blogPosts || blogPosts.length === 0) {
      // Create sample posts for demo
      const defaultPosts = [
        {
          id: 1,
          title: 'Getting Started with React and Cyberpunk Themes',
          excerpt: 'Learn how to create stunning cyberpunk-themed web applications using React and modern CSS techniques.',
          content: 'This comprehensive guide will walk you through creating immersive cyberpunk experiences...',
          category: 'Tutorial',
          tags: ['React', 'CSS', 'Cyberpunk', 'Tutorial'],
          featuredImage: '/assets/images/no_image.png',
          status: 'published',
          publishDate: '2024-01-15T10:00:00Z',
          author: 'Mikael Kraft',
          views: 1250,
          comments: 8,
          likes: 42,
          readTime: 5
        },
        {
          id: 2,
          title: 'Advanced JavaScript Patterns for Modern Development',
          excerpt: 'Explore advanced JavaScript patterns that will elevate your development skills.',
          content: 'Modern JavaScript offers powerful patterns for building scalable applications...',
          category: 'Development',
          tags: ['JavaScript', 'Patterns', 'Advanced'],
          featuredImage: '/assets/images/no_image.png',
          status: 'draft',
          publishDate: '2024-01-20T14:30:00Z',
          author: 'Mikael Kraft',
          views: 890,
          comments: 12,
          likes: 67,
          readTime: 8
        }
      ];
      
      if (onPostCreate) {
        defaultPosts.forEach(post => onPostCreate(post));
      }
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

  const handleCreatePost = () => {
    const newPost = {
      id: Date.now(),
      title: 'New Blog Post',
      excerpt: 'Add your excerpt here...',
      content: 'Write your content here...',
      category: 'General',
      tags: ['New'],
      featuredImage: '/assets/images/no_image.png',
      status: 'draft',
      publishDate: new Date().toISOString(),
      author: 'Mikael Kraft',
      views: 0,
      comments: 0,
      likes: 0,
      readTime: 1
    };
    
    if (onPostCreate) {
      onPostCreate(newPost);
    }
    setShowCreateModal(false);
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
            <div className="font-medium text-text-primary truncate">{post?.title || 'Untitled'}</div>
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
            onClick={() => setEditingPost(post)}
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
          onClick={handleCreatePost}
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
              onClick={handleCreatePost}
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
    </div>
  );
};

export default BlogManagement;