import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProjectCard = ({ project, isAdmin, onEdit, onDelete, onViewDetails }) => {
  const handleCardClick = (e) => {
    // Prevent card click when clicking on action buttons
    if (e.target.closest('.action-button')) {
      return;
    }
    onViewDetails(project);
  };

  return (
    <div 
      className="group relative bg-surface border border-border-accent/20 rounded-lg overflow-hidden hover:border-primary/40 transition-all duration-normal cursor-pointer hover-glow-primary"
      onClick={handleCardClick}
    >
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-normal"></div>
        
        {/* Status Badge */}
        {project.status && (
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-caption ${
            project.status === 'completed' 
              ? 'bg-success/20 text-success border border-success/30' 
              : project.status === 'in-progress' ?'bg-warning/20 text-warning border border-warning/30' :'bg-primary/20 text-primary border border-primary/30'
          }`}>
            {project.status.replace('-', ' ').toUpperCase()}
          </div>
        )}
      </div>

      {/* Project Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-heading font-semibold text-lg text-text-primary group-hover:text-primary transition-colors duration-fast line-clamp-2">
            {project.title}
          </h3>
          {project.featured && (
            <Icon name="Star" size={16} className="text-accent flex-shrink-0 ml-2" />
          )}
        </div>

        <p className="text-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
          {project.description}
        </p>

        {/* Technology Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.slice(0, 4).map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-caption border border-primary/20"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="px-2 py-1 bg-text-secondary/10 text-text-secondary text-xs rounded-md font-caption">
              +{project.technologies.length - 4} more
            </span>
          )}
        </div>

        {/* Project Links */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-button flex items-center space-x-1 text-primary hover:text-secondary transition-colors duration-fast"
                onClick={(e) => e.stopPropagation()}
              >
                <Icon name="ExternalLink" size={14} />
                <span className="text-xs font-caption">Live</span>
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-button flex items-center space-x-1 text-text-secondary hover:text-primary transition-colors duration-fast"
                onClick={(e) => e.stopPropagation()}
              >
                <Icon name="Github" size={14} />
                <span className="text-xs font-caption">Code</span>
              </a>
            )}
          </div>

          <div className="text-xs text-text-secondary font-caption">
            {project.completedDate}
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-border-accent/20">
            <Button
              variant="ghost"
              size="xs"
              iconName="Edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              className="action-button text-warning hover:text-warning"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="xs"
              iconName="Trash2"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project);
              }}
              className="action-button text-error hover:text-error"
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-normal pointer-events-none"></div>
    </div>
  );
};

export default ProjectCard;