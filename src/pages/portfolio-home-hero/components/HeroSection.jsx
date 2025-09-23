import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const HeroSection = ({ currentTheme }) => {
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const phrases = [
    "React Developer",
    "Node.js Developer", 
    "Full-Stack Engineer",
    "JavaScript Expert",
    "React Specialist"
  ];

  useEffect(() => {
    const typeSpeed = isDeleting ? 50 : 100;
    const currentPhrase = phrases[currentIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting && typedText === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && typedText === '') {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
      } else {
        setTypedText(prev => 
          isDeleting 
            ? prev.slice(0, -1)
            : currentPhrase.slice(0, prev.length + 1)
        );
      }
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [typedText, currentIndex, isDeleting, phrases]);

  const getThemeClasses = () => {
    switch(currentTheme) {
      case 'neural':
        return 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30';
      case 'futuristic':
        return 'bg-gradient-to-br from-slate-900/20 to-blue-900/20 border-blue-400/30';
      case 'light':
        return 'bg-gradient-to-br from-gray-50 to-blue-50 border-gray-300';
      default: // cyberpunk
        return 'bg-gradient-to-br from-surface/20 to-primary/5 border-primary/30';
    }
  };

  const getTextClasses = () => {
    switch(currentTheme) {
      case 'light':
        return {
          primary: 'text-gray-900',
          secondary: 'text-gray-600',
          accent: 'text-blue-600'
        };
      default:
        return {
          primary: 'text-text-primary',
          secondary: 'text-text-secondary', 
          accent: 'text-primary'
        };
    }
  };

  const textColors = getTextClasses();

  return (
    <section className={`min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden ${currentTheme === 'light' ? 'bg-white' : 'bg-background'}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {currentTheme !== 'light' && (
          <>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full cyber-grid opacity-10"></div>
          </>
        )}
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Profile Image */}
  <div className="mt-8 md:mt-16 mb-8 flex justify-center">
          <div className={`relative w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 ${currentTheme === 'light' ? 'border-blue-200' : 'border-primary/50'} hover-glow-primary transition-all duration-normal`}>
            <Image 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
              alt="Mikael Kraft - Full Stack Developer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className={`font-heading text-4xl lg:text-6xl xl:text-7xl font-bold mb-6 ${textColors.primary}`}>
          <span className="block">Mikael</span>
          <span className={`block bg-gradient-to-r ${currentTheme === 'light' ? 'from-blue-600 to-purple-600' : 'from-primary to-secondary'} bg-clip-text text-transparent`}>
            Kraft
          </span>
        </h1>

        {/* Typing Animation */}
        <div className="mb-8 h-16 flex items-center justify-center">
          <h2 className={`font-heading text-xl lg:text-2xl xl:text-3xl ${textColors.accent}`}>
            {typedText}
            <span className="animate-pulse">|</span>
          </h2>
        </div>

        {/* Description */}
        <div className={`max-w-4xl mx-auto mb-12 space-y-4 ${textColors.secondary}`}>
          <p className="text-lg lg:text-xl leading-relaxed">
            Crafting exceptional web applications with React and Node.js.
            I focus on building scalable, performant solutions that deliver 
            outstanding user experiences through modern JavaScript technologies.
          </p>
          <p className="text-base lg:text-lg">
            From interactive React frontends to robust Node.js backends, I create 
            full-stack applications that seamlessly connect users with technology.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button className={`
            px-8 py-4 rounded-lg font-medium text-lg transition-all duration-fast
            ${currentTheme === 'light' ?'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl' :'bg-primary text-background hover:bg-primary/90 glow-primary hover:shadow-glow-primary'
            }
            min-h-[48px] min-w-[160px]
          `}>
            <Icon name="FolderOpen" size={20} className="inline mr-2" />
            View Projects
          </button>
          <button className={`
            px-8 py-4 rounded-lg font-medium text-lg transition-all duration-fast border-2
            ${currentTheme === 'light' ?'border-blue-600 text-blue-600 hover:bg-blue-50' :'border-primary text-primary hover:bg-primary/10'
            }
            min-h-[48px] min-w-[160px]
          `}>
            <Icon name="Download" size={20} className="inline mr-2" />
            Download CV
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center">
          <div className={`animate-bounce ${textColors.secondary}`}>
            <Icon name="ChevronDown" size={24} />
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      {currentTheme !== 'light' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 text-primary/20 animate-pulse">
            <Icon name="Code" size={32} />
          </div>
          <div className="absolute top-40 right-20 text-secondary/20 animate-pulse delay-500">
            <Icon name="Shield" size={28} />
          </div>
          <div className="absolute bottom-40 left-20 text-accent/20 animate-pulse delay-1000">
            <Icon name="Database" size={30} />
          </div>
          <div className="absolute bottom-20 right-10 text-primary/20 animate-pulse delay-1500">
            <Icon name="Cpu" size={26} />
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;