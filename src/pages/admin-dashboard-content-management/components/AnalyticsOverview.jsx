import { useState, useEffect } from "react";

const AnalyticsOverview = () => {
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    pageViews: [],
    topPages: [],
    browserStats: [],
    deviceStats: [],
    trafficSources: [],
  });
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Mock analytics data for demonstration
      // In a real implementation, this would fetch from your analytics API
      const mockData = {
        totalViews: 15420,
        uniqueVisitors: 8930,
        pageViews: [
          { date: "2025-09-18", views: 1250, visitors: 890 },
          { date: "2025-09-19", views: 1350, visitors: 920 },
          { date: "2025-09-20", views: 1180, visitors: 780 },
          { date: "2025-09-21", views: 1420, visitors: 980 },
          { date: "2025-09-22", views: 1680, visitors: 1120 },
          { date: "2025-09-23", views: 1890, visitors: 1200 },
          { date: "2025-09-24", views: 2150, visitors: 1340 },
        ],
        topPages: [
          { page: "/portfolio-home-hero", views: 4250, title: "Home" },
          { page: "/projects-portfolio-grid", views: 3180, title: "Projects" },
          { page: "/blog-content-hub", views: 2890, title: "Blog" },
          { page: "/documentation", views: 1670, title: "Documentation" },
          {
            page: "/project/crypto-platform",
            views: 950,
            title: "Crypto Platform",
          },
        ],
        browserStats: [
          { name: "Chrome", value: 65, count: 5850 },
          { name: "Firefox", value: 18, count: 1607 },
          { name: "Safari", value: 12, count: 1072 },
          { name: "Edge", value: 5, count: 447 },
        ],
        deviceStats: [
          { name: "Desktop", value: 68, count: 6072 },
          { name: "Mobile", value: 28, count: 2500 },
          { name: "Tablet", value: 4, count: 357 },
        ],
        trafficSources: [
          { source: "Direct", visits: 3580, percentage: 40 },
          { source: "Google", visits: 2865, percentage: 32 },
          { source: "GitHub", visits: 1250, percentage: 14 },
          { source: "LinkedIn", visits: 895, percentage: 10 },
          { source: "Twitter", visits: 340, percentage: 4 },
        ],
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#00FFFF", "#FF0080", "#39FF14", "#FFB000", "#8B5CF6"];

  const statCards = [
    {
      title: "Total Views",
      value: analytics.totalViews.toLocaleString(),
      change: "+15.3%",
      changeType: "positive",
      icon: "Eye",
      color: "primary",
    },
    {
      title: "Unique Visitors",
      value: analytics.uniqueVisitors.toLocaleString(),
      change: "+12.8%",
      changeType: "positive",
      icon: "Users",
      color: "secondary",
    },
    {
      title: "Avg. Session Duration",
      value: "3m 42s",
      change: "+8.2%",
      changeType: "positive",
      icon: "Clock",
      color: "accent",
    },
    {
      title: "Bounce Rate",
      value: "32.5%",
      change: "-5.1%",
      changeType: "positive",
      icon: "TrendingDown",
      color: "success",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">
              Analytics Overview
            </h1>
            <p className="text-text-secondary font-caption mt-2">
              Track your portfolio performance and visitor insights
            </p>
          </div>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface/20 rounded-lg p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">
            Analytics Overview
          </h1>
          <p className="text-text-secondary font-caption mt-2">
            Track your portfolio performance and visitor insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-surface border border-border-accent/20 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-surface/20 border border-border-accent/20 rounded-lg p-6 hover:border-primary/40 transition-colors duration-fast"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg bg-${stat.color}/20 flex items-center justify-center`}
              >
                <Icon
                  name={stat.icon}
                  size={24}
                  className={`text-${stat.color}`}
                />
              </div>
              <div
                className={`text-sm font-medium ${stat.changeType === "positive" ? "text-success" : "text-error"}`}
              >
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-heading font-bold text-text-primary mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-text-secondary font-caption">
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Page Views Chart */}
        <div className="bg-surface/20 border border-border-accent/20 rounded-lg p-6">
          <h3 className="font-heading font-semibold text-lg text-text-primary mb-6">
            Page Views Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.pageViews}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#00FFFF"
                strokeWidth={2}
                dot={{ fill: "#00FFFF" }}
              />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#FF0080"
                strokeWidth={2}
                dot={{ fill: "#FF0080" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Stats */}
        <div className="bg-surface/20 border border-border-accent/20 rounded-lg p-6">
          <h3 className="font-heading font-semibold text-lg text-text-primary mb-6">
            Device Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.deviceStats}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {analytics.deviceStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Pages and Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <div className="bg-surface/20 border border-border-accent/20 rounded-lg p-6">
          <h3 className="font-heading font-semibold text-lg text-text-primary mb-6">
            Top Pages
          </h3>
          <div className="space-y-4">
            {analytics.topPages.map((page, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-border-accent/10"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full bg-${index === 0 ? "primary" : index === 1 ? "secondary" : "accent"}/20 flex items-center justify-center text-xs font-bold text-${index === 0 ? "primary" : index === 1 ? "secondary" : "accent"}`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">
                      {page.title}
                    </div>
                    <div className="text-sm text-text-secondary font-caption">
                      {page.page}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-text-primary">
                    {page.views.toLocaleString()}
                  </div>
                  <div className="text-sm text-text-secondary font-caption">
                    views
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-surface/20 border border-border-accent/20 rounded-lg p-6">
          <h3 className="font-heading font-semibold text-lg text-text-primary mb-6">
            Traffic Sources
          </h3>
          <div className="space-y-4">
            {analytics.trafficSources.map((source, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-border-accent/10"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full bg-${COLORS[index]}/20 flex items-center justify-center`}
                  >
                    <Icon
                      name={
                        source.source === "Direct"
                          ? "Globe"
                          : source.source === "Google"
                            ? "Search"
                            : "Share2"
                      }
                      size={16}
                      style={{ color: COLORS[index] }}
                    />
                  </div>
                  <div className="font-medium text-text-primary">
                    {source.source}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-text-primary">
                    {source.visits.toLocaleString()}
                  </div>
                  <div className="text-sm text-text-secondary font-caption">
                    {source.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
