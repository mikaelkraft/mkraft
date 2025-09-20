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

  const Modal = ({ title, onClose, onSubmit, submitText = 'Save', children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-border-accent/20 rounded-lg shadow-glow-primary w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-border-accent/20 flex items-center justify-between">
          <h3 className="text-lg font-heading font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-primary">✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {children}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">{submitText}</Button>
          </div>
        </form>
      </div>
    </div>
  );

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    image: '',
    technologies: '',
    status: 'draft',
    github_url: '',
    live_url: '',
  });

  const [editForm, setEditForm] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const isValidUrl = (v = '') => !v || /^https?:\/\//i.test(v);
  const validateProject = (data = {}) => {
    const errs = {};
    if (!data.title?.trim()) errs.title = 'Title is required';
    if (!isValidUrl(data.image)) errs.image = 'Image must be a valid URL';
    if (!isValidUrl(data.github_url)) errs.github_url = 'GitHub URL must be valid';
    if (!isValidUrl(data.live_url)) errs.live_url = 'Live URL must be valid';
    return errs;
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setEditForm({
      title: project.title || '',
      description: project.description || '',
      image: project.image || '',
      technologies: (project.technologies || []).join(', '),
      status: project.status || 'draft',
      github_url: project.github_url || '',
      live_url: project.live_url || '',
    });
  };

  const submitCreate = (e) => {
    e.preventDefault();
    const errs = validateProject(createForm);
    setFormErrors(errs);
    if (Object.keys(errs).length) return;
    const technologies = (createForm.technologies || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onProjectCreate({
      title: createForm.title,
      description: createForm.description,
      image: createForm.image,
      technologies,
      status: createForm.status,
      github_url: createForm.github_url || undefined,
      live_url: createForm.live_url || undefined,
      date: new Date().toISOString(),
    });
    setShowCreateModal(false);
    setCreateForm({ title: '', description: '', image: '', technologies: '', status: 'draft', github_url: '', live_url: '' });
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!editingProject) return;
    const errs = validateProject(editForm);
    setFormErrors(errs);
    if (Object.keys(errs).length) return;
    const technologies = (editForm.technologies || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onProjectUpdate(editingProject.id, {
      title: editForm.title,
      description: editForm.description,
      image: editForm.image,
      technologies,
      status: editForm.status,
      github_url: editForm.github_url || undefined,
      live_url: editForm.live_url || undefined,
    });
    setEditingProject(null);
  };

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
            onClick={() => openEdit(project)}
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

      {/* Create Modal */}
      {showCreateModal && (
        <Modal title="Create Project" onClose={() => setShowCreateModal(false)} onSubmit={submitCreate} submitText="Create">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Title</label>
              <Input value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} required />
              {formErrors.title && <p className="mt-1 text-xs text-error">{formErrors.title}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Status</label>
              <select className="w-full bg-surface border border-border-accent/20 rounded-lg px-3 py-2 text-sm" value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Description</label>
              <textarea className="w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg" rows={4} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Image URL</label>
              <Input type="url" value={createForm.image} onChange={(e) => setCreateForm({ ...createForm, image: e.target.value })} />
              {formErrors.image && <p className="mt-1 text-xs text-error">{formErrors.image}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Technologies (comma-separated)</label>
              <Input value={createForm.technologies} onChange={(e) => setCreateForm({ ...createForm, technologies: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">GitHub URL</label>
              <Input type="url" value={createForm.github_url} onChange={(e) => setCreateForm({ ...createForm, github_url: e.target.value })} />
              {formErrors.github_url && <p className="mt-1 text-xs text-error">{formErrors.github_url}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Live URL</label>
              <Input type="url" value={createForm.live_url} onChange={(e) => setCreateForm({ ...createForm, live_url: e.target.value })} />
              {formErrors.live_url && <p className="mt-1 text-xs text-error">{formErrors.live_url}</p>}
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingProject && (
        <Modal title="Edit Project" onClose={() => setEditingProject(null)} onSubmit={submitEdit} submitText="Update">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Title</label>
              <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
              {formErrors.title && <p className="mt-1 text-xs text-error">{formErrors.title}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Status</label>
              <select className="w-full bg-surface border border-border-accent/20 rounded-lg px-3 py-2 text-sm" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Description</label>
              <textarea className="w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg" rows={4} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Image URL</label>
              <Input type="url" value={editForm.image} onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} />
              {formErrors.image && <p className="mt-1 text-xs text-error">{formErrors.image}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Technologies (comma-separated)</label>
              <Input value={editForm.technologies} onChange={(e) => setEditForm({ ...editForm, technologies: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">GitHub URL</label>
              <Input type="url" value={editForm.github_url} onChange={(e) => setEditForm({ ...editForm, github_url: e.target.value })} />
              {formErrors.github_url && <p className="mt-1 text-xs text-error">{formErrors.github_url}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Live URL</label>
              <Input type="url" value={editForm.live_url} onChange={(e) => setEditForm({ ...editForm, live_url: e.target.value })} />
              {formErrors.live_url && <p className="mt-1 text-xs text-error">{formErrors.live_url}</p>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectsManagement;