import React, { useEffect } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProjectModal = ({ project, isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-surface border border-border-accent/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-glow-primary">
        {/* Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border-accent/20 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="font-heading font-bold text-xl text-text-primary">
              {project.title}
            </h2>
            {project.featured && (
              <Icon name="Star" size={20} className="text-accent" />
            )}
            <div className={`px-2 py-1 rounded-full text-xs font-caption ${
              project.status === 'completed' 
                ? 'bg-success/20 text-success border border-success/30' 
                : project.status === 'in-progress' ?'bg-warning/20 text-warning border border-warning/30' :'bg-primary/20 text-primary border border-primary/30'
            }`}>
              {project.status.replace('-', ' ').toUpperCase()}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClose}
            className="text-text-secondary hover:text-primary"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Project Image */}
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
            <Image
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"></div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-heading font-semibold text-lg text-text-primary mb-3">
                  Project Overview
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {project.fullDescription || project.description}
                </p>
              </div>

              {/* Features */}
              {project.features && (
                <div>
                  <h3 className="font-heading font-semibold text-lg text-text-primary mb-3">
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    {project.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
                        <span className="text-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Challenges */}
              {project.challenges && (
                <div>
                  <h3 className="font-heading font-semibold text-lg text-text-primary mb-3">
                    Technical Challenges
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {project.challenges}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Links */}
              <div>
                <h3 className="font-heading font-semibold text-lg text-text-primary mb-3">
                  Project Links
                </h3>
                <div className="space-y-3">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors duration-fast"
                    >
                      <Icon name="ExternalLink" size={18} className="text-primary" />
                      <span className="text-primary font-medium">View Live Demo</span>
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-text-secondary/10 border border-text-secondary/20 rounded-lg hover:bg-text-secondary/20 transition-colors duration-fast"
                    >
                      <Icon name="Github" size={18} className="text-text-secondary" />
                      <span className="text-text-secondary font-medium">View Source Code</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="font-heading font-semibold text-lg text-text-primary mb-3">
                  Technologies Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-md font-caption border border-primary/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Info */}
              <div>
                <h3 className="font-heading font-semibold text-lg text-text-primary mb-3">
                  Project Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Completed:</span>
                    <span className="text-text-primary font-medium">{project.completedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Duration:</span>
                    <span className="text-text-primary font-medium">{project.duration || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Client:</span>
                    <span className="text-text-primary font-medium">{project.client || 'Personal'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;