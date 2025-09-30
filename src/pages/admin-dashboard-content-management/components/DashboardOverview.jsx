const DashboardOverview = ({ stats, analytics }) => {
  const statCards = [
    {
      title: "Total Projects",
      value: stats.projects,
      change: "+12%",
      changeType: "positive",
      icon: "FolderOpen",
      color: "primary",
    },
    {
      title: "Blog Posts",
      value: stats.blogPosts,
      change: "+8%",
      changeType: "positive",
      icon: "BookOpen",
      color: "secondary",
    },
    {
      title: "Hero Slides",
      value: stats.slides,
      change: "+3%",
      changeType: "positive",
      icon: "Image",
      color: "accent",
    },
    {
      title: "Total Views",
      value: "24.7K",
      change: "+15%",
      changeType: "positive",
      icon: "Eye",
      color: "success",
    },
  ];

  const COLORS = ["#00FFFF", "#FF0080", "#39FF14", "#FFB000"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">
            Dashboard Overview
          </h1>
          <p className="text-text-secondary font-caption mt-2">
            Welcome back, Mikael. Here's your content performance summary.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-text-secondary font-caption">
          <Icon name="Calendar" size={16} />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-surface rounded-lg p-6 border border-border-accent/20 hover:shadow-glow-primary transition-all duration-fast"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.color}/10`}
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
            <div className="space-y-1">
              <div className="text-2xl font-heading font-bold text-text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-text-secondary font-caption">
                {stat.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visitor Analytics */}
        <div className="bg-surface rounded-lg p-6 border border-border-accent/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-text-primary">
              Visitor Analytics
            </h3>
            <Icon name="TrendingUp" size={20} className="text-primary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.visitorData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0, 255, 255, 0.1)"
                />
                <XAxis dataKey="date" stroke="#A0A0B0" fontSize={12} />
                <YAxis stroke="#A0A0B0" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A2E",
                    border: "1px solid rgba(0, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#E0E0E0",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="#00FFFF"
                  strokeWidth={2}
                  dot={{ fill: "#00FFFF", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Performance */}
        <div className="bg-surface rounded-lg p-6 border border-border-accent/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-text-primary">
              Content Performance
            </h3>
            <Icon name="BarChart3" size={20} className="text-secondary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.contentData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0, 255, 255, 0.1)"
                />
                <XAxis dataKey="type" stroke="#A0A0B0" fontSize={12} />
                <YAxis stroke="#A0A0B0" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A2E",
                    border: "1px solid rgba(0, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#E0E0E0",
                  }}
                />
                <Bar dataKey="views" fill="#FF0080" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Popular Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-surface rounded-lg p-6 border border-border-accent/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-text-primary">
              Recent Activity
            </h3>
            <Icon name="Activity" size={20} className="text-accent" />
          </div>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-primary/5 transition-colors duration-fast"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-${activity.type === "create" ? "success" : activity.type === "update" ? "warning" : "error"}/10`}
                >
                  <Icon
                    name={
                      activity.type === "create"
                        ? "Plus"
                        : activity.type === "update"
                          ? "Edit"
                          : "Trash2"
                    }
                    size={16}
                    className={`text-${activity.type === "create" ? "success" : activity.type === "update" ? "warning" : "error"}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">
                    {activity.action}
                  </div>
                  <div className="text-xs text-text-secondary font-caption">
                    {activity.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Content */}
        <div className="bg-surface rounded-lg p-6 border border-border-accent/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-text-primary">
              Popular Content
            </h3>
            <Icon name="Star" size={20} className="text-warning" />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.popularContent}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.popularContent.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A2E",
                    border: "1px solid rgba(0, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#E0E0E0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {analytics.popularContent.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full`}
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-text-secondary font-caption">
                    {item.name}
                  </span>
                </div>
                <span className="text-text-primary font-medium">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
