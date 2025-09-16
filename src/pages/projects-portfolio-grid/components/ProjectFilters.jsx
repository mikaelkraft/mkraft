import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ProjectFilters = ({ 
  searchTerm, 
  onSearchChange, 
  selectedTechnology, 
  onTechnologyChange, 
  selectedStatus, 
  onStatusChange, 
  sortBy, 
  onSortChange, 
  onClearFilters,
  technologies,
  totalProjects,
  filteredCount 
}) => {
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'planning', label: 'Planning' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'featured', label: 'Featured First' }
  ];

  const hasActiveFilters = searchTerm || selectedTechnology || selectedStatus || sortBy !== 'newest';

  return (
    <div className="bg-surface/50 backdrop-blur-sm border border-border-accent/20 rounded-lg p-6 mb-8">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="Search" size={18} className="text-text-secondary" />
        </div>
        <Input
          type="search"
          placeholder="Search projects by title, description, or technology..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-3 w-full bg-background/50 border-border-accent/30 focus:border-primary/50 rounded-lg"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-primary transition-colors duration-fast"
          >
            <Icon name="X" size={18} />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Technology Filter */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Technology
          </label>
          <select
            value={selectedTechnology}
            onChange={(e) => onTechnologyChange(e.target.value)}
            className="w-full px-3 py-2 bg-background/50 border border-border-accent/30 rounded-lg text-text-primary focus:border-primary/50 focus:outline-none transition-colors duration-fast"
          >
            <option value="">All Technologies</option>
            {technologies.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 bg-background/50 border border-border-accent/30 rounded-lg text-text-primary focus:border-primary/50 focus:outline-none transition-colors duration-fast"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 bg-background/50 border border-border-accent/30 rounded-lg text-text-primary focus:border-primary/50 focus:outline-none transition-colors duration-fast"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <Button
            variant="outline"
            size="sm"
            iconName="RotateCcw"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-text-secondary font-caption">
          Showing {filteredCount} of {totalProjects} projects
          {hasActiveFilters && (
            <span className="text-primary ml-1">(filtered)</span>
          )}
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={14} className="text-primary" />
            <span className="text-primary text-xs font-caption">
              Active filters applied
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectFilters;