import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
// Add your imports here
import PortfolioHomeHero from "pages/portfolio-home-hero";
import ProjectsPortfolioGrid from "pages/projects-portfolio-grid";
import BlogContentHub from "pages/blog-content-hub";
import AdminDashboardContentManagement from "pages/admin-dashboard-content-management";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your routes here */}
        <Route path="/" element={<PortfolioHomeHero />} />
        <Route path="/portfolio-home-hero" element={<PortfolioHomeHero />} />
        <Route path="/projects-portfolio-grid" element={<ProjectsPortfolioGrid />} />
        <Route path="/blog-content-hub" element={<BlogContentHub />} />
        <Route path="/admin-dashboard-content-management" element={<AdminDashboardContentManagement />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;