import { useState, useEffect, useRef } from "react";

const SearchModal = ({ isOpen, onClose, currentTheme }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Mock search data - in real app, this would come from API
  const searchableContent = [
    {
      type: "page",
      title: "Home",
      url: "/portfolio-home-hero",
      description: "Portfolio homepage with projects and skills",
    },
    {
      type: "page",
      title: "Projects",
      url: "/projects-portfolio-grid",
      description: "Browse all portfolio projects",
    },
    {
      type: "page",
      title: "Blog",
      url: "/blog-content-hub",
      description: "Read blog posts and articles",
    },
    {
      type: "page",
      title: "Admin Dashboard",
      url: "/admin-dashboard-content-management",
      description: "Content management and settings",
    },
    {
      type: "page",
      title: "Documentation",
      url: "/documentation",
      description: "API documentation and usage guides",
    },
    {
      type: "project",
      title: "E-commerce Platform",
      url: "/project/1",
      description: "Full-stack e-commerce solution with React and Node.js",
    },
    {
      type: "project",
      title: "Mobile App Design",
      url: "/project/2",
      description: "UI/UX design for iOS and Android application",
    },
    {
      type: "blog",
      title: "React Best Practices",
      url: "/blog/react-best-practices",
      description: "Essential tips for React development",
    },
    {
      type: "blog",
      title: "Web Performance Optimization",
      url: "/blog/web-performance",
      description: "Techniques to improve website speed",
    },
  ];

  const getThemeClasses = () => {
    switch (currentTheme) {
      case "light":
        return {
          modal: "bg-white border-gray-200",
          text: "text-gray-900",
          textSecondary: "text-gray-600",
          input:
            "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500",
          item: "hover:bg-gray-50",
          badge: {
            page: "bg-blue-100 text-blue-800",
            project: "bg-green-100 text-green-800",
            blog: "bg-purple-100 text-purple-800",
          },
        };
      case "dark":
        return {
          modal: "bg-gray-800 border-gray-600",
          text: "text-gray-100",
          textSecondary: "text-gray-400",
          input:
            "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400",
          item: "hover:bg-gray-700",
          badge: {
            page: "bg-blue-800 text-blue-200",
            project: "bg-green-800 text-green-200",
            blog: "bg-purple-800 text-purple-200",
          },
        };
      default: // cyberpunk, neural, futuristic
        return {
          modal: "bg-surface border-primary/20",
          text: "text-text-primary",
          textSecondary: "text-text-secondary",
          input:
            "bg-background border-primary/30 text-text-primary placeholder-text-secondary",
          item: "hover:bg-primary/10",
          badge: {
            page: "bg-primary/20 text-primary",
            project: "bg-secondary/20 text-secondary",
            blog: "bg-accent/20 text-accent",
          },
        };
    }
  };

  const themeClasses = getThemeClasses();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);

    // Simulate API delay
    const timeoutId = setTimeout(() => {
      const results = searchableContent
        .filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .slice(0, 8); // Limit to 8 results

      setSearchResults(results);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchableContent]);

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-2xl mx-4 ${themeClasses.modal} rounded-lg shadow-2xl border overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-current border-opacity-10">
          <div className="flex items-center gap-3">
            <Icon
              name="Search"
              size={20}
              className={themeClasses.textSecondary}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search pages, projects, and blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 bg-transparent border-none outline-none text-lg ${themeClasses.text} placeholder:${themeClasses.textSecondary}`}
            />
            <button
              onClick={handleClose}
              className={`p-1 rounded hover:bg-current hover:bg-opacity-10 ${themeClasses.textSecondary}`}
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center">
              <div
                className={`inline-flex items-center gap-2 ${themeClasses.textSecondary}`}
              >
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                Searching...
              </div>
            </div>
          )}

          {!loading && searchQuery && searchResults.length === 0 && (
            <div className="p-4 text-center">
              <Icon
                name="Search"
                size={32}
                className={themeClasses.textSecondary}
              />
              <p className={`mt-2 ${themeClasses.textSecondary}`}>
                No results found for "{searchQuery}"
              </p>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="p-2">
              {searchResults.map((result, index) => (
                <Link
                  key={index}
                  to={result.url}
                  onClick={handleClose}
                  className={`block p-3 rounded-lg ${themeClasses.item} transition-colors duration-fast`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Icon
                        name={
                          result.type === "page"
                            ? "FileText"
                            : result.type === "project"
                              ? "Folder"
                              : "BookOpen"
                        }
                        size={16}
                        className={themeClasses.textSecondary}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-medium ${themeClasses.text} truncate`}
                        >
                          {result.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${themeClasses.badge[result.type]}`}
                        >
                          {result.type}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${themeClasses.textSecondary} line-clamp-1`}
                      >
                        {result.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!searchQuery && (
            <div className="p-4">
              <p className={`text-sm ${themeClasses.textSecondary} mb-3`}>
                Popular searches:
              </p>
              <div className="flex flex-wrap gap-2">
                {["Projects", "Blog", "React", "Documentation", "Admin"].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className={`px-3 py-1 text-sm rounded-full border ${themeClasses.textSecondary} hover:${themeClasses.text} border-current border-opacity-20 hover:border-opacity-40 transition-colors duration-fast`}
                    >
                      {term}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-4 py-2 border-t border-current border-opacity-10 ${themeClasses.textSecondary} text-xs`}
        >
          <div className="flex items-center justify-between">
            <span>Press ESC to close</span>
            <span>↑↓ to navigate • ↵ to select</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
