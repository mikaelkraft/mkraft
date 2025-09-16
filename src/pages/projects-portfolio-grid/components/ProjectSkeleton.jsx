import React from 'react';

const ProjectSkeleton = () => {
  return (
    <div className="bg-surface border border-border-accent/20 rounded-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 bg-background/50"></div>
      
      {/* Content Skeleton */}
      <div className="p-6">
        {/* Title and Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="h-6 bg-background/50 rounded w-3/4"></div>
          <div className="h-4 bg-background/50 rounded w-16"></div>
        </div>
        
        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-background/50 rounded w-full"></div>
          <div className="h-4 bg-background/50 rounded w-5/6"></div>
          <div className="h-4 bg-background/50 rounded w-2/3"></div>
        </div>
        
        {/* Technology Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 bg-background/50 rounded w-16"></div>
          <div className="h-6 bg-background/50 rounded w-20"></div>
          <div className="h-6 bg-background/50 rounded w-14"></div>
          <div className="h-6 bg-background/50 rounded w-18"></div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-4 bg-background/50 rounded w-12"></div>
            <div className="h-4 bg-background/50 rounded w-12"></div>
          </div>
          <div className="h-4 bg-background/50 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSkeleton;