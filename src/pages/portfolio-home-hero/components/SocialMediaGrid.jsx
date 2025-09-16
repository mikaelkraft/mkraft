import React from 'react';
import Icon from '../../../components/AppIcon';

const SocialMediaGrid = ({ currentTheme }) => {
  const socialLinks = [
    {
      name: "X (Twitter)",
      username: "@mikael_kraft",
      url: "https://x.com/mikael_kraft",
      icon: "Twitter",
      description: "Latest thoughts on tech, cybersecurity, and innovation",
      followers: "2.5K",
      color: currentTheme === 'light' ? 'text-black' : 'text-white',
      bgColor: currentTheme === 'light' ? 'bg-black' : 'bg-white/10'
    },
    {
      name: "LinkedIn",
      username: "in/mikael-kraft",
      url: "https://linkedin.com/in/mikael-kraft",
      icon: "Linkedin",
      description: "Professional network and career updates",
      followers: "1.8K",
      color: currentTheme === 'light' ? 'text-blue-600' : 'text-blue-400',
      bgColor: currentTheme === 'light' ? 'bg-blue-600' : 'bg-blue-600/20'
    },
    {
      name: "GitHub",
      username: "mikaelkraft",
      url: "https://github.com/mikaelkraft",
      icon: "Github",
      description: "Open source projects and code repositories",
      followers: "892",
      color: currentTheme === 'light' ? 'text-gray-800' : 'text-gray-300',
      bgColor: currentTheme === 'light' ? 'bg-gray-800' : 'bg-gray-800/20'
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
          bg: 'bg-gray-50',
          card: 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg',
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

  return (
    <section className={`py-20 px-6 ${themeClasses.bg}`}>
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={`font-heading text-3xl lg:text-4xl font-bold mb-4 ${themeClasses.text}`}>
            Connect With Me
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${themeClasses.secondary}`}>
            Follow my journey across different platforms for updates, insights, and collaborations
          </p>
        </div>

        {/* Social Media Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                ${themeClasses.card} rounded-2xl border-2 p-8 transition-all duration-fast
                hover:scale-105 cursor-pointer group block
              `}
            >
              {/* Social Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className={`
                  w-16 h-16 rounded-xl flex items-center justify-center
                  ${social.bgColor}
                  group-hover:scale-110 transition-transform duration-fast
                `}>
                  <Icon 
                    name={social.icon} 
                    size={28} 
                    className={social.color} 
                  />
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${themeClasses.text}`}>
                    {social.followers}
                  </div>
                  <div className={`text-sm ${themeClasses.secondary}`}>
                    Followers
                  </div>
                </div>
              </div>

              {/* Social Info */}
              <div className="space-y-3">
                <div>
                  <h3 className={`font-heading text-xl font-bold ${themeClasses.text}`}>
                    {social.name}
                  </h3>
                  <div className={`text-sm font-mono ${themeClasses.accent}`}>
                    {social.username}
                  </div>
                </div>

                <p className={`text-sm leading-relaxed ${themeClasses.secondary}`}>
                  {social.description}
                </p>

                {/* Follow Button */}
                <div className="pt-4">
                  <div className={`
                    inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm
                    ${currentTheme === 'light' ?'bg-gray-100 text-gray-700 group-hover:bg-gray-200' :'bg-surface/50 text-text-primary group-hover:bg-surface/70'
                    }
                    transition-all duration-fast
                  `}>
                    <Icon name="ExternalLink" size={16} />
                    <span>Visit Profile</span>
                  </div>
                </div>
              </div>

              {/* Hover Effect Indicator */}
              <div className="mt-6 flex justify-center">
                <div className={`
                  w-8 h-1 rounded-full transition-all duration-fast
                  ${currentTheme === 'light' ? 'bg-gray-200 group-hover:bg-blue-400' : 'bg-surface group-hover:bg-primary'}
                `}></div>
              </div>
            </a>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <div className={`${themeClasses.card} rounded-2xl border-2 p-8`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                ${currentTheme === 'light' ? 'bg-blue-100' : 'bg-primary/20'}
              `}>
                <Icon 
                  name="Mail" 
                  size={24} 
                  className={currentTheme === 'light' ? 'text-blue-600' : 'text-primary'} 
                />
              </div>
            </div>
            <h3 className={`font-heading text-xl font-bold mb-2 ${themeClasses.text}`}>
              Let's Collaborate
            </h3>
            <p className={`text-sm mb-6 ${themeClasses.secondary}`}>
              Have a project in mind? Let's discuss how we can work together to bring your ideas to life.
            </p>
            <button className={`
              px-6 py-3 rounded-lg font-medium transition-all duration-fast
              ${currentTheme === 'light' ?'bg-blue-600 text-white hover:bg-blue-700' :'bg-primary text-background hover:bg-primary/90 glow-primary'
              }
              min-h-[44px]
            `}>
              <Icon name="Send" size={18} className="inline mr-2" />
              Get In Touch
            </button>
          </div>
        </div>

        {/* Social Stats */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className={`text-2xl font-bold ${themeClasses.accent}`}>
              5.2K
            </div>
            <div className={`text-sm ${themeClasses.secondary}`}>
              Total Followers
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${themeClasses.accent}`}>
              150+
            </div>
            <div className={`text-sm ${themeClasses.secondary}`}>
              Posts & Updates
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
        </div>
      </div>
    </section>
  );
};

export default SocialMediaGrid;