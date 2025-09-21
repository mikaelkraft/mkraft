import React, { useEffect, useState } from 'react';
import HeaderNavigation from '../../components/ui/HeaderNavigation';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardOverview from './components/DashboardOverview';
import ProjectsManagement from './components/ProjectsManagement';
import BlogManagement from './components/BlogManagement';
import BlogEditor from './components/BlogEditor';
import SlidesManagement from './components/SlidesManagement';
import SiteSettings from './components/SiteSettings';
import projectService from '../../utils/projectService';
import blogService from '../../utils/blogService';
import slideService from '../../utils/slideService';
import settingsService from '../../utils/settingsService';
import { useToast } from '../../contexts/ToastContext';

const AdminDashboardContentManagement = () => {
  const { show } = useToast();
  const [activeSection, setActiveSection] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [projects, setProjects] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [slides, setSlides] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogEditorState, setBlogEditorState] = useState({ open: false, mode: 'create', post: null });

  // Helper mappers (UI shape -> DB shape)
  const toDbProject = (data = {}) => {
    const {
      image,
      date, // UI-only
      ...rest
    } = data || {};
    return {
      ...rest,
      featured_image: image,
      // created_at is managed by DB; ignore date from UI
    };
  };

  const toDbPost = (data = {}) => {
    const {
      featuredImage,
      publishDate,
      views, comments, likes, readTime,
      id, // ignore client-provided id
      slug,
      featured,
      metaTitle,
      metaDescription,
      publishedAt,
      ...rest
    } = data || {};
    return {
      ...rest,
      featured_image: featuredImage,
      published_at: publishedAt ?? publishDate,
      read_time: readTime,
      slug,
      featured,
      meta_title: metaTitle,
      meta_description: metaDescription,
      // counters managed by DB
    };
  };

  const toDbSlide = (data = {}) => {
    const {
      backgroundImage,
      ctaText,
      ctaLink,
      order,
      views, // ignore
      status,
      ...rest
    } = data || {};
    return {
      ...rest,
      background_image: backgroundImage,
      cta_text: ctaText,
      cta_link: ctaLink,
      display_order: order,
      // Map UI status to DB content_status
      status: status === 'active' ? 'published' : status === 'inactive' ? 'draft' : status,
    };
  };

  // Mock data for dashboard
  const mockStats = {
    projects: projects.length,
    blogPosts: blogPosts.length,
    slides: slides.length,
    totalViews: 0
  };

  const mockAnalytics = {
    visitorData: [
      { date: '2024-01-01', visitors: 120 },
      { date: '2024-01-02', visitors: 150 },
      { date: '2024-01-03', visitors: 180 },
      { date: '2024-01-04', visitors: 200 },
      { date: '2024-01-05', visitors: 170 },
      { date: '2024-01-06', visitors: 220 },
      { date: '2024-01-07', visitors: 250 }
    ],
    contentData: [
      { type: 'Projects', views: 8500 },
      { type: 'Blog', views: 12000 },
      { type: 'About', views: 4200 }
    ],
    recentActivity: [
      {
        type: 'create',
        action: 'Created new blog post "Advanced React Patterns"',
        timestamp: '2 hours ago'
      },
      {
        type: 'update',
        action: 'Updated project "E-commerce Platform"',
        timestamp: '4 hours ago'
      },
      {
        type: 'create',
        action: 'Added new hero slide "Innovation Showcase"',
        timestamp: '1 day ago'
      },
      {
        type: 'update',
        action: 'Modified site settings',
        timestamp: '2 days ago'
      },
      {
        type: 'delete',
        action: 'Removed outdated project "Legacy App"',
        timestamp: '3 days ago'
      }
    ],
    popularContent: [
      { name: 'Projects', value: 45 },
      { name: 'Blog Posts', value: 35 },
      { name: 'About Page', value: 20 }
    ]
  };

  // Load data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [proj, posts, sld, stg] = await Promise.all([
          projectService.getAllProjects(),
          blogService.getAllPosts(),
          slideService.getAllSlides(),
          settingsService.getSettings(),
        ]);
        if (!mounted) return;
        if (proj.success) setProjects(proj.data);
        if (posts.success) setBlogPosts(posts.data);
        if (sld.success) setSlides(sld.data);
        if (stg.success) setSettings(stg.data);
      } catch (e) {
        if (mounted) setError('Failed to load admin data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const normalizedPosts = blogPosts.map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    featuredImage: p.featured_image,
    tags: p.tags || [],
    status: p.status,
    publishDate: p.published_at,
    publishedAt: p.published_at,
    readTime: p.read_time,
    views: p.view_count,
    comments: p.comment_count,
    likes: p.like_count,
    slug: p.slug,
    featured: p.featured,
    metaTitle: p.meta_title,
    metaDescription: p.meta_description,
  }));

  const normalizedSlides = slides.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    backgroundImage: s.background_image,
    ctaText: s.cta_text,
    ctaLink: s.cta_link,
    duration: s.duration,
    order: s.display_order,
    status: s.status === 'published' ? 'active' : 'inactive',
    views: s.view_count,
  }));

  const normalizedSettings = settings && {
    siteTitle: settings.site_title,
    siteTagline: settings.site_tagline,
    siteDescription: settings.site_description,
    contactEmail: settings.contact_email,
    adminEmail: settings.admin_email,
    enableVideo: settings.enable_video,
    defaultTheme: settings.default_theme,
    defaultFontSize: settings.default_font_size,
    logoUrl: settings.logo_url,
    faviconUrl: settings.favicon_url,
    socialMedia: settings.social_media,
    seo: settings.seo_settings,
    maintenanceMode: settings.maintenance_mode,
    customCSS: settings.custom_css,
    customJS: settings.custom_js,
    ui: settings.ui_settings || {},
    ads: settings.ads_settings || { enabled: false, provider: 'adsense', publisher_id: null, auto_ads: true, grid_interval: 6, ad_slot: null },
  };

  const defaultUiSettings = {
  siteTitle: 'WisdomInTech',
    siteTagline: 'Neo-Cyberpunk Experience',
    siteDescription: '',
    contactEmail: '',
    adminEmail: '',
    enableVideo: true,
    defaultTheme: 'cyberpunk',
    defaultFontSize: 'medium',
    logoUrl: '',
    faviconUrl: '',
    socialMedia: { twitter: '', linkedin: '', github: '', email: '' },
    seo: { keywords: '', ogImage: '', googleAnalytics: '', searchConsole: '' },
    maintenanceMode: false,
    customCSS: '',
    customJS: '',
    ui: { toast_duration_ms: 3500 },
    ads: { enabled: false, provider: 'adsense', publisher_id: '', auto_ads: true, grid_interval: 6, ad_slot: '' },
  };

  const handleSectionChange = (section, action = null) => {
    setActiveSection(section);
    if (action) {
      // Handle specific actions like 'create', 'edit', etc.
      console.log(`Action: ${action} for section: ${section}`);
    }
  };

  const handleAuthToggle = () => {
    setIsAuthenticated(!isAuthenticated);
  };

  const handleProjectUpdate = async (projectId, updatedData) => {
    const res = await projectService.updateProject(projectId, toDbProject(updatedData));
    if (res.success) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? res.data : p)));
      show('Project updated successfully', { type: 'success' });
    } else {
      show(res.error || 'Failed to update project', { type: 'error' });
    }
  };

  const handleProjectDelete = async (projectId) => {
    const res = await projectService.deleteProject(projectId);
    if (res.success) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      show('Project deleted', { type: 'success' });
    } else {
      show(res.error || 'Failed to delete project', { type: 'error' });
    }
  };

  const handleProjectCreate = async (projectData) => {
    const res = await projectService.createProject(toDbProject(projectData));
    if (res.success) {
      setProjects((prev) => [res.data, ...prev]);
      show('Project created', { type: 'success' });
    } else {
      show(res.error || 'Failed to create project', { type: 'error' });
    }
  };

  const handlePostUpdate = async (postId, updatedData) => {
    const res = await blogService.updatePost(postId, toDbPost(updatedData));
    if (res.success) {
      setBlogPosts((prev) => prev.map((b) => (b.id === postId ? res.data : b)));
      show('Post updated', { type: 'success' });
      setBlogEditorState({ open: false, mode: 'create', post: null });
    } else {
      show(res.error || 'Failed to update post', { type: 'error' });
    }
  };

  const handlePostDelete = async (postId) => {
    const res = await blogService.deletePost(postId);
    if (res.success) {
      setBlogPosts((prev) => prev.filter((b) => b.id !== postId));
      show('Post deleted', { type: 'success' });
    } else {
      show(res.error || 'Failed to delete post', { type: 'error' });
    }
  };

  const handlePostCreate = async (postData) => {
    const res = await blogService.createPost(toDbPost(postData));
    if (res.success) {
      setBlogPosts((prev) => [res.data, ...prev]);
      show('Post created', { type: 'success' });
      setBlogEditorState({ open: false, mode: 'create', post: null });
    } else {
      show(res.error || 'Failed to create post', { type: 'error' });
    }
  };

  const handleSlideUpdate = async (slideId, updatedData) => {
    const res = await slideService.updateSlide(slideId, toDbSlide(updatedData));
    if (res.success) {
      setSlides((prev) => prev.map((s) => (s.id === slideId ? res.data : s)));
      show('Slide updated', { type: 'success' });
    } else {
      show(res.error || 'Failed to update slide', { type: 'error' });
    }
  };

  const handleSlideDelete = async (slideId) => {
    const res = await slideService.deleteSlide(slideId);
    if (res.success) {
      setSlides((prev) => prev.filter((s) => s.id !== slideId));
      show('Slide deleted', { type: 'success' });
    } else {
      show(res.error || 'Failed to delete slide', { type: 'error' });
    }
  };

  const handleSlideCreate = async (slideData) => {
    const res = await slideService.createSlide(toDbSlide(slideData));
    if (res.success) {
      setSlides((prev) => [res.data, ...prev]);
      show('Slide created', { type: 'success' });
    } else {
      show(res.error || 'Failed to create slide', { type: 'error' });
    }
  };

  const handleSlideReorder = async (slideId, newOrder) => {
    const res = await slideService.updateSlideOrder(slideId, newOrder);
    if (res.success) {
      setSlides((prev) => prev.map((s) => (s.id === slideId ? { ...s, display_order: newOrder } : s)));
      show('Slide order updated', { type: 'success' });
    } else {
      show(res.error || 'Failed to reorder slide', { type: 'error' });
    }
  };

  const handleSettingsUpdate = async (updatedSettings) => {
    const res = await settingsService.updateSettings({
      site_title: updatedSettings.siteTitle,
      site_tagline: updatedSettings.siteTagline,
      site_description: updatedSettings.siteDescription,
      contact_email: updatedSettings.contactEmail,
      admin_email: updatedSettings.adminEmail,
      enable_video: updatedSettings.enableVideo,
      default_theme: updatedSettings.defaultTheme,
      default_font_size: updatedSettings.defaultFontSize,
      logo_url: updatedSettings.logoUrl,
      favicon_url: updatedSettings.faviconUrl,
      social_media: updatedSettings.socialMedia,
      seo_settings: updatedSettings.seo,
      maintenance_mode: updatedSettings.maintenanceMode,
      custom_css: updatedSettings.customCSS,
      custom_js: updatedSettings.customJS,
      ui_settings: updatedSettings.ui,
      ads_settings: updatedSettings.ads,
    });
    if (res.success) {
      setSettings(res.data);
      show('Settings updated', { type: 'success' });
    } else {
      show(res.error || 'Failed to update settings', { type: 'error' });
    }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
              <DashboardOverview 
            stats={mockStats} 
            analytics={mockAnalytics} 
          />
        );
      case 'projects':
        return (
          <ProjectsManagement
            projects={(projects || []).map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              image: p.featured_image || '/assets/images/no_image.png',
              technologies: p.technologies || [],
              status: p.status,
              date: p.created_at,
            }))}
            onProjectUpdate={handleProjectUpdate}
            onProjectDelete={handleProjectDelete}
            onProjectCreate={handleProjectCreate}
          />
        );
      case 'blog':
        return (
          <div className="h-full flex flex-col">
            {!blogEditorState.open && (
              <BlogManagement
                blogPosts={normalizedPosts}
                onPostUpdate={handlePostUpdate}
                onPostDelete={handlePostDelete}
                onPostCreate={handlePostCreate}
                onOpenEditor={({ mode, post }) => setBlogEditorState({ open: true, mode: mode || 'create', post: post || null })}
              />
            )}
            {blogEditorState.open && (
              <div className="flex-1 min-h-[60vh]">
                <BlogEditor
                  mode={blogEditorState.mode}
                  initialData={blogEditorState.mode === 'edit' && blogEditorState.post ? blogEditorState.post : {}}
                  onCancel={() => setBlogEditorState({ open: false, mode: 'create', post: null })}
                  onSave={(data) => blogEditorState.mode === 'edit' && blogEditorState.post ? handlePostUpdate(blogEditorState.post.id, data) : handlePostCreate(data)}
                />
              </div>
            )}
          </div>
        );
      case 'slides':
        return (
          <SlidesManagement
            slides={normalizedSlides}
            onSlideUpdate={handleSlideUpdate}
            onSlideDelete={handleSlideDelete}
            onSlideCreate={handleSlideCreate}
            onSlideReorder={handleSlideReorder}
          />
        );
      case 'settings':
        return (
          <SiteSettings
            settings={normalizedSettings || defaultUiSettings}
            onSettingsUpdate={handleSettingsUpdate}
          />
        );
      default:
        return (
          <DashboardOverview 
            stats={mockStats} 
            analytics={mockAnalytics} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="bg-surface border border-border-accent/20 rounded-lg px-6 py-4 shadow-glow-primary">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
            <div className="text-sm text-text-secondary">Loading admin data…</div>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-error text-background px-4 py-2 rounded shadow">
          {error}
        </div>
      )}
      <HeaderNavigation 
        isAuthenticated={isAuthenticated}
        onAuthToggle={handleAuthToggle}
      />
      
      <div className="pt-16 lg:pt-18">
        <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-4.5rem)]">
          {/* Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <DashboardSidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              stats={mockStats}
            />
          </div>

          {/* Mobile Sidebar - Collapsible */}
          <div className="lg:hidden">
            {/* Mobile sidebar implementation would go here */}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
              {renderMainContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContentManagement;