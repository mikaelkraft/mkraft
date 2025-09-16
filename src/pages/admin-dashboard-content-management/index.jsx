import React, { useState } from 'react';
import HeaderNavigation from '../../components/ui/HeaderNavigation';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardOverview from './components/DashboardOverview';
import ProjectsManagement from './components/ProjectsManagement';
import BlogManagement from './components/BlogManagement';
import SlidesManagement from './components/SlidesManagement';
import SiteSettings from './components/SiteSettings';

const AdminDashboardContentManagement = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Mock data for dashboard
  const mockStats = {
    projects: 12,
    blogPosts: 24,
    slides: 5,
    totalViews: 24700
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

  const mockProjects = [
    {
      id: 1,
      title: "CyberKraft E-commerce Platform",
      description: "Full-stack e-commerce solution with React, Node.js, and advanced payment integration",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
      technologies: ["React", "Node.js", "MongoDB", "Stripe", "AWS"],
      status: "published",
      date: "2024-01-15",
      views: 1250,
      likes: 89
    },
    {
      id: 2,
      title: "Neural Network Visualization Tool",
      description: "Interactive web application for visualizing and understanding neural network architectures",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
      technologies: ["Python", "TensorFlow", "D3.js", "Flask"],
      status: "published",
      date: "2024-01-10",
      views: 980,
      likes: 67
    },
    {
      id: 3,
      title: "Blockchain Analytics Dashboard",
      description: "Real-time cryptocurrency and blockchain data analysis platform",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
      technologies: ["React", "Web3.js", "Solidity", "Chart.js"],
      status: "draft",
      date: "2024-01-08",
      views: 0,
      likes: 0
    }
  ];

  const mockBlogPosts = [
    {
      id: 1,
      title: "Advanced React Patterns for Modern Applications",
      excerpt: "Exploring compound components, render props, and custom hooks for building scalable React applications",
      featuredImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
      tags: ["React", "JavaScript", "Frontend"],
      status: "published",
      publishDate: "2024-01-20",
      views: 2340,
      comments: 45,
      likes: 156
    },
    {
      id: 2,
      title: "Building Secure APIs with Node.js and JWT",
      excerpt: "Complete guide to implementing authentication and authorization in Node.js applications",
      featuredImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
      tags: ["Node.js", "Security", "Backend"],
      status: "published",
      publishDate: "2024-01-18",
      views: 1890,
      comments: 32,
      likes: 98
    },
    {
      id: 3,
      title: "Machine Learning in Web Development",
      excerpt: "Integrating ML models into web applications for enhanced user experiences",
      featuredImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
      tags: ["Machine Learning", "AI", "Web Development"],
      status: "draft",
      publishDate: "2024-01-22",
      views: 0,
      comments: 0,
      likes: 0
    }
  ];

  const mockSlides = [
    {
      id: 1,
      title: "Welcome to CyberKraft",
      subtitle: "Innovative solutions for the digital future",
      backgroundImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800",
      ctaText: "Explore Projects",
      ctaLink: "/projects",
      duration: 5,
      order: 1,
      status: "active",
      views: 5600
    },
    {
      id: 2,
      title: "Cutting-Edge Technology",
      subtitle: "Building tomorrow\'s applications today",
      backgroundImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
      ctaText: "View Blog",
      ctaLink: "/blog",
      duration: 5,
      order: 2,
      status: "active",
      views: 4200
    },
    {
      id: 3,
      title: "Let\'s Collaborate",
      subtitle: "Ready to bring your ideas to life",
      backgroundImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
      ctaText: "Contact Me",
      ctaLink: "/contact",
      duration: 5,
      order: 3,
      status: "inactive",
      views: 1800
    }
  ];

  const mockSettings = {
    siteTitle: "CyberKraft Portfolio",
    siteTagline: "Neo-Cyberpunk Experience",
    siteDescription: "A futuristic portfolio showcasing cutting-edge development work and innovative solutions for the digital future.",
    contactEmail: "contact@cyberkraft.dev",
    adminEmail: "admin@cyberkraft.dev",
    enableVideo: true,
    defaultTheme: "cyberpunk",
    defaultFontSize: "medium",
    logoUrl: "",
    faviconUrl: "",
    socialMedia: {
      twitter: "mikael_kraft",
      linkedin: "in/mikael-kraft",
      github: "mikaelkraft",
      email: "contact@cyberkraft.dev"
    },
    seo: {
      keywords: "portfolio, developer, cyberpunk, react, javascript, web development",
      ogImage: "https://cyberkraft.dev/og-image.jpg",
      googleAnalytics: "",
      searchConsole: ""
    },
    maintenanceMode: false,
    customCSS: "",
    customJS: ""
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

  const handleProjectUpdate = (projectId, updatedData) => {
    console.log('Update project:', projectId, updatedData);
  };

  const handleProjectDelete = (projectId) => {
    console.log('Delete project:', projectId);
  };

  const handleProjectCreate = (projectData) => {
    console.log('Create project:', projectData);
  };

  const handlePostUpdate = (postId, updatedData) => {
    console.log('Update post:', postId, updatedData);
  };

  const handlePostDelete = (postId) => {
    console.log('Delete post:', postId);
  };

  const handlePostCreate = (postData) => {
    console.log('Create post:', postData);
  };

  const handleSlideUpdate = (slideId, updatedData) => {
    console.log('Update slide:', slideId, updatedData);
  };

  const handleSlideDelete = (slideId) => {
    console.log('Delete slide:', slideId);
  };

  const handleSlideCreate = (slideData) => {
    console.log('Create slide:', slideData);
  };

  const handleSlideReorder = (slideId, newOrder) => {
    console.log('Reorder slide:', slideId, 'to position:', newOrder);
  };

  const handleSettingsUpdate = (updatedSettings) => {
    console.log('Update settings:', updatedSettings);
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
            projects={mockProjects}
            onProjectUpdate={handleProjectUpdate}
            onProjectDelete={handleProjectDelete}
            onProjectCreate={handleProjectCreate}
          />
        );
      case 'blog':
        return (
          <BlogManagement
            blogPosts={mockBlogPosts}
            onPostUpdate={handlePostUpdate}
            onPostDelete={handlePostDelete}
            onPostCreate={handlePostCreate}
          />
        );
      case 'slides':
        return (
          <SlidesManagement
            slides={mockSlides}
            onSlideUpdate={handleSlideUpdate}
            onSlideDelete={handleSlideDelete}
            onSlideCreate={handleSlideCreate}
            onSlideReorder={handleSlideReorder}
          />
        );
      case 'settings':
        return (
          <SiteSettings
            settings={mockSettings}
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