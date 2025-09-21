import supabase from './supabase';
import { api } from './api/client';
const USE_API = import.meta.env.VITE_USE_API === 'true';

class SettingsService {
  // Get site settings (public access)
  async getSettings() {
    try {
      if (USE_API) {
        const data = await api.get('/settings');
        return { success: true, data: data || {} };
      }
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || {} };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load settings' };
    }
  }

  // Update site settings (admin only)
  async updateSettings(settingsData) {
    try {
      if (USE_API) {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) return { success: false, error: 'Authentication required' };
        const res = await fetch((import.meta.env.VITE_API_BASE_URL || '/api') + '/settings', {
          method: 'PUT',
          headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(settingsData)
        });
        if (!res.ok) return { success: false, error: await res.text() };
        const data = await res.json();
        return { success: true, data };
      }
      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from('site_settings')
        .select('id')
        .single();

      let result;

      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('site_settings')
          .update({
            ...settingsData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id)
          .select()
          .single();
      } else {
        // Create new settings
        result = await supabase
          .from('site_settings')
          .insert({
            ...settingsData,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
      }

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: true, data: result.data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to update settings' };
    }
  }

  // Update specific setting field (admin only)
  async updateSetting(field, value) {
    try {
      if (USE_API) {
        return await this.updateSettings({ [field]: value });
      }
      const { data: existingSettings } = await supabase
        .from('site_settings')
        .select('id')
        .single();

      let result;

      if (existingSettings) {
        result = await supabase
          .from('site_settings')
          .update({
            [field]: value,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('site_settings')
          .insert({
            [field]: value,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
      }

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: true, data: result.data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to update setting' };
    }
  }

  // Toggle maintenance mode (admin only)
  async toggleMaintenanceMode() {
    try {
      const { data: currentSettings } = await supabase
        .from('site_settings')
        .select('maintenance_mode')
        .single();

      const newMaintenanceMode = !(currentSettings?.maintenance_mode || false);

      const result = await this.updateSetting('maintenance_mode', newMaintenanceMode);

      return { 
        success: result.success, 
        data: { maintenance_mode: newMaintenanceMode },
        error: result.error 
      };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to toggle maintenance mode' };
    }
  }

  // Update social media settings (admin only)
  async updateSocialMedia(socialMediaData) {
    try {
      return await this.updateSetting('social_media', socialMediaData);
    } catch (error) {
      return { success: false, error: 'Failed to update social media settings' };
    }
  }

  // Update SEO settings (admin only)
  async updateSEOSettings(seoData) {
    try {
      return await this.updateSetting('seo_settings', seoData);
    } catch (error) {
      return { success: false, error: 'Failed to update SEO settings' };
    }
  }

  // Get specific setting value
  async getSetting(field) {
    try {
      if (USE_API) {
        const res = await this.getSettings();
        if (!res.success) return res;
        return { success: true, data: res.data?.[field] };
      }
      const { data, error } = await supabase
        .from('site_settings')
        .select(field)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data?.[field] };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to get setting' };
    }
  }

  // Reset settings to default (admin only)
  async resetToDefaults() {
    try {
      const defaultSettings = {
  site_title: 'WisdomInTech',
        site_tagline: 'Neo-Cyberpunk Experience',
        site_description: 'A futuristic portfolio showcasing cutting-edge development work and innovative solutions for the digital future.',
  contact_email: 'contact@wisdomintech.dev',
  admin_email: 'admin@wisdomintech.dev',
        enable_video: true,
        default_theme: 'cyberpunk',
        default_font_size: 'medium',
        logo_url: '',
        favicon_url: '',
        social_media: {
          twitter: 'mikael_kraft',
          linkedin: 'in/mikael-kraft',
          github: 'mikaelkraft',
          email: 'contact@wisdomintech.dev'
        },
        seo_settings: {
          keywords: 'portfolio, developer, cyberpunk, react, javascript, web development',
          ogImage: 'https://wisdomintech.dev/og-image.jpg',
          googleAnalytics: '',
          searchConsole: ''
        },
        maintenance_mode: false,
        custom_css: '',
        custom_js: ''
      };

      return await this.updateSettings(defaultSettings);
    } catch (error) {
      return { success: false, error: 'Failed to reset settings to defaults' };
    }
  }

  // Export settings (admin only)
  async exportSettings() {
    try {
      const result = await this.getSettings();
      
      if (!result.success) {
        return result;
      }

      // Remove sensitive fields
      const exportData = { ...result.data };
      delete exportData.id;
      delete exportData.created_at;
      delete exportData.updated_at;

      return { 
        success: true, 
        data: exportData,
  filename: `wisdomintech-settings-${new Date().toISOString().split('T')[0]}.json`
      };
    } catch (error) {
      return { success: false, error: 'Failed to export settings' };
    }
  }

  // Import settings (admin only)
  async importSettings(settingsData) {
    try {
      // Validate required fields
      const requiredFields = ['site_title', 'site_tagline'];
      const missingFields = requiredFields.filter(field => !settingsData[field]);
      
      if (missingFields.length > 0) {
        return { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        };
      }

      // Remove any fields that should not be imported
      const cleanedData = { ...settingsData };
      delete cleanedData.id;
      delete cleanedData.created_at;
      delete cleanedData.updated_at;

      return await this.updateSettings(cleanedData);
    } catch (error) {
      return { success: false, error: 'Failed to import settings' };
    }
  }

  // Get analytics data for dashboard
  async getAnalyticsData() {
    try {
      // This is a placeholder for future analytics integration
      // You would integrate with Google Analytics API or similar
      const mockAnalytics = {
        totalVisitors: 12500,
        pageViews: 45000,
        bounceRate: 23.5,
        avgSessionDuration: '4:32',
        topPages: [
          { path: '/', views: 15000, title: 'Home' },
          { path: '/blog-content-hub', views: 12000, title: 'Blog' },
          { path: '/projects-portfolio-grid', views: 8500, title: 'Projects' }
        ],
        visitorsByCountry: [
          { country: 'United States', visitors: 4500 },
          { country: 'Germany', visitors: 2300 },
          { country: 'United Kingdom', visitors: 1800 },
          { country: 'Canada', visitors: 1200 },
          { country: 'Netherlands', visitors: 900 }
        ]
      };

      return { success: true, data: mockAnalytics };
    } catch (error) {
      return { success: false, error: 'Failed to get analytics data' };
    }
  }
}

const settingsService = new SettingsService();
export default settingsService;