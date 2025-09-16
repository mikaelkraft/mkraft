import React from 'react';
import BlogCard from './BlogCard';
import Icon from '../../../components/AppIcon';

const BlogGrid = ({ posts, onLike, onShare, onPostClick, isAdmin, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index} 
            className="bg-surface border border-border-accent/20 rounded-lg overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-border-accent/20"></div>
            <div className="p-6">
              <div className="h-4 bg-border-accent/20 rounded mb-3"></div>
              <div className="h-4 bg-border-accent/20 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-border-accent/20 rounded w-1/2 mb-4"></div>
              <div className="flex space-x-2 mb-4">
                <div className="h-6 bg-border-accent/20 rounded w-16"></div>
                <div className="h-6 bg-border-accent/20 rounded w-20"></div>
              </div>
              <div className="flex justify-between">
                <div className="flex space-x-4">
                  <div className="h-4 bg-border-accent/20 rounded w-8"></div>
                  <div className="h-4 bg-border-accent/20 rounded w-8"></div>
                  <div className="h-4 bg-border-accent/20 rounded w-8"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-border-accent/20 rounded w-6"></div>
                  <div className="h-6 bg-border-accent/20 rounded w-6"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16">
        <Icon name="FileText" size={48} className="mx-auto mb-4 text-text-secondary" />
        <h3 className="font-heading font-semibold text-xl text-text-primary mb-2">
          No blog posts found
        </h3>
        <p className="text-text-secondary">
          There are no blog posts to display at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <BlogCard
          key={post.id}
          post={post}
          onLike={onLike}
          onShare={onShare}
          onPostClick={onPostClick}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BlogGrid;