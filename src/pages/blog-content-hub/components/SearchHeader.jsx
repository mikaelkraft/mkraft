import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SearchHeader = ({ 
  onSearch, 
  onSort, 
  searchQuery, 
  sortBy, 
  totalPosts, 
  onRefresh, 
  loading 
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLocalSearchQuery(searchQuery || '');
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearchQuery);
    if (window.innerWidth < 768) {
      setIsSearchOpen(false);
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    onSearch('');
    setIsSearchOpen(false);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: 'CalendarDays' },
    { value: 'oldest', label: 'Oldest First', icon: 'Calendar' },
    { value: 'most-liked', label: 'Most Liked', icon: 'Heart' },
    { value: 'most-commented', label: 'Most Discussed', icon: 'MessageCircle' },
    { value: 'relevance', label: 'Most Relevant', icon: 'TrendingUp' }
  ];

  const currentSort = sortOptions.find(option => option.value === sortBy) || sortOptions[0];

  return (
    <div className="bg-surface border-b border-border-accent/20 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left Section - Title and Stats */}
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="font-heading font-bold text-2xl text-text-primary">
                Blog Hub
              </h1>
              <p className="text-text-secondary text-sm font-caption">
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <Icon name="Loader2" size={14} className="animate-spin" />
                    <span>Loading posts...</span>
                  </span>
                ) : (
                  <>
                    {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} available
                    {searchQuery && (
                      <span className="ml-2 text-primary">
                        • Filtered by "{searchQuery}"
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Section - Search and Controls */}
          <div className="flex items-center space-x-3">
            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="sm"
              iconName="RefreshCw"
              onClick={onRefresh}
              disabled={loading}
              className={`text-text-secondary hover:text-primary ${loading ? 'animate-spin' : ''}`}
              title="Refresh posts"
            />

            {/* Desktop Search */}
            <div className="hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  type="text"
                  placeholder="Search posts, tags, categories..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="w-80 pl-10 pr-10"
                />
                <Icon 
                  name="Search" 
                  size={18} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
                />
                {localSearchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    iconName="X"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary"
                  />
                )}
              </form>
            </div>

            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="sm"
              iconName="Search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`md:hidden ${isSearchOpen ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
              title="Toggle search"
            />

            {/* Sort Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                iconName={currentSort.icon}
                iconPosition="left"
                onClick={() => setShowFilters(!showFilters)}
                className="text-text-secondary hover:text-primary hidden sm:flex"
                title="Sort options"
              >
                {currentSort.label}
                <Icon name="ChevronDown" size={16} className="ml-1" />
              </Button>

              {/* Mobile Sort Button */}
              <Button
                variant="ghost"
                size="sm"
                iconName={currentSort.icon}
                onClick={() => setShowFilters(!showFilters)}
                className="text-text-secondary hover:text-primary sm:hidden"
                title="Sort options"
              />

              {/* Sort Dropdown Menu */}
              {showFilters && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border-accent/20 rounded-lg shadow-lg z-40">
                  <div className="py-2">
                    <div className="px-3 py-2 text-xs font-medium text-text-secondary uppercase tracking-wide border-b border-border-accent/20">
                      Sort by
                    </div>
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          onSort(option.value);
                          setShowFilters(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors duration-fast ${
                          sortBy === option.value
                            ? 'bg-primary/10 text-primary' :'text-text-primary hover:bg-accent/10 hover:text-accent'
                        }`}
                      >
                        <Icon name={option.icon} size={16} />
                        <span>{option.label}</span>
                        {sortBy === option.value && (
                          <Icon name="Check" size={14} className="ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filters Toggle (Mobile) */}
            <Button
              variant="ghost"
              size="sm"
              iconName="Filter"
              onClick={() => setShowFilters(!showFilters)}
              className="text-text-secondary hover:text-primary md:hidden"
              title="Filter options"
            />
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="text"
                placeholder="Search posts, tags, categories..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10"
                autoFocus
              />
              <Icon 
                name="Search" 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
              />
              {localSearchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  iconName="X"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary"
                />
              )}
            </form>
          </div>
        )}

        {/* Active Filters Display */}
        {(searchQuery || sortBy !== 'newest') && (
          <div className="pb-4">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs text-text-secondary font-medium">Active filters:</span>
              
              {searchQuery && (
                <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                  <Icon name="Search" size={12} />
                  <span>"{searchQuery}"</span>
                  <Button
                    variant="ghost"
                    size="xs"
                    iconName="X"
                    onClick={() => onSearch('')}
                    className="text-primary hover:text-primary/80"
                  />
                </div>
              )}

              {sortBy !== 'newest' && (
                <div className="flex items-center space-x-1 bg-accent/10 text-accent px-2 py-1 rounded-md text-xs">
                  <Icon name={currentSort.icon} size={12} />
                  <span>{currentSort.label}</span>
                  <Button
                    variant="ghost"
                    size="xs"
                    iconName="X"
                    onClick={() => onSort('newest')}
                    className="text-accent hover:text-accent/80"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close filters */}
      {showFilters && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowFilters(false)}
        ></div>
      )}
    </div>
  );
};

export default SearchHeader;