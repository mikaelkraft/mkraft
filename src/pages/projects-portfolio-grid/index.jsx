import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProjectCard from './components/ProjectCard';
import ProjectFilters from './components/ProjectFilters';
import ProjectModal from './components/ProjectModal';
import ProjectForm from './components/ProjectForm';
import ProjectSkeleton from './components/ProjectSkeleton';

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

  // Mock projects data
  const mockProjects = [
    {
      id: "1",
  title: "WisdomInTech",
      description: "A futuristic cyberpunk-themed portfolio website built with React and modern web technologies. Features dynamic theming, admin CRUD operations, and responsive design.",
      fullDescription: `A comprehensive portfolio and blog management system designed with a cyberpunk aesthetic. This project showcases advanced React patterns, state management, and modern UI/UX principles.\n\nThe application features a complete admin dashboard for content management, dynamic theming system, and responsive design that works seamlessly across all devices.`,
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
      technologies: ["React", "JavaScript", "Tailwind CSS", "Vite", "React Router"],
      status: "completed",
      featured: true,
  liveUrl: "#",
  githubUrl: "#",
      completedDate: "2024-01-15",
      duration: "2 months",
      client: "Personal",
      features: [
        "Dynamic theme switching with 4 distinct themes",
        "Complete CRUD operations for content management",
        "Responsive design optimized for all devices",
        "Advanced search and filtering capabilities",
        "Real-time visitor analytics display",
        "Cyberpunk-themed animations and effects"
      ],
      challenges: `The main challenge was creating a cohesive cyberpunk design system that remained accessible and functional across different themes. Implementing the dynamic theming system required careful CSS variable management and ensuring consistent contrast ratios.\n\nAnother significant challenge was optimizing the admin CRUD operations while maintaining a smooth user experience for visitors.`
    },
    {
      id: "2",
      title: "Blockchain Analytics Dashboard",
      description: "Real-time cryptocurrency analytics platform with advanced charting, portfolio tracking, and market sentiment analysis using React and D3.js.",
      fullDescription: `A comprehensive blockchain analytics platform that provides real-time insights into cryptocurrency markets. Built with React and integrated with multiple blockchain APIs for accurate data visualization.\n\nThe dashboard features advanced charting capabilities, portfolio management tools, and sentiment analysis to help users make informed trading decisions.`,
      image: "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?w=800&h=600&fit=crop",
      technologies: ["React", "D3.js", "Node.js", "WebSocket", "Blockchain APIs", "TypeScript"],
      status: "completed",
      featured: true,
      liveUrl: "https://crypto-analytics-pro.com",
      githubUrl: "https://github.com/mikaelkraft/crypto-analytics",
      completedDate: "2023-11-20",
      duration: "4 months",
      client: "CryptoTech Solutions",
      features: [
        "Real-time cryptocurrency price tracking",
        "Advanced technical analysis charts",
        "Portfolio performance analytics",
        "Market sentiment indicators",
        "Custom alert system",
        "Multi-exchange data aggregation"
      ],
      challenges: `Managing real-time data streams from multiple blockchain networks while maintaining optimal performance was the primary challenge. Implementing efficient WebSocket connections and data caching strategies was crucial for delivering a smooth user experience.`
    },
    {
      id: "3",
      title: "Neural Network Visualizer",
      description: "Interactive web application for visualizing and understanding neural network architectures with real-time training visualization and educational content.",
      fullDescription: `An educational tool designed to help students and professionals understand neural network concepts through interactive visualizations. The application demonstrates various network architectures and training processes in real-time.\n\nBuilt with React and TensorFlow.js, it provides hands-on learning experiences for machine learning concepts.`,
      image: "https://images.pixabay.com/photo/2019/11/07/20/24/check-4609540_1280.jpg?w=800&h=600&fit=crop",
      technologies: ["React", "TensorFlow.js", "Python", "D3.js", "WebGL", "Machine Learning"],
      status: "in-progress",
      featured: false,
      liveUrl: "https://neural-viz.edu",
      githubUrl: "https://github.com/mikaelkraft/neural-visualizer",
      completedDate: "2024-03-01",
      duration: "3 months",
      client: "University Research Lab",
      features: [
        "Interactive neural network diagrams",
        "Real-time training visualization",
        "Multiple architecture support",
        "Educational tutorials and guides",
        "Performance metrics dashboard",
        "Export functionality for research"
      ],
      challenges: `Rendering complex neural network visualizations in the browser while maintaining 60fps performance required extensive optimization. Implementing WebGL shaders for efficient graphics rendering was essential for handling large networks.`
    },
    {
      id: "4",
      title: "E-Commerce Platform",
      description: "Full-stack e-commerce solution with React frontend, Node.js backend, payment integration, and comprehensive admin dashboard for inventory management.",
      fullDescription: `A complete e-commerce platform built from the ground up with modern web technologies. Features include user authentication, product catalog, shopping cart, payment processing, and order management.\n\nThe admin dashboard provides comprehensive tools for inventory management, order processing, and customer relationship management.`,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
      technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe API", "JWT"],
      status: "completed",
      featured: false,
      liveUrl: "https://techstore-pro.com",
      githubUrl: "https://github.com/mikaelkraft/ecommerce-platform",
      completedDate: "2023-09-15",
      duration: "5 months",
      client: "TechStore Inc.",
      features: [
        "User authentication and profiles",
        "Product catalog with search and filters",
        "Shopping cart and wishlist",
        "Secure payment processing",
        "Order tracking and history",
        "Admin dashboard for management"
      ],
      challenges: `Implementing secure payment processing while ensuring PCI compliance was the most critical challenge. Additionally, optimizing database queries for the product catalog to handle thousands of items required careful indexing and caching strategies.`
    },
    {
      id: "5",
      title: "IoT Monitoring System",
      description: "Real-time IoT device monitoring dashboard with sensor data visualization, alert management, and predictive maintenance capabilities.",
      fullDescription: `A comprehensive IoT monitoring solution that tracks multiple sensor types across industrial environments. The system provides real-time data visualization, automated alerting, and predictive maintenance recommendations.\n\nBuilt with React for the frontend and Python for data processing, it handles thousands of sensor readings per minute.`,
      image: "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?w=800&h=600&fit=crop",
      technologies: ["React", "Python", "InfluxDB", "MQTT", "Docker", "Kubernetes"],
      status: "completed",
      featured: false,
      liveUrl: "https://iot-monitor-pro.com",
      githubUrl: "https://github.com/mikaelkraft/iot-monitoring",
      completedDate: "2023-12-10",
      duration: "6 months",
      client: "Industrial Solutions Corp",
      features: [
        "Real-time sensor data visualization",
        "Automated alert system",
        "Predictive maintenance algorithms",
        "Historical data analysis",
        "Device management interface",
        "Custom dashboard creation"
      ],
      challenges: `Handling high-frequency sensor data while maintaining real-time visualization performance required implementing efficient data streaming and aggregation techniques. The system needed to process thousands of data points per second without overwhelming the user interface.`
    },
    {
      id: "6",
      title: "Social Media Analytics Tool",
      description: "Comprehensive social media analytics platform with sentiment analysis, engagement tracking, and automated reporting for multiple social platforms.",
      fullDescription: `A powerful analytics tool that aggregates data from multiple social media platforms to provide comprehensive insights into brand performance and audience engagement.\n\nThe platform uses advanced natural language processing for sentiment analysis and provides automated reporting capabilities for marketing teams.`,
      image: "https://images.pixabay.com/photo/2017/06/26/19/03/social-media-2444884_1280.jpg?w=800&h=600&fit=crop",
      technologies: ["React", "Python", "NLP", "APIs", "PostgreSQL", "Redis"],
      status: "planning",
      featured: false,
      liveUrl: "",
      githubUrl: "https://github.com/mikaelkraft/social-analytics",
      completedDate: "",
      duration: "4 months",
      client: "Marketing Agency Pro",
      features: [
        "Multi-platform data aggregation",
        "Sentiment analysis and mood tracking",
        "Engagement metrics dashboard",
        "Automated report generation",
        "Competitor analysis tools",
        "Custom KPI tracking"
      ],
      challenges: `Integrating with multiple social media APIs while handling rate limits and data consistency across platforms presents ongoing challenges. Implementing accurate sentiment analysis for different languages and contexts requires continuous model refinement.`
    }
  ];

  // Simulate loading and set mock data
  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
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
        <meta property="og:url" content="https://mikaelkraft.dev/projects" />
        <meta property="og:image" content="/assets/images/no_image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@mikael_kraft" />
        <meta name="twitter:creator" content="@mikael_kraft" />
        <link rel="canonical" href="https://mikaelkraft.dev/projects" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProjectSkeleton key={index} />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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