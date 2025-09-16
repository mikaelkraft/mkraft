import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';

const SlidesManagement = ({ slides, onSlideUpdate, onSlideDelete, onSlideCreate, onSlideReorder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlides, setSelectedSlides] = useState([]);
  const [editingSlide, setEditingSlide] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedSlide, setDraggedSlide] = useState(null);

  const filteredSlides = slides
    .filter(slide => 
      slide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slide.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.order - b.order);

  const handleSelectSlide = (slideId) => {
    setSelectedSlides(prev => 
      prev.includes(slideId) 
        ? prev.filter(id => id !== slideId)
        : [...prev, slideId]
    );
  };

  const handleSelectAll = () => {
    setSelectedSlides(
      selectedSlides.length === filteredSlides.length 
        ? [] 
        : filteredSlides.map(s => s.id)
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedSlides.length} selected slides?`)) {
      selectedSlides.forEach(id => onSlideDelete(id));
      setSelectedSlides([]);
    }
  };

  const handleDragStart = (e, slide) => {
    setDraggedSlide(slide);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetSlide) => {
    e.preventDefault();
    if (draggedSlide && draggedSlide.id !== targetSlide.id) {
      onSlideReorder(draggedSlide.id, targetSlide.order);
    }
    setDraggedSlide(null);
  };

  const SlideCard = ({ slide }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, slide)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, slide)}
      className={`bg-surface rounded-lg border border-border-accent/20 overflow-hidden hover:shadow-glow-primary transition-all duration-fast cursor-move ${
        draggedSlide?.id === slide.id ? 'opacity-50' : ''
      }`}
    >
      {/* Slide Preview */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
        <Image 
          src={slide.backgroundImage} 
          alt={slide.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={selectedSlides.includes(slide.id)}
            onChange={() => handleSelectSlide(slide.id)}
            className="w-4 h-4 text-primary bg-surface border-border-accent rounded focus:ring-primary focus:ring-2"
          />
        </div>
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            slide.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
          }`}>
            {slide.status}
          </span>
          <div className="bg-background/80 rounded-full px-2 py-1 text-xs font-caption text-text-primary">
            #{slide.order}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-heading font-bold text-text-primary mb-1 truncate">
            {slide.title}
          </h3>
          <p className="text-sm text-text-secondary font-caption truncate">
            {slide.subtitle}
          </p>
        </div>
      </div>

      {/* Slide Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={14} className="text-text-secondary" />
            <span className="text-xs text-text-secondary font-caption">
              Duration: {slide.duration}s
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Eye" size={14} className="text-text-secondary" />
            <span className="text-xs text-text-secondary font-caption">
              {slide.views} views
            </span>
          </div>
        </div>

        {/* CTA Button Preview */}
        {slide.ctaText && (
          <div className="mb-3">
            <div className="text-xs text-text-secondary font-caption mb-1">Call to Action:</div>
            <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm">
              {slide.ctaText}
              <Icon name="ArrowRight" size={14} className="ml-1" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingSlide(slide)}
              iconName="Edit"
              className="p-2"
              title="Edit slide"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm('Delete this slide?')) {
                  onSlideDelete(slide.id);
                }
              }}
              iconName="Trash2"
              className="p-2 text-error hover:text-error"
              title="Delete slide"
            />
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="GripVertical" size={16} className="text-text-secondary" />
            <span className="text-xs text-text-secondary font-caption">Drag to reorder</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Hero Slides Management</h1>
          <p className="text-text-secondary font-caption mt-2">
            Manage carousel slides and hero section content
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          iconName="ImagePlus"
          iconPosition="left"
        >
          New Slide
        </Button>
      </div>

      {/* Controls */}
      <div className="bg-surface rounded-lg p-6 border border-border-accent/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Search slides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-text-secondary font-caption">
              <Icon name="Info" size={16} />
              <span>Drag slides to reorder carousel sequence</span>
            </div>
            {selectedSlides.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                iconName="Trash2"
                iconPosition="left"
              >
                Delete ({selectedSlides.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Slides Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedSlides.length === filteredSlides.length && filteredSlides.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-primary bg-surface border-border-accent rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-sm text-text-secondary font-caption">
              Select all ({filteredSlides.length} slides)
            </span>
          </div>
          <div className="text-sm text-text-secondary font-caption">
            {filteredSlides.filter(s => s.status === 'active').length} active slides
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlides.map((slide) => (
            <SlideCard key={slide.id} slide={slide} />
          ))}
        </div>

        {filteredSlides.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Image" size={48} className="text-text-secondary/50 mx-auto mb-4" />
            <div className="text-text-secondary font-caption">
              {searchTerm ? 'No slides match your search' : 'No slides found'}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg p-4 border border-border-accent/20">
          <div className="text-2xl font-heading font-bold text-primary">{slides.length}</div>
          <div className="text-sm text-text-secondary font-caption">Total Slides</div>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-accent/20">
          <div className="text-2xl font-heading font-bold text-success">
            {slides.filter(s => s.status === 'active').length}
          </div>
          <div className="text-sm text-text-secondary font-caption">Active</div>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-accent/20">
          <div className="text-2xl font-heading font-bold text-warning">
            {slides.filter(s => s.status === 'inactive').length}
          </div>
          <div className="text-sm text-text-secondary font-caption">Inactive</div>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-accent/20">
          <div className="text-2xl font-heading font-bold text-text-primary">
            {slides.reduce((sum, slide) => sum + slide.views, 0).toLocaleString()}
          </div>
          <div className="text-sm text-text-secondary font-caption">Total Views</div>
        </div>
      </div>

      {/* Carousel Preview */}
      <div className="bg-surface rounded-lg p-6 border border-border-accent/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold text-text-primary">Carousel Preview</h3>
          <Button
            variant="outline"
            size="sm"
            iconName="Play"
            iconPosition="left"
          >
            Preview Carousel
          </Button>
        </div>
        <div className="h-32 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Icon name="Play" size={32} className="text-text-secondary/50 mx-auto mb-2" />
            <div className="text-sm text-text-secondary font-caption">
              Click "Preview Carousel" to see slides in action
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidesManagement;