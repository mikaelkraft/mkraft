import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import LogoCarousel from '../../../components/ui/LogoCarousel';

const ProjectShowcase = ({ currentTheme }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('/api/projects?limit=100');
        if (response.ok) {
          const projectsData = await response.json();
          setProjects(projectsData);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const getThemeClasses = () => {
    switch(currentTheme) {
      case 'neural':
        return {
          bg: 'bg-purple-900/5',
          card: 'bg-purple-900/20 border-purple-500/30 hover:border-purple-400/50',
          text: 'text-purple-100',
          secondary: 'text-purple-300',
          accent: 'text-purple-400',
          button: 'bg-purple-600 hover:bg-purple-700',
          filter: 'hover:bg-purple-500/20'
        };
      case 'futuristic':
        return {
          bg: 'bg-slate-900/5',
          card: 'bg-slate-900/20 border-blue-400/30 hover:border-blue-300/50',
          text: 'text-slate-100',
          secondary: 'text-slate-300',
          accent: 'text-blue-400',
          button: 'bg-blue-600 hover:bg-blue-700',
          filter: 'hover:bg-blue-500/20'
        };
      case 'light':
        return {
          bg: 'bg-gray-50',
          card: 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md',
          text: 'text-gray-900',
          secondary: 'text-gray-600',
          accent: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
          filter: 'hover:bg-gray-100'
        };
      default: // cyberpunk
        return {
          bg: 'bg-background/5',
          card: 'bg-surface/20 border-primary/30 hover:border-primary/50 hover:glow-primary-sm',
          text: 'text-text-primary',
          secondary: 'text-text-secondary',
          accent: 'text-primary',
          button: 'bg-primary hover:bg-primary/90',
          filter: 'hover:bg-primary/20'
        };
    }
  };

  const themeClasses = getThemeClasses();

  // Filter projects by type
  const filterProjects = (type) => {
    if (type === 'all') return projects;
    return projects.filter(project => project.type === type);
  };

  const filteredProjects = filterProjects(activeFilter);

  // Get project type icon
  const getProjectTypeIcon = (type) => {
    switch(type) {
      case 'video': return 'Video';
      case 'gallery': return 'Images';
      case 'logo_gallery': return 'Palette';
      default: return 'Image';
    }
  };

  // Render project based on type
  const renderProject = (project, index) => {
    if (project.type === 'logo_gallery') {
      return (
        <div
          key={project.id}
          className={`${themeClasses.card} rounded-xl border-2 overflow-hidden transition-all duration-300 cursor-pointer group`}
          onClick={() => setSelectedProject(project)}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-heading font-semibold text-lg ${themeClasses.text} group-hover:${themeClasses.accent} transition-colors`}>
                {project.title}
              </h3>
              <div className={`p-2 rounded-lg ${themeClasses.button} text-white`}>
                <Icon name={getProjectTypeIcon(project.type)} size={20} />
              </div>
            </div>
            <p className={`${themeClasses.secondary} text-sm mb-4 line-clamp-2`}>
              {project.description}
            </p>
            {project.gallery_images && project.gallery_images.length > 0 && (
              <div className="mb-4">
                <LogoCarousel 
                  images={project.gallery_images} 
                  autoPlay={true} 
                  speed={2000}
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full bg-${themeClasses.accent}/20 ${themeClasses.accent}`}>
                {project.category || 'Design'}
              </span>
              <span className={`text-xs ${themeClasses.secondary}`}>
                Click to view
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (project.type === 'video') {
      return (
        <div
          key={project.id}
          className={`${themeClasses.card} rounded-xl border-2 overflow-hidden transition-all duration-300 cursor-pointer group`}
          onClick={() => setSelectedProject(project)}
        >
          <div className="relative aspect-video">
            {project.video_poster ? (
              <Image
                src={project.video_poster}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : project.featured_image ? (
              <Image
                src={project.featured_image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full ${themeClasses.bg} flex items-center justify-center`}>
                <Icon name="Video" size={48} className={themeClasses.secondary} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className={`p-3 rounded-full ${themeClasses.button} text-white`}>
                <Icon name="Play" size={24} />
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className={`font-heading font-semibold ${themeClasses.text} mb-2`}>
              {project.title}
            </h3>
            <p className={`${themeClasses.secondary} text-sm line-clamp-2`}>
              {project.description}
            </p>
          </div>
        </div>
      );
    }

    // Default gallery/image project
    return (
      <div
        key={project.id}
        className={`${themeClasses.card} rounded-xl border-2 overflow-hidden transition-all duration-300 cursor-pointer group`}
        onClick={() => setSelectedProject(project)}
      >
        <div className="relative aspect-video">
          {project.featured_image ? (
            <Image
              src={project.featured_image}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full ${themeClasses.bg} flex items-center justify-center`}>
              <Icon name="Image" size={48} className={themeClasses.secondary} />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className={`font-heading font-semibold ${themeClasses.text} mb-2`}>
            {project.title}
          </h3>
          <p className={`${themeClasses.secondary} text-sm line-clamp-2`}>
            {project.description}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className={`py-20 px-6 ${themeClasses.bg}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-8 bg-surface/20 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-surface/10 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`${themeClasses.card} rounded-xl border-2 overflow-hidden animate-pulse`}>
                <div className="aspect-video bg-surface/20"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-surface/20 rounded w-3/4"></div>
                  <div className="h-3 bg-surface/10 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className={`py-20 px-6 ${themeClasses.bg}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`font-heading text-3xl lg:text-4xl font-bold mb-4 ${themeClasses.text}`}>
              Project Showcase
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${themeClasses.secondary}`}>
              Video projects, image galleries, and logo designs will appear here once you create them
            </p>
          </div>
          <div className="text-center py-12">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${themeClasses.card} border-2 flex items-center justify-center`}>
              <Icon name="FolderOpen" size={32} className={themeClasses.accent} />
            </div>
            <h3 className={`font-heading font-semibold text-xl ${themeClasses.text} mb-4`}>
              No Projects Yet
            </h3>
            <p className={`${themeClasses.secondary} mb-6 max-w-md mx-auto`}>
              Create video projects, image galleries, and logo showcases in the admin dashboard to display them here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className={`py-20 px-6 ${themeClasses.bg}`}>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className={`font-heading text-3xl lg:text-4xl font-bold mb-4 ${themeClasses.text}`}>
              Project Showcase
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${themeClasses.secondary}`}>
              Explore my diverse portfolio including video projects, image galleries, and logo designs
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { key: 'all', label: 'All Projects', icon: 'Grid' },
              { key: 'video', label: 'Videos', icon: 'Video' },
              { key: 'gallery', label: 'Galleries', icon: 'Images' },
              { key: 'logo_gallery', label: 'Logo Designs', icon: 'Palette' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all duration-300 ${
                  activeFilter === filter.key
                    ? `${themeClasses.button} text-white border-transparent`
                    : `${themeClasses.card} ${themeClasses.text} ${themeClasses.filter}`
                }`}
              >
                <Icon name={filter.icon} size={18} />
                <span className="font-medium">{filter.label}</span>
                {filter.key !== 'all' && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeFilter === filter.key 
                      ? 'bg-white/20' 
                      : `bg-${themeClasses.accent}/20 ${themeClasses.accent}`
                  }`}>
                    {filterProjects(filter.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map((project, index) => renderProject(project, index))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${themeClasses.card} border-2 flex items-center justify-center`}>
                <Icon name="Filter" size={24} className={themeClasses.accent} />
              </div>
              <h3 className={`font-heading font-semibold text-lg ${themeClasses.text} mb-2`}>
                No {activeFilter === 'all' ? 'Projects' : activeFilter === 'logo_gallery' ? 'Logo Designs' : activeFilter === 'video' ? 'Videos' : 'Galleries'} Found
              </h3>
              <p className={`${themeClasses.secondary}`}>
                Try a different filter or create new projects in the admin dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Beautiful Popup Modal for Project Details */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto ${themeClasses.card} rounded-2xl border-2`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-current border-opacity-20">
              <div>
                <h2 className={`font-heading text-2xl font-bold ${themeClasses.text}`}>
                  {selectedProject.title}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`text-xs px-3 py-1 rounded-full bg-${themeClasses.accent}/20 ${themeClasses.accent}`}>
                    {selectedProject.type?.replace('_', ' ').toUpperCase() || 'PROJECT'}
                  </span>
                  <span className={`text-sm ${themeClasses.secondary}`}>
                    {selectedProject.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className={`p-2 rounded-lg ${themeClasses.filter} ${themeClasses.text} hover:bg-red-500/20 transition-colors`}
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {selectedProject.type === 'logo_gallery' && selectedProject.gallery_images?.length > 0 && (
                <div className="mb-6">
                  <h3 className={`font-heading font-semibold text-lg ${themeClasses.text} mb-4`}>
                    Logo Collection
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedProject.gallery_images.map((image, index) => (
                      <div key={index} className={`aspect-square ${themeClasses.card} rounded-lg p-4 flex items-center justify-center border`}>
                        <Image
                          src={image}
                          alt={`Logo ${index + 1}`}
                          className="max-w-full max-h-full object-contain hover:scale-110 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.type === 'video' && (
                <div className="mb-6">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    {selectedProject.video_url ? (
                      <video
                        controls
                        poster={selectedProject.video_poster}
                        className="w-full h-full"
                      >
                        <source src={selectedProject.video_url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : selectedProject.featured_image ? (
                      <Image
                        src={selectedProject.featured_image}
                        alt={selectedProject.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${themeClasses.bg} flex items-center justify-center`}>
                        <Icon name="Video" size={64} className={themeClasses.secondary} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedProject.type === 'gallery' && selectedProject.gallery_images?.length > 0 && (
                <div className="mb-6">
                  <h3 className={`font-heading font-semibold text-lg ${themeClasses.text} mb-4`}>
                    Image Gallery
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProject.gallery_images.map((image, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className={`font-heading font-semibold text-lg ${themeClasses.text} mb-3`}>
                  Description
                </h3>
                <p className={`${themeClasses.secondary} leading-relaxed`}>
                  {selectedProject.description || 'No description available.'}
                </p>
              </div>

              {/* Technologies */}
              {selectedProject.tags && selectedProject.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className={`font-heading font-semibold text-lg ${themeClasses.text} mb-3`}>
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm bg-${themeClasses.accent}/20 ${themeClasses.accent}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex justify-between items-center">
                <div>
                  <span className={`text-sm ${themeClasses.secondary}`}>Status: </span>
                  <span className={`font-medium ${themeClasses.accent}`}>
                    {selectedProject.status || 'Unknown'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className={`px-6 py-2 rounded-lg ${themeClasses.button} text-white font-medium hover:scale-105 transition-transform`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectShowcase;