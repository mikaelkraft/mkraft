import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';

const ProjectsManagement = ({ projects, onProjectUpdate, onProjectDelete, onProjectCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredProjects = projects
    .filter(project => 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') return (new Date(a.date) - new Date(b.date)) * modifier;
      if (sortBy === 'title') return a.title.localeCompare(b.title) * modifier;
      if (sortBy === 'status') return a.status.localeCompare(b.status) * modifier;
      return 0;
    });

  const handleSelectProject = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProjects(
      selectedProjects.length === filteredProjects.length 
        ? [] 
        : filteredProjects.map(p => p.id)
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedProjects.length} selected projects?`)) {
      selectedProjects.forEach(id => onProjectDelete(id));
      setSelectedProjects([]);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const ProjectRow = ({ project }) => (
    <tr className="border-b border-border-accent/10 hover:bg-primary/5 transition-colors duration-fast">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={selectedProjects.includes(project.id)}
          onChange={() => handleSelectProject(project.id)}
          className="w-4 h-4 text-primary bg-surface border-border-accent rounded focus:ring-primary focus:ring-2"
        />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface">
            <Image 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-medium text-text-primary">{project.title}</div>
            <div className="text-sm text-text-secondary font-caption truncate max-w-xs">
              {project.description}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1">
          {project.technologies.slice(0, 3).map((tech, index) => (
            <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-caption">
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="px-2 py-1 bg-surface text-text-secondary text-xs rounded-full font-caption">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          project.status === 'published' ? 'bg-success/10 text-success' :
          project.status === 'draft'? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
        }`}>
          {project.status}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-text-secondary font-caption">
        {new Date(project.date).toLocaleDateString()}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingProject(project)}
            iconName="Edit"
            className="p-2"
            title="Edit project"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm('Delete this project?')) {
                onProjectDelete(project.id);
              }
            }}
            iconName="Trash2"
            className="p-2 text-error hover:text-error"
            title="Delete project"
          />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Projects Management</h1>
          <p className="text-text-secondary font-caption mt-2">
            Manage your portfolio projects and showcase content
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          iconName="Plus"
          iconPosition="left"
        >
          New Project
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-surface rounded-lg p-6 border border-border-accent/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary font-caption">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface border border-border-accent/20 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                iconName={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'}
                className="p-2"
              />
            </div>
            {selectedProjects.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                iconName="Trash2"
                iconPosition="left"
              >
                Delete ({selectedProjects.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-surface rounded-lg border border-border-accent/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/5 border-b border-border-accent/20">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary bg-surface border-border-accent rounded focus:ring-primary focus:ring-2"
                  />
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center space-x-2 text-sm font-heading font-semibold text-text-primary hover:text-primary transition-colors duration-fast"
                  >
                    <span>Project</span>
                    <Icon name="ArrowUpDown" size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-sm font-heading font-semibold text-text-primary">
                  Technologies
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-2 text-sm font-heading font-semibold text-text-primary hover:text-primary transition-colors duration-fast"
                  >
                    <span>Status</span>
                    <Icon name="ArrowUpDown" size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center space-x-2 text-sm font-heading font-semibold text-text-primary hover:text-primary transition-colors duration-fast"
                  >
                    <span>Date</span>
                    <Icon name="ArrowUpDown" size={14} />
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-sm font-heading font-semibold text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Icon name="FolderOpen" size={48} className="text-text-secondary/50 mx-auto mb-4" />
            <div className="text-text-secondary font-caption">
              {searchTerm ? 'No projects match your search' : 'No projects found'}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg p-4 border border-border-accent/20">
          <div className="text-2xl font-heading font-bold text-primary">{projects.length}</div>
          <div className="text-sm text-text-secondary font-caption">Total Projects</div>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-accent/20">
          <div className="text-2xl font-heading font-bold text-success">
            {projects.filter(p => p.status === 'published').length}
          </div>
          <div className="text-sm text-text-secondary font-caption">Published</div>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-accent/20">
          <div className="text-2xl font-heading font-bold text-warning">
            {projects.filter(p => p.status === 'draft').length}
          </div>
          <div className="text-sm text-text-secondary font-caption">Drafts</div>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-accent/20">
          <div className="text-2xl font-heading font-bold text-text-primary">{filteredProjects.length}</div>
          <div className="text-sm text-text-secondary font-caption">Filtered Results</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsManagement;