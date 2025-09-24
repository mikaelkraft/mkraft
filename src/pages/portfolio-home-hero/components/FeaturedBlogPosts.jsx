import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import blogService from '../../../utils/blogService';

const FeaturedBlogPosts = ({ currentTheme }) => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedPosts = async () => {
      try {
        const res = await blogService.getFeaturedPosts();
        if (res.success) {
          setFeaturedPosts(res.data.slice(0, 3)); // Show only 3 featured posts
        }
      } catch (error) {
        console.error('Failed to load featured posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedPosts();
  }, []);

  const getThemeClasses = () => {
    switch(currentTheme) {
      case 'neural':
        return {
          bg: 'bg-gradient-to-br from-purple-900/10 to-blue-900/10',
          border: 'border-purple-500/20',
          text: 'text-purple-200',
          accent: 'text-purple-400',
          cardBg: 'bg-purple-900/20 border-purple-500/30'
        };
      case 'futuristic':
        return {
          bg: 'bg-gradient-to-br from-slate-900/10 to-blue-900/10',
          border: 'border-blue-400/20',
          text: 'text-blue-200',
          accent: 'text-blue-400',
          cardBg: 'bg-slate-900/20 border-blue-400/30'
        };
      case 'dark':
        return {
          bg: 'bg-gradient-to-br from-gray-900/10 to-blue-900/10',
          border: 'border-blue-500/20',
          text: 'text-blue-200',
          accent: 'text-blue-400',
          cardBg: 'bg-gray-900/20 border-blue-500/30'
        };
      case 'light':
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-blue-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          accent: 'text-blue-600',
          cardBg: 'bg-white border-gray-200 shadow-lg'
        };
      default: // cyberpunk
        return {
          bg: 'bg-gradient-to-br from-surface/10 to-primary/5',
          border: 'border-primary/20',
          text: 'text-text-primary',
          accent: 'text-primary',
          cardBg: 'bg-surface/20 border-primary/30'
        };
    }
  };

  const themeClasses = getThemeClasses();

  if (loading) {
    return (
      <section className={`py-20 ${themeClasses.bg} border-t ${themeClasses.border}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-surface/20 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-surface/10 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredPosts.length) {
    return (
      <section className={`py-20 ${themeClasses.bg} border-t ${themeClasses.border}`}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-heading font-bold ${themeClasses.text} mb-4`}>
              Featured Insights
            </h2>
            <p className={`text-lg ${themeClasses.text} opacity-80 max-w-2xl mx-auto`}>
              Latest thoughts on technology, development, and cybersecurity from the blog
            </p>
          </div>

          {/* No Featured Posts Message */}
          <div className="text-center py-12">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${themeClasses.cardBg} border flex items-center justify-center`}>
              <Icon name="BookOpen" size={32} className={themeClasses.accent} />
            </div>
            <h3 className={`font-heading font-semibold text-xl ${themeClasses.text} mb-4`}>
              No Featured Posts Yet
            </h3>
            <p className={`${themeClasses.text} opacity-70 mb-6 max-w-md mx-auto`}>
              Featured blog posts will appear here once you publish and feature blog posts in the admin dashboard.
            </p>
            <Link
              to="/blog-content-hub"
              className={`inline-flex items-center px-6 py-3 ${themeClasses.cardBg} border rounded-lg font-medium transition-all duration-fast hover:scale-105 hover-glow-primary group`}
            >
              <span className={themeClasses.text}>Visit Blog</span>
              <Icon
                name="ArrowRight"
                size={16}
                className={`ml-2 ${themeClasses.accent} group-hover:translate-x-1 transition-transform duration-fast`}
              />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-20 ${themeClasses.bg} border-t ${themeClasses.border}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-heading font-bold ${themeClasses.text} mb-4`}>
            Featured Insights
          </h2>
          <p className={`text-lg ${themeClasses.text} opacity-80 max-w-2xl mx-auto`}>
            Latest thoughts on technology, development, and cybersecurity from the blog
          </p>
        </div>

        {/* Featured Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog-content-hub/${post.slug}`}
              className={`group block ${themeClasses.cardBg} border rounded-lg overflow-hidden hover:border-opacity-50 transition-all duration-fast hover:scale-105 hover-glow-primary`}
            >
              {/* Post Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.featured_image || '/assets/images/blog-placeholder.jpg'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-slow"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"></div>
                
                {/* Category Badge */}
                {post.category && (
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-caption ${themeClasses.cardBg} backdrop-blur-sm`}>
                    {post.category}
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="p-6">
                <h3 className={`font-heading font-semibold text-lg ${themeClasses.text} group-hover:${themeClasses.accent} transition-colors duration-fast mb-3 line-clamp-2`}>
                  {post.title}
                </h3>

                <p className={`${themeClasses.text} opacity-70 text-sm mb-4 line-clamp-3`}>
                  {post.excerpt || post.content?.substring(0, 150) + '...'}
                </p>

                {/* Post Meta */}
                <div className={`flex items-center justify-between text-xs ${themeClasses.text} opacity-60`}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Icon name="Eye" size={12} />
                      <span>{post.view_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Heart" size={12} />
                      <span>{post.like_count || 0}</span>
                    </div>
                  </div>
                  <span>
                    {new Date(post.published_at || post.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {post.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className={`px-2 py-1 ${themeClasses.accent} bg-opacity-10 rounded-full text-xs font-caption border border-current border-opacity-20`}
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className={`px-2 py-1 ${themeClasses.text} opacity-50 text-xs`}>
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* View All Blog Posts Button */}
        <div className="text-center">
          <Link
            to="/blog-content-hub"
            className={`inline-flex items-center px-8 py-4 ${themeClasses.cardBg} border rounded-lg font-medium transition-all duration-fast hover:scale-105 hover-glow-primary group`}
          >
            <span className={themeClasses.text}>View All Blog Posts</span>
            <Icon
              name="ArrowRight"
              size={20}
              className={`ml-2 ${themeClasses.accent} group-hover:translate-x-1 transition-transform duration-fast`}
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBlogPosts;