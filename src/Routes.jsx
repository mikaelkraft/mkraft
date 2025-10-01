import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import PortfolioHomeHero from "./pages/portfolio-home-hero";
import ProjectsPortfolioGrid from "./pages/projects-portfolio-grid";
import ProjectDetail from "./pages/project-detail";
import BlogContentHub from "./pages/blog-content-hub";
import BlogPost from "./pages/blog-post";
// TODO: Implement SearchResultsPage; temporarily route to BlogContentHub
const SearchResultsPage = BlogContentHub;
import Documentation from "./pages/documentation";
import ResetPassword from "./pages/ResetPassword.jsx";
import RequireAdmin from "./components/auth/RequireAdmin.jsx";
import AdminDashboardContentManagement from "./pages/admin-dashboard-content-management";
import FeatureFlagsPage from "./pages/admin-dashboard-content-management/FeatureFlags.jsx";
import NotFound from "./pages/NotFound.jsx";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Define your routes here */}
          <Route path="/" element={<PortfolioHomeHero />} />
          <Route path="/portfolio-home-hero" element={<PortfolioHomeHero />} />
          <Route
            path="/projects-portfolio-grid"
            element={<ProjectsPortfolioGrid />}
          />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/blog-content-hub" element={<BlogContentHub />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/search" element={<SearchResultsPage />} />
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
          {/* MediaLibrary route disabled until component confirmed */}
          <Route
            path="/admin/feature-flags"
            element={
              <RequireAdmin>
                <FeatureFlagsPage />
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
