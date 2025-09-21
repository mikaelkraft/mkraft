import supabase from './supabase';

class BlogService {
  // Get all published blog posts (public access)
  async getPublishedPosts(options = {}) {
    try {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          author:user_profiles(full_name, email)
        `)
        .eq('status', 'published');

      // Apply search filter
      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,excerpt.ilike.%${options.search}%,content.ilike.%${options.search}%`);
      }

      // Apply category filter
      if (options.category) {
        query = query.eq('category', options.category);
      }

      // Apply tag filter
      if (options.tag) {
        query = query.contains('tags', [options.tag]);
      }

      // Apply sorting
      switch (options.sortBy) {
        case 'oldest':
          query = query.order('published_at', { ascending: true });
          break;
        case 'most-liked':
          query = query.order('like_count', { ascending: false });
          break;
        case 'most-commented':
          query = query.order('comment_count', { ascending: false });
          break;
        case 'relevance':
          query = query.order('view_count', { ascending: false });
          break;
        default: // newest
          query = query.order('published_at', { ascending: false });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load blog posts' };
    }
  }

  // Get all blog posts (admin access)
  async getAllPosts() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:user_profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load blog posts' };
    }
  }

  // Get featured blog posts
  async getFeaturedPosts() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:user_profiles(full_name, email)
        `)
        .eq('status', 'published')
        .eq('featured', true)
        .order('published_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load featured posts' };
    }
  }

  // Get single blog post by slug with comments
  async getPostBySlug(slug) {
    try {
      const { data, error } = await supabase.rpc('get_blog_post_with_comments', {
        post_slug: slug
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'Blog post not found' };
      }

      const post = data[0];

      // Increment view count
      await this.incrementViewCount(post.post_id);

      return { success: true, data: post };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load blog post' };
    }
  }

  // Get single blog post by ID
  async getPost(postId) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:user_profiles(full_name, email)
        `)
        .eq('id', postId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load blog post' };
    }
  }

  // Create new blog post (admin only)
  async createPost(postData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      // Generate slug from title
      const slug = (postData.slug && postData.slug.trim()) ? postData.slug.trim().toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/(^-|-$)/g, '')
        : postData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...postData,
          slug,
          author_id: user.id,
          published_at: postData.published_at ?? (postData.status === 'published' ? new Date().toISOString() : null)
        })
        .select(`
          *,
          author:user_profiles(full_name, email)
        `)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to create blog post' };
    }
  }

  // Update blog post (admin only)
  async updatePost(postId, updates) {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Update slug if title changed
      if (typeof updates.slug === 'string') {
        updateData.slug = updates.slug.trim().toLowerCase()
          .replace(/[^a-z0-9-]+/g, '-')
          .replace(/(^-|-$)/g, '');
      } else if (updates.title) {
        updateData.slug = updates.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Set published_at if status changed to published
      if (typeof updates.published_at !== 'undefined') {
        updateData.published_at = updates.published_at;
      } else if (updates.status === 'published' && !updates.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId)
        .select(`
          *,
          author:user_profiles(full_name, email)
        `)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to update blog post' };
    }
  }

  // Delete blog post (admin only)
  async deletePost(postId) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to delete blog post' };
    }
  }

  // Increment view count
  async incrementViewCount(postId) {
    try {
      await supabase.rpc('increment_view_count', {
        content_type: 'blog_post',
        content_id: postId
      });
    } catch (error) {
      // Silently fail view count increment
      console.log('Failed to increment view count:', error);
    }
  }

  // Toggle like for blog post
  async toggleLike(postId, visitorIp, userAgent = '') {
    try {
      const { data, error } = await supabase.rpc('toggle_like', {
        content_type: 'blog_post',
        content_id: postId,
        visitor_ip_addr: visitorIp,
        user_agent_str: userAgent
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, liked: data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to toggle like' };
    }
  }

  // Check if user has liked post
  async checkIfLiked(postId, visitorIp) {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('blog_post_id', postId)
        .eq('visitor_ip', visitorIp)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return { success: false, error: error.message };
      }

      return { success: true, liked: !!data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to check like status' };
    }
  }

  // Get blog statistics
  async getBlogStats() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('status, view_count, like_count, comment_count')
        .eq('status', 'published');

      if (error) {
        return { success: false, error: error.message };
      }

      const stats = data?.reduce((acc, post) => {
        acc.total += 1;
        acc.totalViews += post.view_count || 0;
        acc.totalLikes += post.like_count || 0;
        acc.totalComments += post.comment_count || 0;
        return acc;
      }, { total: 0, totalViews: 0, totalLikes: 0, totalComments: 0 }) || { total: 0, totalViews: 0, totalLikes: 0, totalComments: 0 };

      return { success: true, data: stats };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to get blog statistics' };
    }
  }

  // Get all categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('category')
        .eq('status', 'published')
        .not('category', 'is', null);

      if (error) {
        return { success: false, error: error.message };
      }

      const categories = [...new Set(data?.map(post => post.category).filter(Boolean))] || [];

      return { success: true, data: categories };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to get categories' };
    }
  }

  // Get all tags
  async getTags() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('tags')
        .eq('status', 'published')
        .not('tags', 'is', null);

      if (error) {
        return { success: false, error: error.message };
      }

      const allTags = data?.flatMap(post => post.tags || []) || [];
      const uniqueTags = [...new Set(allTags)];

      return { success: true, data: uniqueTags };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to get tags' };
    }
  }
}

const blogService = new BlogService();
export default blogService;