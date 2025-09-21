import React from 'react';
import BlogCard from './BlogCard';
import Icon from '../../../components/AppIcon';
import AdUnit from './AdUnit';
import CustomAdUnit from './CustomAdUnit';

const BlogGrid = ({ posts, onLike, onShare, onPostClick, isAdmin, onEdit, onDelete, loading, adsConfig }) => {
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

  const provider = adsConfig?.provider || 'adsense';
  const showManualAds = adsConfig?.enabled && (
    (provider === 'adsense' && adsConfig?.publisher_id && adsConfig?.ad_slot) ||
    (provider === 'yllix' && (adsConfig?.yllix_unit_code || adsConfig?.custom_ad_html)) ||
    (provider === 'custom' && (adsConfig?.custom_script_url || adsConfig?.custom_ad_html))
  );
  const interval = Math.max(1, Number(adsConfig?.grid_interval) || 6);

  const items = [];
  posts.forEach((post, idx) => {
    items.push(
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
    );

    if (showManualAds && (idx + 1) % interval === 0) {
      if (provider === 'adsense') {
        items.push(
          <AdUnit
            key={`ad-${post.id}-${idx}`}
            publisherId={adsConfig.publisher_id}
            slotId={adsConfig.ad_slot}
            className="col-span-1 md:col-span-2 lg:col-span-3"
          />
        );
      } else if (provider === 'yllix') {
        items.push(
          <CustomAdUnit
            key={`ad-${post.id}-${idx}`}
            scriptUrl={adsConfig.yllix_script_url}
            html={adsConfig.yllix_unit_code}
            className="col-span-1 md:col-span-2 lg:col-span-3"
          />
        );
      } else if (provider === 'custom') {
        items.push(
          <CustomAdUnit
            key={`ad-${post.id}-${idx}`}
            scriptUrl={adsConfig.custom_script_url}
            html={adsConfig.custom_ad_html}
            className="col-span-1 md:col-span-2 lg:col-span-3"
          />
        );
      }
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items}
    </div>
  );
};

export default BlogGrid;