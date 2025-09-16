import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ProjectForm = ({ project, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fullDescription: '',
    image: '',
    technologies: [],
    status: 'planning',
    featured: false,
    liveUrl: '',
    githubUrl: '',
    completedDate: '',
    duration: '',
    client: '',
    features: [],
    challenges: ''
  });

  const [techInput, setTechInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        technologies: project.technologies || [],
        features: project.features || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        fullDescription: '',
        image: '',
        technologies: [],
        status: 'planning',
        featured: false,
        liveUrl: '',
        githubUrl: '',
        completedDate: '',
        duration: '',
        client: '',
        features: [],
        challenges: ''
      });
    }
    setErrors({});
  }, [project, isOpen]);

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    }
    
    if (formData.technologies.length === 0) {
      newErrors.technologies = 'At least one technology is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const projectData = {
        ...formData,
        id: project?.id || Date.now().toString(),
        updatedAt: new Date().toISOString()
      };
      
      onSave(projectData);
      onClose();
    }
  };

  if (!isOpen) return null;

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
          <h2 className="font-heading font-bold text-xl text-text-primary">
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClose}
            className="text-text-secondary hover:text-primary"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Project Title *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter project title"
                className={errors.title ? 'border-error' : ''}
              />
              {errors.title && (
                <p className="text-error text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Image URL *
              </label>
              <Input
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={errors.image ? 'border-error' : ''}
              />
              {errors.image && (
                <p className="text-error text-xs mt-1">{errors.image}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Short Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description for project cards"
              rows={3}
              className={`w-full px-3 py-2 bg-background/50 border rounded-lg text-text-primary focus:border-primary/50 focus:outline-none transition-colors duration-fast resize-none ${
                errors.description ? 'border-error' : 'border-border-accent/30'
              }`}
            />
            {errors.description && (
              <p className="text-error text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Full Description
            </label>
            <textarea
              value={formData.fullDescription}
              onChange={(e) => handleInputChange('fullDescription', e.target.value)}
              placeholder="Detailed project description for modal view"
              rows={4}
              className="w-full px-3 py-2 bg-background/50 border border-border-accent/30 rounded-lg text-text-primary focus:border-primary/50 focus:outline-none transition-colors duration-fast resize-none"
            />
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Technologies *
            </label>
            <div className="flex space-x-2 mb-3">
              <Input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add technology"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                iconName="Plus"
                onClick={addTechnology}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="flex items-center space-x-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-md border border-primary/20"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => removeTechnology(tech)}
                    className="text-primary hover:text-error transition-colors duration-fast"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </span>
              ))}
            </div>
            {errors.technologies && (
              <p className="text-error text-xs mt-1">{errors.technologies}</p>
            )}
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-background/50 border border-border-accent/30 rounded-lg text-text-primary focus:border-primary/50 focus:outline-none transition-colors duration-fast"
              >
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Completed Date
              </label>
              <Input
                type="date"
                value={formData.completedDate}
                onChange={(e) => handleInputChange('completedDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Duration
              </label>
              <Input
                type="text"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 3 months"
              />
            </div>
          </div>

          {/* URLs and Client */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Live URL
              </label>
              <Input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => handleInputChange('liveUrl', e.target.value)}
                placeholder="https://project-demo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                GitHub URL
              </label>
              <Input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                placeholder="https://github.com/username/repo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Client
              </label>
              <Input
                type="text"
                value={formData.client}
                onChange={(e) => handleInputChange('client', e.target.value)}
                placeholder="Client name or 'Personal'"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Key Features
            </label>
            <div className="flex space-x-2 mb-3">
              <Input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Add key feature"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                iconName="Plus"
                onClick={addFeature}
              >
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-background/50 border border-border-accent/20 rounded-lg"
                >
                  <span className="text-text-primary text-sm">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(feature)}
                    className="text-text-secondary hover:text-error transition-colors duration-fast"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Technical Challenges
            </label>
            <textarea
              value={formData.challenges}
              onChange={(e) => handleInputChange('challenges', e.target.value)}
              placeholder="Describe technical challenges faced and how they were solved"
              rows={3}
              className="w-full px-3 py-2 bg-background/50 border border-border-accent/30 rounded-lg text-text-primary focus:border-primary/50 focus:outline-none transition-colors duration-fast resize-none"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
              className="w-4 h-4 text-primary bg-background border-border-accent/30 rounded focus:ring-primary/50"
            />
            <label htmlFor="featured" className="text-sm font-medium text-text-primary">
              Mark as featured project
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border-accent/20">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              iconName="Save"
            >
              {project ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;