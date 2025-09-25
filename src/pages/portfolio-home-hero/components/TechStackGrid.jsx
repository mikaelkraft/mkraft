import React from 'react';
import Icon from '../../../components/AppIcon';

const TechStackGrid = ({ currentTheme, items }) => {
  const fallback = [
    {
      name: "React",
      icon: "Code",
      category: "Frontend",
      proficiency: 95,
      description: "Building modern, interactive user interfaces"
    },
    {
      name: "Node.js",
      icon: "Server",
      category: "Backend",
      proficiency: 90,
      description: "Scalable server-side applications"
    },
    {
      name: "Python",
      icon: "Bot",
      category: "Data Science",
      proficiency: 88,
      description: "AI/ML and data analysis solutions"
    },
    {
      name: "PHP",
      icon: "Globe",
      category: "Web Development",
      proficiency: 85,
      description: "Dynamic web applications and APIs"
    },
    {
      name: "JavaScript",
      icon: "Zap",
      category: "Programming",
      proficiency: 92,
      description: "Full-stack JavaScript development"
    },
    {
      name: "Blockchain",
      icon: "Link",
      category: "Web3",
      proficiency: 82,
      description: "Smart contracts and DeFi solutions"
    },
    {
      name: "Java",
      icon: "Coffee",
      category: "Enterprise",
      proficiency: 80,
      description: "Enterprise-grade applications"
    },
    {
      name: "R",
      icon: "BarChart3",
      category: "Analytics",
      proficiency: 75,
      description: "Statistical computing and graphics"
    },
    {
      name: "CSS",
      icon: "Palette",
      category: "Styling",
      proficiency: 90,
      description: "Modern CSS and responsive design"
    },
    {
      name: "HTML",
      icon: "FileText",
      category: "Markup",
      proficiency: 95,
      description: "Semantic web structure and accessibility"
    },
    {
      name: "Docker",
      icon: "Package",
      category: "DevOps",
      proficiency: 85,
      description: "Containerization and deployment"
    },
    {
      name: "Security",
      icon: "Shield",
      category: "Cybersecurity",
      proficiency: 87,
      description: "Application security and penetration testing"
    },
    {
      name: "Flutter",
      icon: "Smartphone",
      category: "Mobile",
      proficiency: 82,
      description: "Cross-platform mobile app development"
    },
    {
      name: "Figma",
      icon: "Figma",
      category: "Design",
      proficiency: 85,
      description: "UI/UX design and prototyping"
    },
    {
      name: "CorelDraw",
      icon: "Image",
      category: "Graphics",
      proficiency: 80,
      description: "Vector graphics and digital design"
    },
    {
      name: "Power Director",
      icon: "Video",
      category: "Video",
      proficiency: 75,
      description: "Professional video editing and effects"
    }
  ];

  const getThemeClasses = () => {
    switch(currentTheme) {
      case 'neural':
        return {
          bg: 'bg-purple-900/5',
          card: 'bg-purple-900/10 border-purple-500/20 hover:border-purple-400/40',
          text: 'text-purple-100',
          secondary: 'text-purple-300',
          accent: 'text-purple-400'
        };
      case 'futuristic':
        return {
          bg: 'bg-slate-900/5',
          card: 'bg-slate-900/10 border-blue-400/20 hover:border-blue-300/40',
          text: 'text-blue-100',
          secondary: 'text-blue-300',
          accent: 'text-blue-400'
        };
      case 'light':
        return {
          bg: 'bg-white',
          card: 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:shadow-lg',
          text: 'text-gray-900',
          secondary: 'text-gray-600',
          accent: 'text-blue-600'
        };
      default: // cyberpunk
        return {
          bg: 'bg-background',
          card: 'bg-surface/30 border-primary/20 hover:border-primary/40 hover-glow-primary',
          text: 'text-text-primary',
          secondary: 'text-text-secondary',
          accent: 'text-primary'
        };
    }
  };

  const themeClasses = getThemeClasses();
  const techStack = Array.isArray(items) && items.length ? items : fallback;

  const getCategoryColor = (category) => {
    const colors = {
      'Frontend': currentTheme === 'light' ? 'text-blue-600 bg-blue-100' : 'text-primary bg-primary/20',
      'Backend': currentTheme === 'light' ? 'text-green-600 bg-green-100' : 'text-accent bg-accent/20',
      'Data Science': currentTheme === 'light' ? 'text-purple-600 bg-purple-100' : 'text-secondary bg-secondary/20',
      'Web Development': currentTheme === 'light' ? 'text-orange-600 bg-orange-100' : 'text-warning bg-warning/20',
      'Programming': currentTheme === 'light' ? 'text-yellow-600 bg-yellow-100' : 'text-primary bg-primary/20',
      'Web3': currentTheme === 'light' ? 'text-indigo-600 bg-indigo-100' : 'text-secondary bg-secondary/20',
      'Enterprise': currentTheme === 'light' ? 'text-red-600 bg-red-100' : 'text-error bg-error/20',
      'Analytics': currentTheme === 'light' ? 'text-teal-600 bg-teal-100' : 'text-accent bg-accent/20',
      'Styling': currentTheme === 'light' ? 'text-pink-600 bg-pink-100' : 'text-secondary bg-secondary/20',
      'Markup': currentTheme === 'light' ? 'text-gray-600 bg-gray-100' : 'text-text-secondary bg-text-secondary/20',
      'DevOps': currentTheme === 'light' ? 'text-blue-600 bg-blue-100' : 'text-primary bg-primary/20',
      'Cybersecurity': currentTheme === 'light' ? 'text-red-600 bg-red-100' : 'text-error bg-error/20'
    };
    return colors[category] || (currentTheme === 'light' ? 'text-gray-600 bg-gray-100' : 'text-text-secondary bg-text-secondary/20');
  };

  return (
    <section className={`py-20 px-6 ${themeClasses.bg}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={`font-heading text-3xl lg:text-4xl font-bold mb-4 ${themeClasses.text}`}>
            Technology Stack
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${themeClasses.secondary}`}>
            Expertise across modern technologies, frameworks, and programming languages
          </p>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {techStack.map((tech, index) => (
            <div 
              key={index}
              className={`
                ${themeClasses.card} rounded-xl border-2 p-6 transition-all duration-fast
                hover:scale-105 cursor-pointer group
              `}
            >
              {/* Tech Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  ${currentTheme === 'light' ? 'bg-blue-100' : 'bg-primary/20'}
                  group-hover:scale-110 transition-transform duration-fast
                `}>
                  <Icon 
                    name={tech.icon} 
                    size={24} 
                    className={currentTheme === 'light' ? 'text-blue-600' : 'text-primary'} 
                  />
                </div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(tech.category)}`}>
                  {tech.category}
                </div>
              </div>

              {/* Tech Name */}
              <h3 className={`font-heading text-xl font-bold mb-2 ${themeClasses.text}`}>
                {tech.name}
              </h3>

              {/* Description */}
              <p className={`text-sm mb-4 ${themeClasses.secondary}`}>
                {tech.description}
              </p>

              {/* Proficiency Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${themeClasses.secondary}`}>
                    Proficiency
                  </span>
                  <span className={`text-xs font-bold ${themeClasses.accent}`}>
                    {tech.proficiency}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${currentTheme === 'light' ? 'bg-gray-200' : 'bg-surface'}`}>
                  <div 
                    className={`
                      h-full rounded-full transition-all duration-slow
                      ${currentTheme === 'light' ? 'bg-blue-600' : 'bg-primary'}
                    `}
                    style={{ width: `${tech.proficiency}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Skills Summary */}
        <div className="mt-16 text-center">
          <div className={`inline-flex items-center space-x-4 px-6 py-4 rounded-xl ${themeClasses.card} border-2`}>
            <Icon name="Award" size={24} className={themeClasses.accent} />
            <div>
              <div className={`font-heading font-bold text-lg ${themeClasses.text}`}>
                5+ Years Experience
              </div>
              <div className={`text-sm ${themeClasses.secondary}`}>
                Full-Stack Development & Cybersecurity
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStackGrid;