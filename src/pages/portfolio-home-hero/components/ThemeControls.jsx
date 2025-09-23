import React, { useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ThemeControls = ({ isOpen, onClose, currentTheme, onThemeChange, fontSize, onFontSizeChange }) => {
  const themes = [
    {
      id: 'cyberpunk',
      name: 'Cyberpunk', 
      icon: 'Zap',
      description: 'Neon-lit digital future',
      colors: ['#00FFFF', '#FF0080', '#39FF14']
    },
    {
      id: 'dark',
      name: 'Dark',
      icon: 'Moon',
      description: 'Classic dark mode',
      colors: ['#3B82F6', '#1E40AF', '#60A5FA']
    },
    {
      id: 'neural',
      name: 'Neural',
      icon: 'Brain',
      description: 'Brain-inspired patterns',
      colors: ['#8B5CF6', '#A855F7', '#C084FC']
    },
    {
      id: 'futuristic',
      name: 'Futuristic',
      icon: 'Rocket',
      description: 'Sleek metallic elements',
      colors: ['#0EA5E9', '#0284C7', '#38BDF8']
    },
    {
      id: 'light',
      name: 'Light',
      icon: 'Sun',
      description: 'Clean professional look',
      colors: ['#1F2937', '#374151', '#3B82F6']
    }
  ];

  const fontSizes = [
    { id: 'small', name: 'Small', value: '14px' },
    { id: 'medium', name: 'Medium', value: '16px' },
    { id: 'large', name: 'Large', value: '18px' },
    { id: 'xlarge', name: 'X-Large', value: '20px' }
  ];

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleThemeChange = (themeId) => {
    onThemeChange(themeId);
    // Auto-close modal after theme selection
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleFontSizeChange = (sizeId) => {
    onFontSizeChange(sizeId);
    // Auto-close modal after font size selection
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getThemeClasses = () => {
    switch(currentTheme) {
      case 'dark':
        return {
          panel: 'bg-gray-900/20 border-gray-700/30',
          text: 'text-gray-100',
          secondary: 'text-gray-300',
          accent: 'text-gray-400',
          button: 'bg-gray-900/30 hover:bg-gray-900/50 border-gray-700/30'
        };
      case 'neural':
        return {
          panel: 'bg-purple-900/20 border-purple-500/30',
          text: 'text-purple-100',
          secondary: 'text-purple-300',
          accent: 'text-purple-400',
          button: 'bg-purple-900/30 hover:bg-purple-900/50 border-purple-500/30'
        };
      case 'futuristic':
        return {
          panel: 'bg-slate-900/20 border-blue-400/30',
          text: 'text-blue-100',
          secondary: 'text-blue-300',
          accent: 'text-blue-400',
          button: 'bg-slate-900/30 hover:bg-slate-900/50 border-blue-400/30'
        };
      case 'light':
        return {
          panel: 'bg-white border-gray-200 shadow-lg',
          text: 'text-gray-900',
          secondary: 'text-gray-600',
          accent: 'text-blue-600',
          button: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
        };
      default: // cyberpunk
        return {
          panel: 'bg-surface/30 border-primary/30 glow-primary',
          text: 'text-text-primary',
          secondary: 'text-text-secondary',
          accent: 'text-primary',
          button: 'bg-surface/30 hover:bg-surface/50 border-primary/30'
        };
    }
  };

  const themeClasses = getThemeClasses();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-surface/95 backdrop-blur-md rounded-xl border-2 border-border-accent/20 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-accent/20">
            <h2 className="font-heading font-bold text-xl text-text-primary flex items-center space-x-2">
              <Icon name="Palette" size={24} className="text-primary" />
              <span>Theme Controls</span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={onClose}
              className="text-text-secondary hover:text-primary p-2"
              title="Close theme controls"
            />
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Theme Selector */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="Palette" size={18} className={themeClasses.accent} />
                <span className={`font-medium text-sm ${themeClasses.text}`}>
                  Theme Selection
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {/* Horizontal scroll wrapper for mobile */}
                <div className="col-span-2 md:col-span-3 -mx-2 overflow-x-auto hide-scrollbar">
                  <div className="px-2 inline-flex gap-3 md:grid md:grid-cols-3 md:gap-3 w-max md:w-auto">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id)}
                        className={`
                          ${themeClasses.button} rounded-lg border p-4 transition-all duration-fast
                          ${currentTheme === theme.id 
                            ? (currentTheme === 'light' ? 'ring-2 ring-blue-500' : 'ring-2 ring-primary') 
                            : ''
                          }
                          hover:scale-105 group min-h-[80px] min-w-[140px]
                        `}
                        title={theme.description}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className="flex items-center space-x-1">
                            <Icon 
                              name={theme.icon} 
                              size={20} 
                              className={currentTheme === theme.id ? themeClasses.accent : themeClasses.secondary} 
                            />
                          </div>
                          <span className={`text-sm font-medium ${currentTheme === theme.id ? themeClasses.text : themeClasses.secondary}`}>
                            {theme.name}
                          </span>
                          <div className="flex space-x-1">
                            {theme.colors.map((color, index) => (
                              <div
                                key={index}
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Font Size Selector */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="Type" size={18} className={themeClasses.accent} />
                <span className={`font-medium text-sm ${themeClasses.text}`}>
                  Font Size
                </span>
              </div>
              
              <div className="space-y-2">
                {fontSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => handleFontSizeChange(size.id)}
                    className={`
                      w-full ${themeClasses.button} rounded-lg border p-3 transition-all duration-fast
                      ${fontSize === size.id 
                        ? (currentTheme === 'light' ? 'ring-2 ring-blue-500' : 'ring-2 ring-primary') 
                        : ''
                      }
                      hover:scale-105 text-left min-h-[48px] flex items-center justify-between
                    `}
                  >
                    <span className={`text-sm font-medium ${fontSize === size.id ? themeClasses.text : themeClasses.secondary}`}>
                      {size.name}
                    </span>
                    <span className={`text-xs ${themeClasses.secondary}`}>
                      {size.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="Settings" size={18} className={themeClasses.accent} />
                <span className={`font-medium text-sm ${themeClasses.text}`}>
                  Quick Actions
                </span>
              </div>
              
              <div className="space-y-2">
                <button className={`
                  w-full ${themeClasses.button} rounded-lg border p-3 transition-all duration-fast
                  hover:scale-105 text-left min-h-[48px] flex items-center space-x-2
                `}>
                  <Icon name="Download" size={16} className={themeClasses.secondary} />
                  <span className={`text-sm ${themeClasses.secondary}`}>
                    Export Settings
                  </span>
                </button>
                
                <button className={`
                  w-full ${themeClasses.button} rounded-lg border p-3 transition-all duration-fast
                  hover:scale-105 text-left min-h-[48px] flex items-center space-x-2
                `}>
                  <Icon name="RotateCcw" size={16} className={themeClasses.secondary} />
                  <span className={`text-sm ${themeClasses.secondary}`}>
                    Reset to Default
                  </span>
                </button>
              </div>
            </div>

            {/* Theme Preview */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="Eye" size={18} className={themeClasses.accent} />
                <span className={`font-medium text-sm ${themeClasses.text}`}>
                  Preview
                </span>
              </div>
              
              <div className="space-y-2">
                <div className={`text-sm ${themeClasses.text}`}>
                  Primary Text
                </div>
                <div className={`text-sm ${themeClasses.secondary}`}>
                  Secondary Text
                </div>
                <div className={`text-sm ${themeClasses.accent}`}>
                  Accent Color
                </div>
                <div className={`w-full h-3 rounded-full ${currentTheme === 'light' ? 'bg-gray-200' : 'bg-surface'}`}>
                  <div className={`w-3/4 h-full rounded-full ${currentTheme === 'light' ? 'bg-blue-600' : 'bg-primary'}`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border-accent/20 p-4 text-center">
            <div className="text-xs text-text-secondary font-caption">
              Click anywhere outside to close or press Escape
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeControls;