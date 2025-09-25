import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProjectCard from './components/ProjectCard';
import ProjectFilters from './components/ProjectFilters';
import ProjectModal from './components/ProjectModal';
import ProjectForm from './components/ProjectForm';
import ProjectSkeleton from './components/ProjectSkeleton';
import projectService from '../../utils/projectService';

const ProjectsPortfolioGrid = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnology, setSelectedTechnology] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load projects from Supabase
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await projectService.getPublishedProjects();
        if (!mounted) return;
        if (res.success) {
          const normalized = (res.data || []).map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            fullDescription: p.content || p.description,
            image: p.featured_image || '/assets/images/no_image.png',
            technologies: p.technologies || [],
            status: p.status === 'published' ? 'completed' : p.status,
            featured: !!p.featured,
            liveUrl: p.live_url || '',
            githubUrl: p.github_url || '',
            completedDate: (p.updated_at || p.created_at || '').slice(0, 10),
            duration: '',
            client: 'Personal',
            features: [],
            challenges: ''
          }));
          setProjects(normalized);
        } else {
          setProjects([]);
        }
      } catch (e) {
        setProjects([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Check admin status (mock implementation)
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
  }, []);

  // Get unique technologies for filter
  const allTechnologies = useMemo(() => {
    const techs = new Set();
    projects.forEach(project => {
      project.technologies.forEach(tech => techs.add(tech));
    });
    return Array.from(techs).sort();
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = !searchTerm || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTechnology = !selectedTechnology || 
        project.technologies.includes(selectedTechnology);
      
      const matchesStatus = !selectedStatus || project.status === selectedStatus;
      
      return matchesSearch && matchesTechnology && matchesStatus;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.completedDate || '1970-01-01') - new Date(b.completedDate || '1970-01-01');
        case 'title':
          return a.title.localeCompare(b.title);
        case 'featured':
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.completedDate || '1970-01-01') - new Date(a.completedDate || '1970-01-01');
        case 'newest':
        default:
          return new Date(b.completedDate || '1970-01-01') - new Date(a.completedDate || '1970-01-01');
      }
    });

    return filtered;
  }, [projects, searchTerm, selectedTechnology, selectedStatus, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTechnology('');
    setSelectedStatus('');
    setSortBy('newest');
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteProject = (project) => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      setProjects(prev => prev.filter(p => p.id !== project.id));
    }
  };

  const handleSaveProject = (projectData) => {
    if (editingProject) {
      // Update existing project
      setProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p));
    } else {
      // Add new project
      setProjects(prev => [projectData, ...prev]);
    }
    setEditingProject(null);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Mikael Kraft — Projects</title>
        <meta name="description" content="Explore Mikael Kraft's complete portfolio of web development, blockchain, and machine learning projects. View live demos, source code, and technical details." />
        <meta name="keywords" content="portfolio, projects, web development, React, blockchain, machine learning, cyberpunk" />
        <meta property="og:title" content="Mikael Kraft — Projects" />
        <meta property="og:description" content="A curated portfolio of software engineering projects by Mikael Kraft." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mkraft.tech/projects" />
        <meta property="og:image" content="/assets/images/no_image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@mikael_kraft" />
        <meta name="twitter:creator" content="@mikael_kraft" />
        <link rel="canonical" href="https://mkraft.tech/projects" />
      </Helmet>

      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-9xl mx-auto px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <Icon name="FolderOpen" size={18} className="text-primary" />
              <span className="text-primary font-caption text-sm">Portfolio Showcase</span>
            </div>
            
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-text-primary mb-6">
              Project <span className="text-primary">Portfolio</span>
            </h1>
            
            <p className="text-text-secondary text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Explore my collection of innovative projects spanning web development, blockchain technology, 
              machine learning, and cyberpunk-themed applications. Each project represents a unique challenge 
              and creative solution.
            </p>
          </div>

          {/* Filters */}
          <ProjectFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTechnology={selectedTechnology}
            onTechnologyChange={setSelectedTechnology}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
            technologies={allTechnologies}
            totalProjects={projects.length}
            filteredCount={filteredProjects.length}
          />

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProjectSkeleton key={index} />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isAdmin={isAdmin}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-surface rounded-full flex items-center justify-center">
                <Icon name="Search" size={32} className="text-text-secondary" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-text-primary mb-2">
                No Projects Found
              </h3>
              <p className="text-text-secondary mb-6">
                Try adjusting your search criteria or filters to find more projects.
              </p>
              <Button
                variant="outline"
                iconName="RotateCcw"
                onClick={handleClearFilters}
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Admin Floating Action Button */}
          {isAdmin && (
            <div className="fixed bottom-8 right-8 z-40">
              <Button
                variant="primary"
                size="lg"
                iconName="Plus"
                onClick={handleAddProject}
                className="rounded-full w-14 h-14 shadow-glow-primary hover:scale-110 transition-transform duration-fast"
                title="Add New Project"
              />
            </div>
          )}
        </div>

        {/* Project Detail Modal */}
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
        />

        {/* Project Form Modal */}
        <ProjectForm
          project={editingProject}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
        />
      </div>
    </>
  );
};

export default ProjectsPortfolioGrid;