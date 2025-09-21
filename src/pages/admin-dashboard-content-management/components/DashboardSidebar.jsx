import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DashboardSidebar = ({ activeSection, onSectionChange, stats }) => {
  const navigationItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: 'BarChart3',
      description: 'Analytics & metrics'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: 'FolderOpen',
      description: 'Portfolio management',
      count: stats.projects
    },
    {
      id: 'blog',
      label: 'Blog Posts',
      icon: 'BookOpen',
      description: 'Content publishing',
      count: stats.blogPosts
    },
    {
      id: 'slides',
      label: 'Hero Slides',
      icon: 'Image',
      description: 'Carousel content',
      count: stats.slides
    },
    {
      id: 'settings',
      label: 'Site Settings',
      icon: 'Settings',
      description: 'Configuration'
    }
  ];

  const quickActions = [
    {
      id: 'new-project',
      label: 'New Project',
      icon: 'Plus',
      variant: 'primary',
      action: () => onSectionChange('projects', 'create')
    },
    {
      id: 'new-post',
      label: 'New Blog Post',
      icon: 'PenTool',
      variant: 'secondary',
      action: () => onSectionChange('blog', 'create')
    },
    {
      id: 'new-slide',
      label: 'New Slide',
      icon: 'ImagePlus',
      variant: 'outline',
      action: () => onSectionChange('slides', 'create')
    }
  ];

  return (
    <div className="w-full h-full bg-surface border-r border-border-accent/20 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border-accent/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-background" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-primary">Admin Panel</h2>
            <p className="text-xs text-text-secondary font-caption">Content Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="px-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left
                transition-all duration-fast group min-h-[52px]
                ${activeSection === item.id
                  ? 'bg-primary/10 text-primary shadow-glow-primary'
                  : 'text-text-secondary hover:text-primary hover:bg-primary/5'
                }
              `}
            >
              <Icon 
                name={item.icon} 
                size={20} 
                className={activeSection === item.id ? 'text-primary' : 'text-text-secondary group-hover:text-primary'} 
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.label}</div>
                <div className="text-xs text-text-secondary/80 font-caption truncate">
                  {item.description}
                </div>
              </div>
              {item.count !== undefined && (
                <div className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${activeSection === item.id
                    ? 'bg-primary/20 text-primary' :'bg-surface text-text-secondary'
                  }
                `}>
                  {item.count}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="px-4 mt-8">
          <h3 className="text-sm font-heading font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                onClick={action.action}
                iconName={action.icon}
                iconPosition="left"
                className="w-full justify-start"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-accent/20">
        <div className="text-center">
          <div className="text-xs text-text-secondary font-caption">
            WisdomInTech Admin v2.0
          </div>
          <div className="text-xs text-text-secondary/60 mt-1">
            Secure Content Management
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;