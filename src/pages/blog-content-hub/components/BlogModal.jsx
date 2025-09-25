import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';
import commentService from '../../../utils/commentService';
import newsletterService from '../../../utils/newsletterService';

// Environment configuration (Vite)
const SITE_URL = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SITE_URL) || 'https://mkraft.tech';
const TWITTER_HANDLE = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_TWITTER_HANDLE) || '@mikael_kraft';

const BlogModal = ({ isOpen, onClose, post, onSave, isAdmin }) => {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featured_image: '',
    status: 'draft',
    meta_title: '',
    meta_description: ''
  });

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });
  const [replyTo, setReplyTo] = useState(null);
  const [replyData, setReplyData] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newsletterSignup, setNewsletterSignup] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
        featured_image: post.featured_image || post.featuredImage || '',
        status: post.status || 'draft',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || ''
      });

      // Load comments if viewing a published post
      if (post.id && post.status === 'published') {
        loadComments();
      } else {
        setComments(post.comments || []);
      }
    }
  }, [post]);

  const loadComments = async () => {
    if (!post?.id) return;

    try {
      setCommentLoading(true);
      const result = await commentService.getComments(post.id);
      
      if (result.success) {
        setComments(result.data || []);
      }
    } catch (error) {
      console.log('Failed to load comments:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const updatedPost = {
        ...post,
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        author_id: user?.id,
        author: userProfile?.full_name || 'Admin'
      };

      await onSave(updatedPost);
    } catch (error) {
      console.log('Failed to save post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.content.trim() || !newComment.author_name.trim()) {
      return;
    }

    try {
      setCommentLoading(true);

      const commentData = {
        blog_post_id: post.id,
        author_name: newComment.author_name,
        author_email: newComment.author_email,
        content: newComment.content,
        parent_comment_id: null
      };

      const result = await commentService.createComment(commentData);
      
      if (result.success) {
        // Add comment to local state
        setComments(prev => [result.data, ...prev]);
        
        // Reset form
        setNewComment({
          author_name: '',
          author_email: '',
          content: ''
        });

        // Handle newsletter signup
        if (newsletterSignup && newComment.author_email) {
          try {
            const result = await newsletterService.subscribe(newComment.author_email, newComment.author_name);
            if (result.success) {
              console.log('Successfully subscribed to newsletter:', newComment.author_email);
            } else {
              console.log('Newsletter signup error:', result.error);
            }
          } catch (error) {
            console.log('Newsletter signup failed:', error);
          }
        }
        setNewsletterSignup(false);
      }
    } catch (error) {
      console.log('Failed to add comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleReplySubmit = async (parentCommentId) => {
    if (!replyData.content.trim() || !replyData.author_name.trim()) {
      return;
    }

    try {
      setCommentLoading(true);

      const commentData = {
        blog_post_id: post.id,
        parent_comment_id: parentCommentId,
        author_name: replyData.author_name,
        author_email: replyData.author_email,
        content: replyData.content
      };

      const result = await commentService.createComment(commentData);
      
      if (result.success) {
        // Reload comments to get updated structure
        await loadComments();
        
        // Reset reply form
        setReplyData({
          author_name: '',
          author_email: '',
          content: ''
        });
        setReplyTo(null);
      }
    } catch (error) {
      console.log('Failed to add reply:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      // Get visitor IP for like tracking
      const visitorIp = await getVisitorIp();
      const userAgent = navigator.userAgent || '';

      const result = await commentService.toggleLike(commentId, visitorIp, userAgent);
      
      if (result.success) {
        // Update local comment state
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  like_count: result.liked 
                    ? (comment.like_count || 0) + 1 
                    : Math.max((comment.like_count || 0) - 1, 0)
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.log('Failed to toggle comment like:', error);
    }
  };

  // Get visitor IP helper function
  const getVisitorIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      return `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {!isAdmin && (
          <Helmet>
            <title>{formData.meta_title || post.title}</title>
            <meta name="description" content={formData.meta_description || post.excerpt || ''} />
            <meta property="og:title" content={formData.meta_title || post.title} />
            <meta property="og:description" content={formData.meta_description || post.excerpt || ''} />
            <meta property="og:url" content={`${SITE_URL}/blog/${post.slug}`} />
            <link rel="canonical" href={`${SITE_URL}/blog/${post.slug}`} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={TWITTER_HANDLE} />
            <meta name="twitter:creator" content={TWITTER_HANDLE} />
          </Helmet>
        )}
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-surface rounded-lg border border-border-accent/20 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-accent/20">
            <h2 className="font-heading font-bold text-xl text-text-primary">
              {isAdmin ? (post.id ? 'Edit Blog Post' : 'Create Blog Post') : post.title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={onClose}
              className="text-text-secondary hover:text-primary"
            />
          </div>

          {/* Content */}
          <div className="max-h-[80vh] overflow-y-auto">
            {isAdmin ? (
              /* Admin Edit Form */
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Title *
                    </label>
                    <Input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter post title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Category
                    </label>
                    <Input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="Enter category"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Featured Image URL
                  </label>
                  <Input
                    type="url"
                    name="featured_image"
                    value={formData.featured_image}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border-accent/40 rounded-lg text-text-primary placeholder-text-secondary focus:border-primary/60 focus:outline-none resize-none"
                    placeholder="Enter post excerpt"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={12}
                    className="w-full px-3 py-2 bg-background border border-border-accent/40 rounded-lg text-text-primary placeholder-text-secondary focus:border-primary/60 focus:outline-none resize-none"
                    placeholder="Enter post content (supports markdown)"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Tags (comma-separated)
                    </label>
                    <Input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="react, javascript, tutorial"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-border-accent/40 rounded-lg text-text-primary focus:border-primary/60 focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-border-accent/20">
                  <Button variant="ghost" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleSave}
                    disabled={loading || !formData.title.trim() || !formData.content.trim()}
                    iconName={loading ? "Loader2" : "Save"}
                    iconPosition="left"
                    className={loading ? "animate-spin" : ""}
                  >
                    {loading ? 'Saving...' : (post.id ? 'Update Post' : 'Create Post')}
                  </Button>
                </div>
              </div>
            ) : (
              /* Blog Post View */
              <div className="p-6">
                {/* Featured Image */}
                {formData.featured_image && (
                  <div className="mb-6">
                    <Image
                      src={formData.featured_image}
                      alt={formData.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Post Meta */}
                <div className="flex items-center justify-between mb-6 text-sm text-text-secondary font-caption">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={16} />
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="User" size={16} />
                      <span>{post.author?.full_name || post.author || 'Unknown Author'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={16} />
                      <span>{post.read_time || 5} min read</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Icon name="Heart" size={16} />
                      <span>{post.like_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="MessageCircle" size={16} />
                      <span>{comments.length}</span>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="prose prose-invert max-w-none mb-8">
                  <div className="text-text-primary leading-relaxed whitespace-pre-wrap">
                    {formData.content}
                  </div>
                </div>

                {/* Tags */}
                {formData.tags && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {formData.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Source Attribution */}
                {post.source_url && (
                  <div className="mb-8 p-4 bg-background/30 border border-border-accent/20 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-text-secondary">
                      <Icon name="ExternalLink" size={16} />
                      <span>Source:</span>
                      <a 
                        href={post.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-secondary underline"
                      >
                        {new URL(post.source_url).hostname}
                      </a>
                    </div>
                  </div>
                )}

                {/* Comments Section - Only for published posts */}
                {post.status === 'published' && (
                  <div className="border-t border-border-accent/20 pt-8">
                    <h3 className="font-heading font-semibold text-lg text-text-primary mb-6">
                      Comments ({comments.length})
                    </h3>

                    {/* Add Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mb-8 p-4 bg-background/50 rounded-lg">
                      <h4 className="font-medium text-text-primary mb-4">Leave a Comment</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input
                          type="text"
                          placeholder="Your name *"
                          value={newComment.author_name}
                          onChange={(e) => setNewComment(prev => ({ ...prev, author_name: e.target.value }))}
                          required
                        />
                        <Input
                          type="email"
                          placeholder="Your email"
                          value={newComment.author_email}
                          onChange={(e) => setNewComment(prev => ({ ...prev, author_email: e.target.value }))}
                        />
                      </div>

                      <textarea
                        value={newComment.content}
                        onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Share your thoughts..."
                        rows={4}
                        className="w-full px-3 py-2 bg-background border border-border-accent/40 rounded-lg text-text-primary placeholder-text-secondary focus:border-primary/60 focus:outline-none resize-none mb-4"
                        required
                      />

                      {/* Newsletter Signup Checkbox */}
                      <div className="flex items-center space-x-2 mb-4">
                        <input
                          type="checkbox"
                          id="newsletter"
                          checked={newsletterSignup}
                          onChange={(e) => setNewsletterSignup(e.target.checked)}
                          className="rounded border-border-accent/40 text-primary focus:ring-primary"
                        />
                        <label htmlFor="newsletter" className="text-sm text-text-secondary">
                          Subscribe to our newsletter for updates
                        </label>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={commentLoading || !newComment.content.trim() || !newComment.author_name.trim()}
                          iconName={commentLoading ? "Loader2" : "Send"}
                          iconPosition="left"
                          className={commentLoading ? "animate-spin" : ""}
                        >
                          {commentLoading ? 'Posting...' : 'Post Comment'}
                        </Button>
                      </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-6">
                      {commentLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Icon name="Loader2" size={24} className="animate-spin text-primary" />
                          <span className="ml-2 text-text-secondary">Loading comments...</span>
                        </div>
                      ) : comments.length > 0 ? (
                        comments.map((comment) => (
                          <div key={comment.id} className="bg-background/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                  <Icon name="User" size={16} className="text-primary" />
                                </div>
                                <span className="font-medium text-text-primary text-sm">
                                  {comment.author_name}
                                </span>
                              </div>
                              <span className="text-xs text-text-secondary font-caption">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            
                            <p className="text-text-primary text-sm mb-3 leading-relaxed">
                              {comment.content}
                            </p>

                            <div className="flex items-center space-x-4">
                              <Button
                                variant="ghost"
                                size="xs"
                                iconName="Heart"
                                onClick={() => handleCommentLike(comment.id)}
                                className="text-text-secondary hover:text-error"
                              >
                                {comment.like_count || 0}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="xs"
                                iconName="Reply"
                                onClick={() => setReplyTo(comment.id)}
                                className="text-text-secondary hover:text-primary"
                              >
                                Reply
                              </Button>
                            </div>

                            {/* Reply Form */}
                            {replyTo === comment.id && (
                              <div className="mt-4 ml-6 p-3 bg-surface/50 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  <Input
                                    type="text"
                                    placeholder="Your name *"
                                    value={replyData.author_name}
                                    onChange={(e) => setReplyData(prev => ({ ...prev, author_name: e.target.value }))}
                                    size="sm"
                                  />
                                  <Input
                                    type="email"
                                    placeholder="Your email"
                                    value={replyData.author_email}
                                    onChange={(e) => setReplyData(prev => ({ ...prev, author_email: e.target.value }))}
                                    size="sm"
                                  />
                                </div>
                                
                                <textarea
                                  value={replyData.content}
                                  onChange={(e) => setReplyData(prev => ({ ...prev, content: e.target.value }))}
                                  placeholder="Write a reply..."
                                  rows={3}
                                  className="w-full px-3 py-2 bg-background border border-border-accent/40 rounded-lg text-text-primary placeholder-text-secondary focus:border-primary/60 focus:outline-none resize-none text-sm mb-3"
                                />
                                
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => {
                                      setReplyTo(null);
                                      setReplyData({ author_name: '', author_email: '', content: '' });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="xs"
                                    onClick={() => handleReplySubmit(comment.id)}
                                    disabled={commentLoading || !replyData.content.trim() || !replyData.author_name.trim()}
                                  >
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Replies */}
                            {comment.replies?.map((reply) => (
                              <div key={reply.id} className="ml-6 mt-4 bg-surface/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center">
                                      <Icon name="User" size={12} className="text-secondary" />
                                    </div>
                                    <span className="font-medium text-text-primary text-xs">
                                      {reply.author_name}
                                    </span>
                                  </div>
                                  <span className="text-xs text-text-secondary font-caption">
                                    {formatDate(reply.created_at)}
                                  </span>
                                </div>
                                <p className="text-text-primary text-xs leading-relaxed">
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Icon name="MessageCircle" size={32} className="mx-auto mb-2 text-text-secondary" />
                          <p className="text-text-secondary text-sm">
                            No comments yet. Be the first to share your thoughts!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogModal;