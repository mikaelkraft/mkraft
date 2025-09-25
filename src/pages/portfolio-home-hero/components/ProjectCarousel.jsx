import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import settingsService from '../../../utils/settingsService';

const ProjectCarousel = ({ currentTheme }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // Load projects from settings
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await settingsService.getSettings();
        if (res.success && res.data.ui?.demo_projects?.length) {
          setProjects(res.data.ui.demo_projects);
        } else {
          // Fallback to default projects if none configured
          setProjects(defaultProjects);
        }
      } catch (error) {
        console.error('Failed to load demo projects:', error);
        setProjects(defaultProjects);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const defaultProjects = [
    {
      id: 1,
      title: "CyberSecure Banking Platform",
      description: "Next-generation banking application with advanced encryption and blockchain integration for secure transactions.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
      tech: ["React", "Node.js", "Blockchain", "PostgreSQL"],
      status: "Live",
      category: "FinTech"
    },
    {
      id: 2,
      title: "Neural Network Analytics",
      description: "AI-powered data analytics platform using machine learning algorithms for predictive business intelligence.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      tech: ["Python", "TensorFlow", "React", "MongoDB"],
      status: "Development",
      category: "AI/ML"
    },
    {
      id: 3,
      title: "Quantum Cryptography Suite",
      description: "Advanced cryptographic tools leveraging quantum computing principles for next-level data protection.",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
      tech: ["Java", "Quantum SDK", "Spring Boot", "Redis"],
      status: "Research",
      category: "Security"
    },
    {
      id: 4,
      title: "DeFi Trading Platform",
      description: "Decentralized finance platform enabling secure cryptocurrency trading with smart contract automation.",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop",
      tech: ["Solidity", "Web3.js", "React", "IPFS"],
      status: "Beta",
      category: "Blockchain"
    },
    {
      id: 5,
      title: "IoT Security Framework",
      description: "Comprehensive security framework for Internet of Things devices with real-time threat detection.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop",
      tech: ["C++", "Python", "Docker", "Kubernetes"],
      status: "Live",
      category: "IoT"
    }
  ];

  useEffect(() => {
    if (isAutoPlaying && projects.length > 0 && !loading) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % projects.length);
      }, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, projects.length, loading]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % projects.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + projects.length) % projects.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const getThemeClasses = () => {
    switch(currentTheme) {
      case 'neural':
        return {
          bg: 'bg-purple-900/10',
          card: 'bg-purple-900/20 border-purple-500/30',
          text: 'text-purple-100',
          accent: 'text-purple-400'
        };
      case 'futuristic':
        return {
          bg: 'bg-slate-900/10',
          card: 'bg-slate-900/20 border-blue-400/30',
          text: 'text-blue-100',
          accent: 'text-blue-400'
        };
      case 'light':
        return {
          bg: 'bg-gray-50',
          card: 'bg-white border-gray-200 shadow-lg',
          text: 'text-gray-900',
          accent: 'text-blue-600'
        };
      default: // cyberpunk
        return {
          bg: 'bg-surface/10',
          card: 'bg-surface/20 border-primary/30',
          text: 'text-text-primary',
          accent: 'text-primary'
        };
    }
  };

  const themeClasses = getThemeClasses();

  if (loading) {
    return (
      <section className={`py-20 px-6 ${currentTheme === 'light' ? 'bg-gray-50' : 'bg-background'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-8 bg-surface/20 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-surface/10 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className={`${themeClasses.card} rounded-2xl border-2 overflow-hidden animate-pulse`}>
            <div className="grid lg:grid-cols-2 gap-8 p-8">
              <div className="aspect-video rounded-xl bg-surface/20"></div>
              <div className="space-y-4">
                <div className="h-6 bg-surface/20 rounded w-3/4"></div>
                <div className="h-4 bg-surface/10 rounded w-full"></div>
                <div className="h-4 bg-surface/10 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className={`py-20 px-6 ${currentTheme === 'light' ? 'bg-gray-50' : 'bg-background'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`font-heading text-3xl lg:text-4xl font-bold mb-4 ${themeClasses.text}`}>
              Featured Projects
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${currentTheme === 'light' ? 'text-gray-600' : 'text-text-secondary'}`}>
              Showcase projects will appear here once you add them in the admin dashboard
            </p>
          </div>
          <div className="text-center py-12">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${themeClasses.card} border-2 flex items-center justify-center`}>
              <Icon name="FolderOpen" size={32} className={themeClasses.accent} />
            </div>
            <h3 className={`font-heading font-semibold text-xl ${themeClasses.text} mb-4`}>
              No Demo Projects Yet
            </h3>
            <p className={`${currentTheme === 'light' ? 'text-gray-600' : 'text-text-secondary'} mb-6 max-w-md mx-auto`}>
              Add demo projects in the admin dashboard to showcase your work here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Live':
        return currentTheme === 'light' ? 'text-green-600 bg-green-100' : 'text-accent bg-accent/20';
      case 'Beta':
        return currentTheme === 'light' ? 'text-blue-600 bg-blue-100' : 'text-primary bg-primary/20';
      case 'Development':
        return currentTheme === 'light' ? 'text-orange-600 bg-orange-100' : 'text-warning bg-warning/20';
      case 'Research':
        return currentTheme === 'light' ? 'text-purple-600 bg-purple-100' : 'text-secondary bg-secondary/20';
      default:
        return currentTheme === 'light' ? 'text-gray-600 bg-gray-100' : 'text-text-secondary bg-text-secondary/20';
    }
  };

  return (
    <section className={`py-20 px-6 ${currentTheme === 'light' ? 'bg-gray-50' : 'bg-background'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={`font-heading text-3xl lg:text-4xl font-bold mb-4 ${themeClasses.text}`}>
            Featured Projects
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${currentTheme === 'light' ? 'text-gray-600' : 'text-text-secondary'}`}>
            Explore my latest work spanning blockchain, AI, cybersecurity, and full-stack development
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {projects.map((project, index) => (
                <div key={project.id} className="w-full flex-shrink-0">
                  <div className={`${themeClasses.card} rounded-2xl border-2 overflow-hidden`}>
                    <div className="grid lg:grid-cols-2 gap-8 p-8">
                      {/* Project Image */}
                      <div className="relative group">
                        <div className="aspect-video rounded-xl overflow-hidden">
                          <Image 
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-fast"></div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="flex flex-col justify-center space-y-6">
                        <div>
                          <div className={`text-sm font-medium mb-2 ${themeClasses.accent}`}>
                            {project.category}
                          </div>
                          <h3 className={`font-heading text-2xl lg:text-3xl font-bold mb-4 ${themeClasses.text}`}>
                            {project.title}
                          </h3>
                          <p className={`text-lg leading-relaxed ${currentTheme === 'light' ? 'text-gray-600' : 'text-text-secondary'}`}>
                            {project.description}
                          </p>
                        </div>

                        {/* Tech Stack */}
                        <div>
                          <h4 className={`font-medium mb-3 ${themeClasses.text}`}>
                            Technologies Used
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {project.tech.map((tech, techIndex) => (
                              <span 
                                key={techIndex}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  currentTheme === 'light' ?'bg-blue-100 text-blue-800' :'bg-primary/20 text-primary'
                                }`}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                          <button className={`
                            px-6 py-3 rounded-lg font-medium transition-all duration-fast
                            ${currentTheme === 'light' ?'bg-blue-600 text-white hover:bg-blue-700' :'bg-primary text-background hover:bg-primary/90 glow-primary'
                            }
                            min-h-[44px]
                          `}>
                            <Icon name="ExternalLink" size={18} className="inline mr-2" />
                            View Project
                          </button>
                          <button className={`
                            px-6 py-3 rounded-lg font-medium border-2 transition-all duration-fast
                            ${currentTheme === 'light' ?'border-gray-300 text-gray-700 hover:bg-gray-50' :'border-primary/50 text-primary hover:bg-primary/10'
                            }
                            min-h-[44px]
                          `}>
                            <Icon name="Github" size={18} className="inline mr-2" />
                            Source Code
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className={`
              absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full
              flex items-center justify-center transition-all duration-fast
              ${currentTheme === 'light' ?'bg-white shadow-lg text-gray-700 hover:bg-gray-50' :'bg-surface/80 text-text-primary hover:bg-surface glow-primary'
              }
            `}
            aria-label="Previous project"
          >
            <Icon name="ChevronLeft" size={24} />
          </button>
          
          <button 
            onClick={nextSlide}
            className={`
              absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full
              flex items-center justify-center transition-all duration-fast
              ${currentTheme === 'light' ?'bg-white shadow-lg text-gray-700 hover:bg-gray-50' :'bg-surface/80 text-text-primary hover:bg-surface glow-primary'
              }
            `}
            aria-label="Next project"
          >
            <Icon name="ChevronRight" size={24} />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-3 h-3 rounded-full transition-all duration-fast
                ${index === currentSlide 
                  ? (currentTheme === 'light' ? 'bg-blue-600' : 'bg-primary') 
                  : (currentTheme === 'light' ? 'bg-gray-300' : 'bg-text-secondary/30')
                }
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play Control */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-fast
              ${currentTheme === 'light' ?'text-gray-600 hover:text-gray-800 hover:bg-gray-100' :'text-text-secondary hover:text-text-primary hover:bg-surface/50'
              }
            `}
          >
            <Icon name={isAutoPlaying ? "Pause" : "Play"} size={16} />
            <span className="text-sm">
              {isAutoPlaying ? "Pause" : "Play"} Slideshow
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectCarousel;