import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const VisitorInfoPanel = ({ currentTheme }) => {
  const [visitorInfo, setVisitorInfo] = useState({
    currentTime: new Date(),
    ipAddress: "192.168.1.100",
    ispProvider: "CyberNet ISP",
    browser: "Chrome 120.0",
    deviceRAM: "16 GB",
    cpuCores: "8 cores",
    connectionType: "WiFi",
    displaySize: "1920x1080",
    screenResolution: "2560x1440",
    preferredLanguage: "English (US)",
    location: "San Francisco, CA",
    timezone: "PST (UTC-8)"
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setVisitorInfo(prev => ({
        ...prev,
        currentTime: new Date()
      }));
    }, 1000);

    // Simulate real-time data updates
    const dataInterval = setInterval(() => {
      setVisitorInfo(prev => ({
        ...prev,
        connectionType: Math.random() > 0.8 ? "Ethernet" : "WiFi",
        deviceRAM: Math.random() > 0.5 ? "16 GB" : "32 GB"
      }));
    }, 10000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dataInterval);
    };
  }, []);

  const getThemeClasses = () => {
    switch(currentTheme) {
      case 'neural':
        return {
          bg: 'bg-purple-900/10',
          panel: 'bg-purple-900/20 border-purple-500/30',
          text: 'text-purple-100',
          secondary: 'text-purple-300',
          accent: 'text-purple-400',
          grid: 'bg-purple-500/10'
        };
      case 'futuristic':
        return {
          bg: 'bg-slate-900/10',
          panel: 'bg-slate-900/20 border-blue-400/30',
          text: 'text-blue-100',
          secondary: 'text-blue-300',
          accent: 'text-blue-400',
          grid: 'bg-blue-400/10'
        };
      case 'light':
        return {
          bg: 'bg-gray-50',
          panel: 'bg-white border-gray-200 shadow-lg',
          text: 'text-gray-900',
          secondary: 'text-gray-600',
          accent: 'text-blue-600',
          grid: 'bg-blue-50/50'
        };
      default: // cyberpunk
        return {
          bg: 'bg-background',
          panel: 'bg-surface/30 border-primary/30 glow-primary',
          text: 'text-text-primary',
          secondary: 'text-text-secondary',
          accent: 'text-primary',
          grid: 'bg-primary/5'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const infoItems = [
    { label: "IP Address", value: visitorInfo.ipAddress, icon: "Globe" },
    { label: "ISP Provider", value: visitorInfo.ispProvider, icon: "Wifi" },
    { label: "Browser", value: visitorInfo.browser, icon: "Monitor" },
    { label: "Device RAM", value: visitorInfo.deviceRAM, icon: "Cpu" },
    { label: "CPU Cores", value: visitorInfo.cpuCores, icon: "Zap" },
    { label: "Connection", value: visitorInfo.connectionType, icon: "Radio" },
    { label: "Display Size", value: visitorInfo.displaySize, icon: "Smartphone" },
    { label: "Resolution", value: visitorInfo.screenResolution, icon: "Maximize" },
    { label: "Language", value: visitorInfo.preferredLanguage, icon: "Languages" },
    { label: "Location", value: visitorInfo.location, icon: "MapPin" },
    { label: "Timezone", value: visitorInfo.timezone, icon: "Clock" }
  ];

  return (
    <section className={`py-20 px-6 relative overflow-hidden ${themeClasses.bg}`}>
      {/* Network Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className={`w-full h-full ${themeClasses.grid}`} style={{
          backgroundImage: `
            linear-gradient(${currentTheme === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 255, 255, 0.1)'} 1px, transparent 1px),
            linear-gradient(90deg, ${currentTheme === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 255, 255, 0.1)'} 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}>
        </div>
        {/* Animated Network Nodes */}
        {currentTheme !== 'light' && (
          <>
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-secondary rounded-full animate-pulse delay-500"></div>
            <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-accent rounded-full animate-pulse delay-1000"></div>
          </>
        )}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className={`font-heading text-3xl lg:text-4xl font-bold mb-4 ${themeClasses.text}`}>
            Visitor Information
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${themeClasses.secondary}`}>
            Real-time system and network information for your current session
          </p>
        </div>

        {/* Main Info Panel */}
        <div className={`${themeClasses.panel} rounded-2xl border-2 overflow-hidden`}>
          {/* Current Time Display */}
          <div className="p-8 text-center border-b border-current border-opacity-20">
            <div className={`font-heading text-4xl lg:text-5xl font-bold mb-2 ${themeClasses.accent}`}>
              {formatTime(visitorInfo.currentTime)}
            </div>
            <div className={`text-lg ${themeClasses.secondary}`}>
              {formatDate(visitorInfo.currentTime)}
            </div>
            <div className="flex items-center justify-center mt-4 space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${currentTheme === 'light' ? 'bg-green-500' : 'bg-accent'}`}></div>
              <span className={`text-sm font-medium ${themeClasses.secondary}`}>
                Live Session Active
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 border-b border-current border-opacity-20">
            <div className="text-center">
              <Icon name="Globe" size={24} className={`${themeClasses.accent} mx-auto mb-2`} />
              <div className={`font-bold text-lg ${themeClasses.text}`}>
                {visitorInfo.ipAddress}
              </div>
              <div className={`text-sm ${themeClasses.secondary}`}>
                IP Address
              </div>
            </div>
            <div className="text-center">
              <Icon name="Cpu" size={24} className={`${themeClasses.accent} mx-auto mb-2`} />
              <div className={`font-bold text-lg ${themeClasses.text}`}>
                {visitorInfo.cpuCores}
              </div>
              <div className={`text-sm ${themeClasses.secondary}`}>
                CPU Cores
              </div>
            </div>
            <div className="text-center">
              <Icon name="Monitor" size={24} className={`${themeClasses.accent} mx-auto mb-2`} />
              <div className={`font-bold text-lg ${themeClasses.text}`}>
                {visitorInfo.displaySize}
              </div>
              <div className={`text-sm ${themeClasses.secondary}`}>
                Display
              </div>
            </div>
            <div className="text-center">
              <Icon name="Radio" size={24} className={`${themeClasses.accent} mx-auto mb-2`} />
              <div className={`font-bold text-lg ${themeClasses.text}`}>
                {visitorInfo.connectionType}
              </div>
              <div className={`text-sm ${themeClasses.secondary}`}>
                Connection
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="p-8">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`
                flex items-center justify-between w-full mb-6 p-4 rounded-lg
                ${currentTheme === 'light' ? 'bg-gray-50 hover:bg-gray-100' : 'bg-surface/50 hover:bg-surface/70'}
                transition-all duration-fast
              `}
            >
              <span className={`font-medium ${themeClasses.text}`}>
                Detailed System Information
              </span>
              <Icon 
                name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                className={themeClasses.accent} 
              />
            </button>

            {isExpanded && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in slide-in-from-top duration-300">
                {infoItems.map((item, index) => (
                  <div 
                    key={index}
                    className={`
                      flex items-center space-x-4 p-4 rounded-lg
                      ${currentTheme === 'light' ? 'bg-gray-50' : 'bg-surface/30'}
                      hover:scale-105 transition-transform duration-fast
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${currentTheme === 'light' ? 'bg-blue-100' : 'bg-primary/20'}
                    `}>
                      <Icon 
                        name={item.icon} 
                        size={18} 
                        className={currentTheme === 'light' ? 'text-blue-600' : 'text-primary'} 
                      />
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${themeClasses.secondary}`}>
                        {item.label}
                      </div>
                      <div className={`font-bold ${themeClasses.text}`}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className={`p-6 border-t border-current border-opacity-20 ${currentTheme === 'light' ? 'bg-blue-50' : 'bg-primary/5'}`}>
            <div className="flex items-start space-x-3">
              <Icon name="Shield" size={20} className={themeClasses.accent} />
              <div>
                <div className={`font-medium text-sm ${themeClasses.text}`}>
                  Privacy & Security
                </div>
                <div className={`text-xs mt-1 ${themeClasses.secondary}`}>
                  This information is collected for demonstration purposes only and is not stored or transmitted to external servers.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisitorInfoPanel;