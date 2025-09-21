import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import HeaderNavigation from '../../components/ui/HeaderNavigation';
import SearchHeader from './components/SearchHeader';
import BlogGrid from './components/BlogGrid';
import BlogModal from './components/BlogModal';
import ShareModal from './components/ShareModal';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import blogService from '../../utils/blogService';
import settingsService from '../../utils/settingsService';
import { ensureAdSenseLoaded } from '../../utils/adsense';

const BlogContentHub = () => {
  const { user, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharePost, setSharePost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [adsConfig, setAdsConfig] = useState({ enabled: false });

  const isAdmin = userProfile?.role === 'admin';

  // Load blog posts
  const loadPosts = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = isAdmin 
        ? await blogService.getAllPosts()
        : await blogService.getPublishedPosts({
            search: searchQuery,
            sortBy,
            ...options
          });

      if (result.success) {
        setPosts(result.data || []);
      } else {
        setError(result.error || 'Failed to load blog posts');
        setPosts([]);
      }
    } catch (err) {
      setError('Network error occurred while loading posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, searchQuery, sortBy]);

  // Initial load
  useEffect(() => {
    loadPosts();
    // Load ads settings
    (async () => {
      const res = await settingsService.getSettings();
      if (res.success) {
        const ads = res.data?.ads_settings || {};
        setAdsConfig({
          enabled: !!ads.enabled,
          provider: ads.provider || 'adsense',
          publisher_id: ads.publisher_id || '',
          auto_ads: ads.auto_ads !== false,
          grid_interval: Number(ads.grid_interval) || 6,
          ad_slot: ads.ad_slot || '',
          // yllix/custom
          yllix_publisher_id: ads.yllix_publisher_id || '',
          yllix_script_url: ads.yllix_script_url || '',
          yllix_unit_code: ads.yllix_unit_code || '',
          custom_script_url: ads.custom_script_url || '',
          custom_ad_html: ads.custom_ad_html || ''
        });
        if (ads.enabled && (ads.provider || 'adsense') === 'adsense' && ads.publisher_id) {
          await ensureAdSenseLoaded(ads.publisher_id);
        }
      }
    })();
  }, [loadPosts]);

  // Reload when search or sort changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        loadPosts();
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, sortBy, loadPosts]);

  // Filter and sort posts locally for better UX
  const filteredAndSortedPosts = useCallback(() => {
    let filtered = [...posts];

    // Apply search filter locally for immediate response
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post?.title?.toLowerCase().includes(query) ||
        post?.excerpt?.toLowerCase().includes(query) ||
        post?.content?.toLowerCase().includes(query) ||
        post?.tags?.some(tag => tag?.toLowerCase().includes(query)) ||
        post?.category?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.published_at || a.created_at) - new Date(b.published_at || b.created_at));
        break;
      case 'most-liked':
        filtered.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
        break;
      case 'most-commented':
        filtered.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0));
        break;
      case 'relevance':
        filtered.sort((a, b) => {
          const scoreA = (a.like_count || 0) * 2 + (a.comment_count || 0) * 3 + (a.view_count || 0) * 0.1;
          const scoreB = (b.like_count || 0) * 2 + (b.comment_count || 0) * 3 + (b.view_count || 0) * 0.1;
          return scoreB - scoreA;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [posts, searchQuery, sortBy]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleSort = useCallback((sortOption) => {
    setSortBy(sortOption);
  }, []);

  const handleLike = useCallback(async (postId) => {
    try {
      // Get visitor IP for like tracking
      const visitorIp = await getVisitorIp();
      const userAgent = navigator.userAgent || '';

      const result = await blogService.toggleLike(postId, visitorIp, userAgent);
      
      if (result.success) {
        // Update local state optimistically
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  like_count: result.liked 
                    ? (post.like_count || 0) + 1 
                    : Math.max((post.like_count || 0) - 1, 0)
                }
              : post
          )
        );
      }
    } catch (error) {
      console.log('Failed to toggle like:', error);
    }
  }, []);

  const handleShare = useCallback((post) => {
    setSharePost(post);
    setIsShareModalOpen(true);
  }, []);

  const handleEdit = useCallback((post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const result = await blogService.deletePost(postId);
        
        if (result.success) {
          setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        } else {
          setError(result.error || 'Failed to delete post');
        }
      } catch (error) {
        setError('Network error occurred while deleting post');
      }
    }
  }, []);

  const handleSave = useCallback(async (updatedPost) => {
    try {
      let result;
      
      if (updatedPost.id && posts.find(p => p.id === updatedPost.id)) {
        // Update existing post
        result = await blogService.updatePost(updatedPost.id, updatedPost);
      } else {
        // Create new post
        result = await blogService.createPost(updatedPost);
      }

      if (result.success) {
        await loadPosts(); // Refresh posts
      } else {
        setError(result.error || 'Failed to save post');
      }
    } catch (error) {
      setError('Network error occurred while saving post');
    }
  }, [posts, loadPosts]);

  const handlePostClick = useCallback(async (post) => {
    try {
      // For detailed view, get the full post with comments
      const result = await blogService.getPostBySlug(post.slug);
      
      if (result.success) {
        setSelectedPost({
          ...post,
          comments: result.data.comments || []
        });
      } else {
        setSelectedPost(post);
      }
      
      setIsModalOpen(true);
    } catch (error) {
      // Fallback to original post data
      setSelectedPost(post);
      setIsModalOpen(true);
    }
  }, []);

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

  const displayedPosts = filteredAndSortedPosts();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mikael Kraft — Blog</title>
        <meta name="description" content="Read articles by Mikael Kraft on software engineering, web development, and technology insights." />
        <meta property="og:title" content="Mikael Kraft — Blog" />
        <meta property="og:description" content="Latest posts on full‑stack engineering, security, and practical tech write‑ups." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mikaelkraft.dev/blog" />
        <meta property="og:image" content="/assets/images/no_image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@mikael_kraft" />
        <meta name="twitter:creator" content="@mikael_kraft" />
        <link rel="canonical" href="https://mikaelkraft.dev/blog" />
      </Helmet>
      {/* Header Navigation */}
      <HeaderNavigation />

      {/* Search Header */}
      <SearchHeader
        onSearch={handleSearch}
        onSort={handleSort}
        searchQuery={searchQuery}
        sortBy={sortBy}
        totalPosts={posts.length}
        onRefresh={() => loadPosts()}
        loading={loading}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={20} className="text-error" />
              <p className="text-error font-medium">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                iconName="X"
                className="ml-auto text-error hover:text-error/80"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPosts()}
              className="mt-2"
              iconName="RefreshCw"
              iconPosition="left"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Add New Post Button (Admin Only) */}
        {isAdmin && (
          <div className="mb-8 flex justify-end">
            <Button
              variant="primary"
              iconName="Plus"
              iconPosition="left"
              onClick={() => {
                const newPost = {
                  id: null, // Will be set by database
                  title: '',
                  excerpt: '',
                  content: '',
                  category: '',
                  tags: [],
                  featured_image: '',
                  status: 'draft',
                  author_id: user?.id,
                  author: userProfile?.full_name || 'Admin',
                  published_at: null,
                  created_at: new Date().toISOString()
                };
                setSelectedPost(newPost);
                setIsModalOpen(true);
              }}
              className="shadow-glow-primary"
            >
              Create New Post
            </Button>
          </div>
        )}

        {/* Blog Grid */}
        <BlogGrid
          posts={displayedPosts}
          onLike={handleLike}
          onShare={handleShare}
          onPostClick={handlePostClick}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          adsConfig={adsConfig}
        />

        {/* Load More Button (if needed for pagination) */}
        {displayedPosts.length > 0 && displayedPosts.length % 6 === 0 && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              iconName="ChevronDown"
              iconPosition="right"
              onClick={() => {
                loadPosts({ 
                  offset: posts.length,
                  limit: 6 
                });
              }}
              className="hover:border-primary/60 hover:text-primary"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Posts'}
            </Button>
          </div>
        )}

        {/* Empty State for No Results */}
        {displayedPosts.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Icon name="Search" size={48} className="mx-auto mb-4 text-text-secondary" />
              <h3 className="font-heading font-semibold text-xl text-text-primary mb-2">
                {searchQuery ? 'No posts found' : 'No blog posts yet'}
              </h3>
              <p className="text-text-secondary mb-6">
                {searchQuery 
                  ? `No blog posts match your search for "${searchQuery}". Try different keywords or browse all posts.`
                  : 'No blog posts have been published yet. Check back later for updates.'
                }
              </p>
              {searchQuery ? (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  iconName="RotateCcw"
                  iconPosition="left"
                >
                  Clear Search
                </Button>
              ) : isAdmin && (
                <Button
                  variant="primary"
                  onClick={() => {
                    const newPost = {
                      id: null,
                      title: '',
                      excerpt: '',
                      content: '',
                      category: '',
                      tags: [],
                      featured_image: '',
                      status: 'draft',
                      author_id: user?.id,
                      author: userProfile?.full_name || 'Admin'
                    };
                    setSelectedPost(newPost);
                    setIsModalOpen(true);
                  }}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Create First Post
                </Button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Blog Modal */}
      <BlogModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
        onSave={handleSave}
        isAdmin={isAdmin}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSharePost(null);
        }}
        post={sharePost}
      />

      {/* Scroll to Top Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          variant="primary"
          size="sm"
          iconName="ArrowUp"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="rounded-full w-12 h-12 shadow-glow-primary hover:shadow-glow-secondary transition-all duration-fast"
          title="Scroll to top"
        />
      </div>

      {/* Footer */}
      <footer className="bg-surface border-t border-border-accent/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Icon name="Zap" size={20} className="text-primary" />
              <span className="font-heading font-bold text-lg text-primary">
                WisdomInTech
              </span>
            </div>
            <p className="text-text-secondary text-sm font-caption">
              © {new Date().getFullYear()} Built with love ❤️ by Mikael Kraft
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogContentHub;