// Add your imports here

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
          <Route path="/admin/media" element={<MediaLibrary />} />
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
