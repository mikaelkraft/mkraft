import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
// Add your imports here
import PortfolioHomeHero from "pages/portfolio-home-hero";
import ProjectsPortfolioGrid from "pages/projects-portfolio-grid";
import ProjectDetail from "pages/project-detail";
import BlogContentHub from "pages/blog-content-hub";
import Documentation from "pages/documentation";
import AdminDashboardContentManagement from "pages/admin-dashboard-content-management";
import RequireAdmin from "components/auth/RequireAdmin";
import NotFound from "pages/NotFound";
import ResetPassword from "pages/ResetPassword";

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
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/blog-content-hub" element={<BlogContentHub />} />
        <Route path="/documentation" element={<Documentation />} />
  <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/admin-dashboard-content-management"
          element={
            <RequireAdmin>
              <AdminDashboardContentManagement />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;