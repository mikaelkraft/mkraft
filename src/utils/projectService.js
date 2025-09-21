import supabase from './supabase';
import { api } from './api/client';

const USE_API = import.meta.env.VITE_USE_API === 'true';

class ProjectService {
  // Get all published projects (public access)
  async getPublishedProjects() {
    try {
      if (USE_API) {
        const data = await api.get('/projects', { published: true });
        return { success: true, data: data || [] };
      } else {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            author:user_profiles(full_name, email)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data: data || [] };
      }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load projects' };
    }
  }

  // Get all projects (admin access)
  async getAllProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
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
      return { success: false, error: 'Failed to load projects' };
    }
  }

  // Get featured projects
  async getFeaturedProjects() {
    try {
      if (USE_API) {
        const data = await api.get('/projects', { published: true, featured: true });
        return { success: true, data: data || [] };
      } else {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            author:user_profiles(full_name, email)
          `)
          .eq('status', 'published')
          .eq('featured', true)
          .order('created_at', { ascending: false });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data: data || [] };
      }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load featured projects' };
    }
  }

  // Get single project by ID
  async getProject(projectId) {
    try {
      if (USE_API) {
        const data = await api.get('/projects/by-id', { id: projectId });
        return { success: true, data };
      } else {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            author:user_profiles(full_name, email)
          `)
          .eq('id', projectId)
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        // Increment view count
        await this.incrementViewCount(projectId);

        return { success: true, data };
      }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load project' };
    }
  }

  // Create new project (admin only)
  async createProject(projectData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          author_id: user.id
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
      return { success: false, error: 'Failed to create project' };
    }
  }

  // Update project (admin only)
  async updateProject(projectId, updates) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
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
      return { success: false, error: 'Failed to update project' };
    }
  }

  // Delete project (admin only)
  async deleteProject(projectId) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

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
      return { success: false, error: 'Failed to delete project' };
    }
  }

  // Increment view count
  async incrementViewCount(projectId) {
    try {
      await supabase.rpc('increment_view_count', {
        content_type: 'project',
        content_id: projectId
      });
    } catch (error) {
      // Silently fail view count increment
      console.log('Failed to increment view count:', error);
    }
  }

  // Toggle like for project
  async toggleLike(projectId, visitorIp, userAgent = '') {
    try {
      const { data, error } = await supabase.rpc('toggle_like', {
        content_type: 'project',
        content_id: projectId,
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

  // Check if user has liked project
  async checkIfLiked(projectId, visitorIp) {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('project_id', projectId)
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

  // Get project statistics
  async getProjectStats() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('status, view_count, like_count')
        .eq('status', 'published');

      if (error) {
        return { success: false, error: error.message };
      }

      const stats = data?.reduce((acc, project) => {
        acc.total += 1;
        acc.totalViews += project.view_count || 0;
        acc.totalLikes += project.like_count || 0;
        return acc;
      }, { total: 0, totalViews: 0, totalLikes: 0 }) || { total: 0, totalViews: 0, totalLikes: 0 };

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
      return { success: false, error: 'Failed to get project statistics' };
    }
  }
}

const projectService = new ProjectService();
export default projectService;