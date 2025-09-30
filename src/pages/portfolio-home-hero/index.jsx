import { useState, useEffect } from "react";
// import HeaderNavigation from '../../components/ui/HeaderNavigation';
// import HeroSection from './components/HeroSection';
// import ProjectCarousel from './components/ProjectCarousel';
// import ProjectShowcase from './components/ProjectShowcase';
// import TechStackGrid from './components/TechStackGrid';
// import VisitorInfoPanel from './components/VisitorInfoPanel';
// import SocialMediaGrid from './components/SocialMediaGrid';
// import FeaturedBlogPosts from './components/FeaturedBlogPosts';
// import NewsletterSubscription from './components/NewsletterSubscription';
// import ThemeControls from './components/ThemeControls';
// import DynamicFooter from './components/DynamicFooter';
import settingsService from "../../utils/settingsService";

const PortfolioHomeHero = () => {
  const [currentTheme, setCurrentTheme] = useState("cyberpunk");
  const [fontSize, setFontSize] = useState("medium");
  const [isThemeControlsOpen, setIsThemeControlsOpen] = useState(false);
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [techStack, setTechStack] = useState([]);

  // Apply theme and font size to document
  useEffect(() => {
    const root = document.documentElement;

    // Apply theme classes
    root.className = `theme-${currentTheme}`;

    // Apply font size
    const fontSizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
      xlarge: "20px",
    };
    root.style.fontSize = fontSizeMap[fontSize];
  }, [currentTheme, fontSize]);

  // Load settings (theme defaults and hero video)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await settingsService.getSettings();
      if (!mounted || !res.success) return;
      const stg = res.data || {};
      const ui = stg.ui_settings || {};
      if (stg.default_theme) setCurrentTheme(stg.default_theme);
      if (stg.default_font_size) setFontSize(stg.default_font_size);
      setVideoEnabled(stg.enable_video !== false);
      if (ui.hero_video_url) setHeroVideoUrl(ui.hero_video_url);
      if (Array.isArray(ui.tech_stack)) setTechStack(ui.tech_stack);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
  };

  const handleThemeControlsToggle = () => {
    setIsThemeControlsOpen(!isThemeControlsOpen);
  };

  const handleThemeControlsClose = () => {
    setIsThemeControlsOpen(false);
  };

  const getBackgroundClass = () => {
    switch (currentTheme) {
      case "dark":
        return "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800";
      case "neural":
        return "bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900";
      case "futuristic":
        return "bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900";
      case "light":
        return "bg-gradient-to-br from-gray-50 via-white to-blue-50";
      default: // cyberpunk
        return "bg-gradient-to-br from-background via-surface to-background";
    }
  };

  return (
    <>
      <div
        className={`min-h-screen ${getBackgroundClass()} relative overflow-x-hidden`}
      >
        {/* Optional Hero Background Video */}
        {videoEnabled && heroVideoUrl && (
          <video
            className="pointer-events-none fixed inset-0 w-full h-full object-cover opacity-25"
            src={heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
          />
        )}
        {/* Header Navigation */}
        <HeaderNavigation
          onThemeControlsToggle={handleThemeControlsToggle}
          currentTheme={currentTheme}
        />

        {/* Theme Controls Modal */}
        <ThemeControls
          isOpen={isThemeControlsOpen}
          onClose={handleThemeControlsClose}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
        />

        {/* Main Content */}
        <main className="relative z-10">
          {/* Hero Section */}
          <HeroSection currentTheme={currentTheme} />

          {/* Project Carousel */}
          <ProjectCarousel currentTheme={currentTheme} />

          {/* Project Showcase - Video/Image/Logo Projects */}
          <ProjectShowcase currentTheme={currentTheme} />

          {/* Technology Stack Grid */}
          <TechStackGrid currentTheme={currentTheme} items={techStack} />

          {/* Featured Blog Posts */}
          <FeaturedBlogPosts currentTheme={currentTheme} />

          {/* Newsletter Subscription */}
          <NewsletterSubscription currentTheme={currentTheme} />

          {/* Visitor Information Panel */}
          <VisitorInfoPanel currentTheme={currentTheme} />

          {/* Social Media Grid */}
          <SocialMediaGrid currentTheme={currentTheme} />
        </main>

        {/* Dynamic Footer */}
        <DynamicFooter currentTheme={currentTheme} />

        {/* Background Effects */}
        {currentTheme !== "light" && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div className="absolute top-0 left-0 w-full h-full cyber-grid opacity-5"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
        )}

        {/* Sticky Footer with Theme Controls Trigger */}
        <div className="fixed bottom-8 right-8 flex flex-col items-end space-y-3 z-40">
          {/* Theme Controls Trigger Button */}
          <button
            onClick={handleThemeControlsToggle}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-fast
              ${
                currentTheme === "light"
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                  : "bg-primary text-background hover:bg-primary/90 glow-primary"
              }
              hover:scale-110 opacity-80 hover:opacity-100
            `}
            title="Open theme controls"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z"
              />
            </svg>
          </button>

          {/* Scroll to Top Button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-fast
              ${
                currentTheme === "light"
                  ? "bg-gray-600 text-white hover:bg-gray-700 shadow-lg"
                  : "bg-surface text-primary hover:bg-surface/90 border border-primary/30"
              }
              hover:scale-110 opacity-80 hover:opacity-100
            `}
            aria-label="Scroll to top"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default PortfolioHomeHero;
