import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';
import SearchModal from './SearchModal';
import useFeature from 'hooks/useFeature';
import { useNavigate } from 'react-router-dom';

const HeaderNavigation = ({ isAuthenticated = false, onAuthToggle, onThemeControlsToggle, currentTheme = 'cyberpunk' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const searchEnabled = useFeature('full_text_search', true);
  const [searchVal, setSearchVal] = useState('');
  const searchDebounceRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, signOut } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  const isDevAdmin = typeof window !== 'undefined' && window.localStorage.getItem('dev_admin') === 'true';
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Home',
      path: '/portfolio-home-hero',
      icon: 'Home',
      tooltip: 'Portfolio home and hero showcase'
    },
    {
      label: 'Projects',
      path: '/projects-portfolio-grid',
      icon: 'FolderOpen',
      tooltip: 'Browse project portfolio'
    },
    {
      label: 'Blog',
      path: '/blog-content-hub',
      icon: 'BookOpen',
      tooltip: 'Read latest blog posts'
    },
    {
      label: 'Dashboard',
      path: '/admin-dashboard-content-management',
      icon: 'Settings',
      tooltip: 'Admin content management',
      adminOnly: true
    }
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const filteredNavItems = navigationItems; // always show

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border-accent/20">
        <nav className="max-w-9xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link 
              to="/portfolio-home-hero" 
              className="flex items-center space-x-3 group"
              aria-label="WisdomInTech Portfolio Home"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gray-800 border border-gray-300 rounded-lg flex items-center justify-center group-hover:shadow-glow-primary transition-all duration-fast">
                  <Icon name="Code" size={20} className="text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-fast -z-10"></div>
              </div>
              <div className="hidden sm:block">
                <span className="font-heading font-bold text-lg text-primary group-hover:text-secondary transition-colors duration-fast">
                  WisdomInTech
                </span>
                <div className="text-xs text-text-secondary font-caption">
                  Portfolio
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => {
                    if (item.adminOnly && !isAdmin) {
                      e.preventDefault();
                      setAuthModalOpen(true);
                    }
                  }}
                  className={`
                    relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-fast
                    flex items-center space-x-2 min-h-[44px]
                    ${isActivePath(item.path)
                      ? 'text-primary bg-primary/10 shadow-glow-primary'
                      : 'text-text-secondary hover:text-primary hover:bg-primary/5'
                    }
                  `}
                  title={item.tooltip}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                  {isActivePath(item.path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Search, Auth Toggle and Theme Controls */}
            <div className="hidden lg:flex items-center space-x-4">
              {searchEnabled && (
                <div className="relative group">
                  <input
                    type="text"
                    value={searchVal}
                    onChange={(e) => {
                      const v = e.target.value; setSearchVal(v); clearTimeout(searchDebounceRef.current); searchDebounceRef.current = setTimeout(()=>{ if (v.trim().length>1) navigate(`/search?q=${encodeURIComponent(v.trim())}`); }, 300);
                    }}
                    placeholder="Search posts…"
                    className="w-56 px-3 py-2 rounded-lg bg-background/60 border border-border-accent/30 focus:border-primary focus:outline-none text-sm placeholder-text-secondary/50 transition"
                    aria-label="Search posts"
                  />
                  <Icon name="Search" size={14} className="absolute top-1/2 -translate-y-1/2 right-2 text-text-secondary/60" />
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchModalOpen(true)}
                iconName="Search"
                className="p-2"
                title="Search portfolio"
              />
              {onThemeControlsToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onThemeControlsToggle}
                  iconName="Palette"
                  className="p-2"
                  title="Open theme controls"
                />
              )}
              {isAdmin ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={signOut}
                  iconName="LogOut"
                  iconPosition="left"
                  className="min-w-[100px]"
                >
                  Logout
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAuthModalOpen(true)}
                  iconName="LogIn"
                  iconPosition="left"
                  className="min-w-[120px]"
                >
                  Admin Login
                </Button>
              )}
              {isDevAdmin && (
                <span className="ml-2 text-xs px-2 py-1 rounded-full border border-yellow-400/40 text-yellow-300 bg-yellow-500/10">
                  Dev OTP
                </span>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchModalOpen(true)}
                iconName="Search"
                className="p-2"
                title="Search portfolio"
              />
              {onThemeControlsToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onThemeControlsToggle}
                  iconName="Palette"
                  className="p-2"
                  title="Open theme controls"
                />
              )}
              {isAdmin ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={signOut}
                  iconName="LogOut"
                  className="p-2"
                  title="Logout"
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthModalOpen(true)}
                  iconName="LogIn"
                  className="p-2"
                  title="Admin Login"
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                iconName={isMobileMenuOpen ? "X" : "Menu"}
                className="p-2"
                title="Toggle navigation menu"
              />
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={closeMobileMenu}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      <div className={`
        fixed top-16 right-0 bottom-0 z-50 w-80 max-w-[85vw] bg-surface border-l border-border-accent/20
        transform transition-transform duration-normal lg:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="px-6 space-y-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => {
                    if (item.adminOnly && !isAdmin) {
                      e.preventDefault();
                      setAuthModalOpen(true);
                      return;
                    }
                    closeMobileMenu();
                  }}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg font-medium
                    transition-all duration-fast min-h-[48px]
                    ${isActivePath(item.path)
                      ? 'text-primary bg-primary/10 shadow-glow-primary'
                      : 'text-text-secondary hover:text-primary hover:bg-primary/5'
                    }
                  `}
                >
                  <Icon name={item.icon} size={20} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-text-secondary font-caption">
                      {item.tooltip}
                    </div>
                  </div>
                  {isActivePath(item.path) && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile Menu Footer */}
          <div className="border-t border-border-accent/20 p-6">
            <div className="text-center">
              <div className="text-sm text-text-secondary font-caption">
                WisdomInTech
              </div>
              <div className="text-xs text-text-secondary/60 mt-1">
                Neo-Cyberpunk Experience
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
        currentTheme={currentTheme}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode="login" />

      {/* Floating Admin badge */}
      {!isAdmin && (
        <button
          onClick={() => setAuthModalOpen(true)}
          className="fixed bottom-6 left-6 z-50 px-3 py-1.5 rounded-full bg-surface border border-border-accent/40 text-xs text-text-secondary hover:text-text-primary hover:border-primary/60 shadow backdrop-blur-sm"
          title="Admin? Click to login"
        >
          Admin?
        </button>
      )}
    </>
  );
};

export default HeaderNavigation;