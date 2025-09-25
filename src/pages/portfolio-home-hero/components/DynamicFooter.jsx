import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const DynamicFooter = ({ currentTheme }) => {
  const currentYear = new Date().getFullYear();

  const getThemeClasses = () => {
    switch(currentTheme) {
      case 'neural':
        return {
          bg: 'bg-purple-900/10 border-purple-500/20',
          text: 'text-purple-100',
          secondary: 'text-purple-300',
          accent: 'text-purple-400',
          link: 'text-purple-400 hover:text-purple-300'
        };
      case 'futuristic':
        return {
          bg: 'bg-slate-900/10 border-blue-400/20',
          text: 'text-blue-100',
          secondary: 'text-blue-300',
          accent: 'text-blue-400',
          link: 'text-blue-400 hover:text-blue-300'
        };
      case 'light':
        return {
          bg: 'bg-white border-gray-200',
          text: 'text-gray-900',
          secondary: 'text-gray-600',
          accent: 'text-blue-600',
          link: 'text-blue-600 hover:text-blue-800'
        };
      default: // cyberpunk
        return {
          bg: 'bg-surface/20 border-primary/20',
          text: 'text-text-primary',
          secondary: 'text-text-secondary',
          accent: 'text-primary',
          link: 'text-primary hover:text-secondary'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const footerLinks = [
    {
      title: "Navigation",
      links: [
        { name: "Home", href: "/portfolio-home-hero" },
        { name: "Projects", href: "/projects-portfolio-grid" },
        { name: "Blog", href: "/blog-content-hub" },
        { name: "Admin", href: "/admin-dashboard-content-management" }
      ]
    },
    {
      title: "Connect",
      links: [
        { name: "X (Twitter)", href: "https://x.com/mikael_kraft", external: true },
        { name: "LinkedIn", href: "https://linkedin.com/in/mikael-kraft", external: true },
        { name: "GitHub", href: "https://github.com/mikaelkraft", external: true },
        { name: "Email", href: "mailto:mikewillkraft@gmail.com", external: true }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "/documentation" },
        { name: "API Reference", href: "/documentation#api" },
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" }
      ]
    }
  ];

  const techStack = [
    "React", "Node.js", "Python", "PHP", "JavaScript", 
    "Blockchain", "Java", "R", "CSS", "HTML"
  ];

  return (
    <footer className={`${themeClasses.bg} border-t-2 mt-20`}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentTheme === 'light' ? 'bg-blue-600' : 'bg-gradient-to-br from-primary to-secondary'}`}>
                  <Icon name="Code" size={24} className={currentTheme === 'light' ? 'text-white' : 'text-background'} />
                </div>
                {currentTheme !== 'light' && (
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg blur opacity-75 -z-10"></div>
                )}
              </div>
              <div>
                <div className={`font-heading font-bold text-xl ${themeClasses.text}`}>
                  WisdomInTech
                </div>
                <div className={`text-sm ${themeClasses.secondary}`}>
                  Portfolio
                </div>
              </div>
            </div>
            
            <p className={`text-sm leading-relaxed mb-6 ${themeClasses.secondary}`}>
              Crafting digital experiences at the intersection of innovation and security. 
              Building the future, one line of code at a time.
            </p>

            {/* Tech Stack Tags */}
            <div className="flex flex-wrap gap-2">
              {techStack.slice(0, 5).map((tech, index) => (
                <span 
                  key={index}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    currentTheme === 'light' ?'bg-blue-100 text-blue-800' :'bg-primary/20 text-primary'
                  }`}
                >
                  {tech}
                </span>
              ))}
              <span className={`px-2 py-1 rounded text-xs font-medium ${themeClasses.secondary}`}>
                +{techStack.length - 5} more
              </span>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className={`font-heading font-bold text-lg mb-4 ${themeClasses.text}`}>
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                          ${themeClasses.link} text-sm transition-colors duration-fast
                          hover:underline flex items-center space-x-2
                        `}
                      >
                        <span>{link.name}</span>
                        <Icon name="ExternalLink" size={12} />
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className={`
                          ${themeClasses.link} text-sm transition-colors duration-fast
                          hover:underline
                        `}
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className={`border-t border-current border-opacity-20 pt-8 mb-8`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className={`text-2xl font-bold ${themeClasses.accent}`}>
                50+
              </div>
              <div className={`text-sm ${themeClasses.secondary}`}>
                Projects Completed
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${themeClasses.accent}`}>
                5+
              </div>
              <div className={`text-sm ${themeClasses.secondary}`}>
                Years Experience
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${themeClasses.accent}`}>
                25+
              </div>
              <div className={`text-sm ${themeClasses.secondary}`}>
                Open Source Repos
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${themeClasses.accent}`}>
                5.2K
              </div>
              <div className={`text-sm ${themeClasses.secondary}`}>
                Community Followers
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`border-t border-current border-opacity-20 pt-8`}>
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className={`text-sm ${themeClasses.secondary} text-center lg:text-left`}>
              <p>
                © {currentYear} WisdomInTech. Built with love ❤️ by{' '}
                <span className={`font-medium ${themeClasses.accent}`}>
                  Mikael Kraft
                </span>
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a
                href="https://x.com/mikael_kraft"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-fast
                  ${currentTheme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-surface/50 hover:bg-surface'}
                  hover:scale-110
                `}
                aria-label="Follow on X (Twitter)"
              >
                <Icon name="Twitter" size={18} className={themeClasses.secondary} />
              </a>
              <a
                href="https://linkedin.com/in/mikael-kraft"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-fast
                  ${currentTheme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-surface/50 hover:bg-surface'}
                  hover:scale-110
                `}
                aria-label="Connect on LinkedIn"
              >
                <Icon name="Linkedin" size={18} className={themeClasses.secondary} />
              </a>
              <a
                href="https://github.com/mikaelkraft"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-fast
                  ${currentTheme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-surface/50 hover:bg-surface'}
                  hover:scale-110
                `}
                aria-label="View GitHub Profile"
              >
                <Icon name="Github" size={18} className={themeClasses.secondary} />
              </a>
            </div>
          </div>

          {/* Version Info */}
          <div className={`text-center mt-6 text-xs ${themeClasses.secondary}`}>
            <p>
              Portfolio v2.0.0 • Last updated: {new Date().toLocaleDateString()} • 
              Powered by React & Vite
            </p>
          </div>
        </div>
      </div>

      {/* Background Effects */}
      {currentTheme !== 'light' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
      )}
    </footer>
  );
};

export default DynamicFooter;