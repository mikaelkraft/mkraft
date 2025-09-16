import React from 'react';

import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const BlogCard = ({ post, onLike, onShare, onPostClick, isAdmin, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(post.id);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(post);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(post);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(post.id);
  };

  const handleCardClick = () => {
    onPostClick?.(post);
  };

  // Prepare display data with fallbacks
  const displayData = {
    title: post?.title || 'Untitled Post',
    excerpt: post?.excerpt || 'No excerpt available',
    category: post?.category || 'Uncategorized',
    tags: post?.tags || [],
    featuredImage: post?.featured_image || post?.featuredImage,
    publishDate: post?.published_at || post?.publishDate || post?.created_at,
    author: post?.author?.full_name || post?.author || 'Unknown Author',
    readTime: post?.read_time || 5,
    likes: post?.like_count || 0,
    comments: post?.comment_count || 0,
    views: post?.view_count || 0,
    status: post?.status || 'draft'
  };

  return (
    <article 
      className="group relative bg-surface border border-border-accent/20 rounded-lg overflow-hidden hover:border-primary/40 transition-all duration-normal hover-glow-primary cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Featured Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={displayData.featuredImage}
          alt={displayData.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-caption rounded-md backdrop-blur-sm">
            {displayData.category}
          </span>
        </div>

        {/* Status Badge (Admin only) */}
        {isAdmin && displayData.status !== 'published' && (
          <div className="absolute top-3 left-3 mt-8">
            <span className={`px-2 py-1 text-xs font-caption rounded-md backdrop-blur-sm ${
              displayData.status === 'draft' ?'bg-yellow-500/20 text-yellow-400' :'bg-gray-500/20 text-gray-400'
            }`}>
              {displayData.status}
            </span>
          </div>
        )}

        {/* Admin Controls */}
        {isAdmin && (
          <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-fast">
            <Button
              variant="ghost"
              size="xs"
              iconName="Edit"
              onClick={handleEdit}
              className="bg-background/80 backdrop-blur-sm hover:bg-primary/20"
              title="Edit post"
            />
            <Button
              variant="ghost"
              size="xs"
              iconName="Trash2"
              onClick={handleDelete}
              className="bg-background/80 backdrop-blur-sm hover:bg-error/20 text-error"
              title="Delete post"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="font-heading font-semibold text-lg text-text-primary mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-fast">
          {displayData.title}
        </h3>

        {/* Excerpt */}
        <p className="text-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
          {displayData.excerpt}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-text-secondary font-caption mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={14} />
              <span>{formatDate(displayData.publishDate)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="User" size={14} />
              <span>{displayData.author}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Clock" size={14} />
            <span>{displayData.readTime} min read</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {displayData.tags?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-md"
            >
              #{tag}
            </span>
          ))}
          {displayData.tags?.length > 3 && (
            <span className="px-2 py-1 bg-text-secondary/10 text-text-secondary text-xs rounded-md">
              +{displayData.tags.length - 3}
            </span>
          )}
        </div>

        {/* Engagement Stats & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border-accent/20">
          <div className="flex items-center space-x-4 text-xs text-text-secondary">
            <div className="flex items-center space-x-1">
              <Icon name="Heart" size={14} />
              <span>{displayData.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="MessageCircle" size={14} />
              <span>{displayData.comments}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Eye" size={14} />
              <span>{displayData.views}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="xs"
              iconName="Heart"
              onClick={handleLike}
              className="text-text-secondary hover:text-error transition-colors duration-fast"
              title="Like post"
            />
            <Button
              variant="ghost"
              size="xs"
              iconName="Share2"
              onClick={handleShare}
              className="text-text-secondary hover:text-primary transition-colors duration-fast"
              title="Share post"
            />
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-fast pointer-events-none"></div>
    </article>
  );
};

export default BlogCard;