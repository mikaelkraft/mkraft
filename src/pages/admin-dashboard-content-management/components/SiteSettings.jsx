import { useState } from "react";

const SiteSettings = ({ settings, onSettingsUpdate }) => {
  const [activeTab, setActiveTab] = useState("general");
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: "general", label: "General", icon: "Settings" },
    { id: "appearance", label: "Appearance", icon: "Palette" },
    { id: "content", label: "Content", icon: "FileText" },
    { id: "tech", label: "Tech Stack", icon: "Cpu" },
    { id: "social", label: "Social Media", icon: "Share2" },
    { id: "seo", label: "SEO", icon: "Search" },
    { id: "monetization", label: "Monetization", icon: "DollarSign" },
    { id: "advanced", label: "Advanced", icon: "Code" },
  ];

  const handleSettingChange = (key, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleUiSettingChange = (key, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      ui: { ...(prev.ui || {}), [key]: value },
    }));
    setHasChanges(true);
  };

  const handleAdsSettingChange = (key, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      ads: { ...(prev.ads || {}), [key]: value },
    }));
    setHasChanges(true);
  };

  const handleTechStackChange = (next) => {
    setLocalSettings((prev) => ({
      ...prev,
      ui: { ...(prev.ui || {}), tech_stack: next },
    }));
    setHasChanges(true);
  };

  const handleDemoProjectsChange = (next) => {
    setLocalSettings((prev) => ({
      ...prev,
      ui: { ...(prev.ui || {}), demo_projects: next },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSettingsUpdate(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Site Title
          </label>
          <Input
            type="text"
            value={localSettings.siteTitle}
            onChange={(e) => handleSettingChange("siteTitle", e.target.value)}
            placeholder="WisdomInTech"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Site Tagline
          </label>
          <Input
            type="text"
            value={localSettings.siteTagline}
            onChange={(e) => handleSettingChange("siteTagline", e.target.value)}
            placeholder="Neo-Cyberpunk Experience"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Site Description
        </label>
        <textarea
          value={localSettings.siteDescription}
          onChange={(e) =>
            handleSettingChange("siteDescription", e.target.value)
          }
          rows={4}
          className="w-full px-4 py-3 bg-surface border border-border-accent/20 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="A futuristic portfolio showcasing cutting-edge development work..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Contact Email
          </label>
          <Input
            type="email"
            value={localSettings.contactEmail}
            onChange={(e) =>
              handleSettingChange("contactEmail", e.target.value)
            }
            placeholder="hello@wisdomintech.dev"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Admin Email
          </label>
          <Input
            type="email"
            value={localSettings.adminEmail}
            onChange={(e) => handleSettingChange("adminEmail", e.target.value)}
            placeholder="admin@wisdomintech.dev"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Toast Duration (ms)
          </label>
          <Input
            type="number"
            min="1000"
            step="500"
            value={localSettings.ui?.toast_duration_ms ?? 3500}
            onChange={(e) =>
              handleUiSettingChange(
                "toast_duration_ms",
                Math.max(0, Number(e.target.value) || 0),
              )
            }
            placeholder="3500"
          />
          <div className="text-xs text-text-secondary font-caption mt-1">
            How long to show notifications. Set to 0 to require manual
            dismissal.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center space-x-3">
          <Icon name="Video" size={20} className="text-primary" />
          <div>
            <div className="font-medium text-text-primary">Video Display</div>
            <div className="text-sm text-text-secondary font-caption">
              Enable video backgrounds and media
            </div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!!localSettings.enableVideo}
            onChange={(e) =>
              handleSettingChange("enableVideo", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-4">
          Default Theme
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.isArray(localSettings.ui?.theme_presets) &&
          localSettings.ui.theme_presets.length > 0
            ? localSettings.ui.theme_presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() =>
                    handleSettingChange("defaultTheme", preset.name)
                  }
                  className={`p-4 rounded-lg border-2 transition-all duration-fast ${
                    localSettings.defaultTheme === preset.name
                      ? "border-primary bg-primary/10"
                      : "border-border-accent/20 hover:border-primary/50"
                  }`}
                >
                  <div
                    className="w-full h-16 rounded-lg mb-3 flex overflow-hidden"
                    style={{
                      background: preset.background || "#111827",
                    }}
                  >
                    <div
                      className="flex-1 h-full"
                      style={{
                        background: preset.primary || "#6366f1",
                        opacity: 0.85,
                      }}
                    ></div>
                    <div
                      className="flex-1 h-full"
                      style={{
                        background: preset.accent || "#f59e0b",
                        opacity: 0.65,
                      }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium text-text-primary capitalize flex items-center justify-between">
                    <span>{preset.name}</span>
                    {localSettings.defaultTheme === preset.name && (
                      <Icon name="Check" size={16} className="text-primary" />
                    )}
                  </div>
                </button>
              ))
            : ["cyberpunk", "neural", "futuristic", "light"].map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleSettingChange("defaultTheme", theme)}
                  className={`p-4 rounded-lg border-2 transition-all duration-fast ${
                    localSettings.defaultTheme === theme
                      ? "border-primary bg-primary/10"
                      : "border-border-accent/20 hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`w-full h-16 rounded-lg mb-3 ${
                      theme === "cyberpunk"
                        ? "bg-gradient-to-br from-primary to-secondary"
                        : theme === "neural"
                          ? "bg-gradient-to-br from-accent to-primary"
                          : theme === "futuristic"
                            ? "bg-gradient-to-br from-secondary to-accent"
                            : "bg-gradient-to-br from-gray-300 to-gray-500"
                    }`}
                  ></div>
                  <div className="text-sm font-medium text-text-primary capitalize">
                    {theme}
                  </div>
                </button>
              ))}
        </div>
        {Array.isArray(localSettings.ui?.theme_presets) && (
          <div className="mt-4 text-xs text-text-secondary font-caption">
            Theme presets are stored in settings.ui.theme_presets. You can
            extend them via a migration/patch.
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-4">
          Font Size Options
        </label>
        <div className="flex items-center space-x-4">
          {["small", "medium", "large"].map((size) => (
            <button
              key={size}
              onClick={() => handleSettingChange("defaultFontSize", size)}
              className={`px-4 py-2 rounded-lg border transition-all duration-fast ${
                localSettings.defaultFontSize === size
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border-accent/20 text-text-secondary hover:border-primary/50"
              }`}
            >
              <span
                className={`${
                  size === "small"
                    ? "text-sm"
                    : size === "large"
                      ? "text-lg"
                      : "text-base"
                }`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FileUpload
            label="Logo"
            value={localSettings.logoUrl}
            onChange={(url) => handleSettingChange("logoUrl", url)}
            bucket="logos"
            pathPrefix="logos"
            accept="image"
            helperText="Upload a PNG/SVG logo."
          />
        </div>
        <div>
          <FileUpload
            label="Favicon"
            value={localSettings.faviconUrl}
            onChange={(url) => handleSettingChange("faviconUrl", url)}
            bucket="logos"
            pathPrefix="favicons"
            accept="icon"
            helperText="Upload a .ico or PNG square icon."
          />
        </div>
      </div>

      <div>
        <FileUpload
          label="Resume/CV"
          value={localSettings.resumeUrl}
          onChange={(url) => handleSettingChange("resumeUrl", url)}
          bucket="media"
          pathPrefix="documents"
          accept="document"
          helperText="Upload your resume/CV as PDF, DOC, or DOCX."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
          <Icon name="Video" size={16} className="text-primary" />
          Hero Background Video (optional)
        </label>
        <div className="text-xs text-text-secondary font-caption mb-2">
          Provide a short, muted background video for the hero section. MP4/WebM
          recommended. Keep under ~10MB for performance.
        </div>
        <FileUpload
          label=""
          value={localSettings.ui?.hero_video_url || ""}
          onChange={(url) => handleUiSettingChange("hero_video_url", url)}
          bucket="media"
          pathPrefix="videos"
          accept="video"
          helperText="Accepted: mp4, webm, ogg. Autoplay is muted."
        />
      </div>
    </div>
  );

  const renderContentSettings = () => (
    <div className="space-y-8">
      {/* Hero Section Settings */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Hero Section
        </h3>

        {/* Hero Profile Image */}
        <div className="mb-6">
          <FileUpload
            label="Hero Profile Image"
            value={localSettings.hero_image_url || ""}
            onChange={(url) => handleSettingChange("hero_image_url", url)}
            bucket="media"
            pathPrefix="hero"
            accept="image"
            helperText="Upload your profile image for the hero section. Recommended: 400x400px."
          />
        </div>

        {/* Hero Video Background */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
            <Icon name="Video" size={16} className="text-primary" />
            Hero Background Video (optional)
          </label>
          <div className="text-xs text-text-secondary font-caption mb-2">
            Provide a short, muted background video for the hero section.
            MP4/WebM recommended. Keep under ~10MB for performance.
          </div>
          <FileUpload
            label=""
            value={localSettings.ui?.hero_video_url || ""}
            onChange={(url) => handleUiSettingChange("hero_video_url", url)}
            bucket="media"
            pathPrefix="videos"
            accept="video"
            helperText="Accepted: mp4, webm, ogg. Autoplay is muted."
          />
        </div>
      </div>

      {/* Demo Projects Settings */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Demo Projects
        </h3>
        <p className="text-sm text-text-secondary font-caption mb-4">
          Manage the demo projects shown in the homepage carousel. These are
          showcase projects for visitors.
        </p>
        {renderDemoProjectsSettings()}
      </div>
    </div>
  );

  const renderDemoProjectsSettings = () => {
    const projects = localSettings.ui?.demo_projects || [];
    const updateProject = (idx, patch) => {
      const next = projects.map((p, i) => (i === idx ? { ...p, ...patch } : p));
      handleDemoProjectsChange(next);
    };
    const addProject = () => {
      const next = [
        ...projects,
        {
          title: "",
          description: "",
          image: "",
          tech: [],
          status: "Live",
          category: "",
          liveUrl: "",
          githubUrl: "",
        },
      ];
      handleDemoProjectsChange(next);
    };
    const removeProject = (idx) => {
      const next = projects.filter((_, i) => i !== idx);
      handleDemoProjectsChange(next);
    };
    const moveProject = (from, to) => {
      if (to < 0 || to >= projects.length) return;
      const next = [...projects];
      const [project] = next.splice(from, 1);
      next.splice(to, 0, project);
      handleDemoProjectsChange(next);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-semibold text-text-primary">
              Projects Showcase
            </h4>
            <p className="text-sm text-text-secondary">
              Add and manage demo projects for the homepage carousel.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={addProject}
            iconName="Plus"
            iconPosition="left"
          >
            Add Project
          </Button>
        </div>

        {projects.length === 0 && (
          <div className="text-center py-8 border border-border-accent/20 rounded-lg bg-surface/30">
            <Icon
              name="FolderOpen"
              size={48}
              className="mx-auto text-text-secondary mb-4"
            />
            <h4 className="text-lg font-semibold text-text-primary mb-2">
              No Demo Projects
            </h4>
            <p className="text-text-secondary mb-4">
              Add demo projects to showcase your work on the homepage.
            </p>
            <Button
              variant="primary"
              onClick={addProject}
              iconName="Plus"
              iconPosition="left"
            >
              Add Your First Project
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-border-accent/20 bg-surface/30"
            >
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg font-semibold text-text-primary">
                  Project #{idx + 1}
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    iconName="ArrowUp"
                    onClick={() => moveProject(idx, idx - 1)}
                    disabled={idx === 0}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    iconName="ArrowDown"
                    onClick={() => moveProject(idx, idx + 1)}
                    disabled={idx === projects.length - 1}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    iconName="Trash2"
                    onClick={() => removeProject(idx)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">
                    Title *
                  </label>
                  <Input
                    value={project.title}
                    onChange={(e) =>
                      updateProject(idx, { title: e.target.value })
                    }
                    placeholder="Project title"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">
                    Category
                  </label>
                  <Input
                    value={project.category}
                    onChange={(e) =>
                      updateProject(idx, { category: e.target.value })
                    }
                    placeholder="e.g., FinTech, AI/ML, Security"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-text-secondary mb-1">
                  Description
                </label>
                <textarea
                  value={project.description}
                  onChange={(e) =>
                    updateProject(idx, { description: e.target.value })
                  }
                  placeholder="Brief description of the project..."
                  className="w-full px-3 py-2 border border-border-accent/20 rounded-lg bg-background/50 text-text-primary resize-none"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <FileUpload
                  label="Project Image"
                  value={project.image}
                  onChange={(url) => updateProject(idx, { image: url })}
                  bucket="media"
                  pathPrefix="projects"
                  accept="image"
                  helperText="Upload project screenshot or demo image."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">
                    Status
                  </label>
                  <select
                    value={project.status}
                    onChange={(e) =>
                      updateProject(idx, { status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border-accent/20 rounded-lg bg-background/50 text-text-primary"
                  >
                    <option value="Live">Live</option>
                    <option value="Development">Development</option>
                    <option value="Beta">Beta</option>
                    <option value="Research">Research</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">
                    Live URL (optional)
                  </label>
                  <Input
                    value={project.liveUrl || ""}
                    onChange={(e) =>
                      updateProject(idx, { liveUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">
                    GitHub URL (optional)
                  </label>
                  <Input
                    value={project.githubUrl || ""}
                    onChange={(e) =>
                      updateProject(idx, { githubUrl: e.target.value })
                    }
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">
                  Technologies (comma-separated)
                </label>
                <Input
                  value={
                    Array.isArray(project.tech) ? project.tech.join(", ") : ""
                  }
                  onChange={(e) =>
                    updateProject(idx, {
                      tech: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => t),
                    })
                  }
                  placeholder="React, Node.js, PostgreSQL, Docker"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTechStackSettings = () => {
    const stack = localSettings.ui?.tech_stack || [];
    const updateItem = (idx, patch) => {
      const next = stack.map((t, i) => (i === idx ? { ...t, ...patch } : t));
      handleTechStackChange(next);
    };
    const addItem = () => {
      const next = [
        ...stack,
        {
          name: "",
          icon: "Code",
          category: "",
          proficiency: 50,
          description: "",
        },
      ];
      handleTechStackChange(next);
    };
    const removeItem = (idx) => {
      const next = stack.filter((_, i) => i !== idx);
      handleTechStackChange(next);
    };
    const moveItem = (from, to) => {
      if (to < 0 || to >= stack.length) return;
      const next = [...stack];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      handleTechStackChange(next);
    };
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-primary">
              Technology Stack
            </h3>
            <p className="text-sm text-text-secondary font-caption">
              Manage the technologies shown on the home page grid.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={addItem}
            iconName="Plus"
            iconPosition="left"
          >
            Add
          </Button>
        </div>
        {stack.length === 0 && (
          <div className="text-sm text-text-secondary">
            No items yet. Click Add to create your first tech.
          </div>
        )}
        <div className="space-y-3">
          {stack.map((tech, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-border-accent/20 bg-surface"
            >
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                <div className="md:col-span-1">
                  <label className="block text-xs text-text-secondary mb-1">
                    Name
                  </label>
                  <Input
                    value={tech.name}
                    onChange={(e) => updateItem(idx, { name: e.target.value })}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs text-text-secondary mb-1">
                    Icon
                  </label>
                  <Input
                    value={tech.icon}
                    onChange={(e) => updateItem(idx, { icon: e.target.value })}
                    placeholder="e.g., Code, Server"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs text-text-secondary mb-1">
                    Category
                  </label>
                  <Input
                    value={tech.category}
                    onChange={(e) =>
                      updateItem(idx, { category: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs text-text-secondary mb-1">
                    Proficiency (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={tech.proficiency ?? 0}
                    onChange={(e) =>
                      updateItem(idx, {
                        proficiency: Math.max(
                          0,
                          Math.min(100, Number(e.target.value) || 0),
                        ),
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-text-secondary mb-1">
                    Description
                  </label>
                  <Input
                    value={tech.description || ""}
                    onChange={(e) =>
                      updateItem(idx, { description: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  iconName="ArrowUp"
                  onClick={() => moveItem(idx, idx - 1)}
                  title="Move up"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  iconName="ArrowDown"
                  onClick={() => moveItem(idx, idx + 1)}
                  title="Move down"
                />
                <Button
                  size="sm"
                  variant="danger"
                  iconName="Trash2"
                  onClick={() => removeItem(idx)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSocialSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Icon name="Twitter" size={16} className="inline mr-2" />X (Twitter)
            Username
          </label>
          <Input
            type="text"
            value={localSettings.socialMedia.twitter}
            onChange={(e) =>
              handleSettingChange("socialMedia", {
                ...localSettings.socialMedia,
                twitter: e.target.value,
              })
            }
            placeholder="mikael_kraft"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Icon name="Linkedin" size={16} className="inline mr-2" />
            LinkedIn Profile
          </label>
          <Input
            type="text"
            value={localSettings.socialMedia.linkedin}
            onChange={(e) =>
              handleSettingChange("socialMedia", {
                ...localSettings.socialMedia,
                linkedin: e.target.value,
              })
            }
            placeholder="in/mikael-kraft"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Icon name="Github" size={16} className="inline mr-2" />
            GitHub Username
          </label>
          <Input
            type="text"
            value={localSettings.socialMedia.github}
            onChange={(e) =>
              handleSettingChange("socialMedia", {
                ...localSettings.socialMedia,
                github: e.target.value,
              })
            }
            placeholder="mikaelkraft"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Icon name="Mail" size={16} className="inline mr-2" />
            Contact Email Display
          </label>
          <Input
            type="email"
            value={localSettings.socialMedia.email}
            onChange={(e) =>
              handleSettingChange("socialMedia", {
                ...localSettings.socialMedia,
                email: e.target.value,
              })
            }
            placeholder="mikewillkraft@gmail.com"
          />
        </div>
      </div>
    </div>
  );

  const renderSEOSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Meta Keywords
        </label>
        <Input
          type="text"
          value={localSettings.seo.keywords}
          onChange={(e) =>
            handleSettingChange("seo", {
              ...localSettings.seo,
              keywords: e.target.value,
            })
          }
          placeholder="portfolio, developer, cyberpunk, react, javascript"
        />
        <div className="text-xs text-text-secondary font-caption mt-1">
          Separate keywords with commas
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Open Graph Image
        </label>
        <Input
          type="url"
          value={localSettings.seo.ogImage}
          onChange={(e) =>
            handleSettingChange("seo", {
              ...localSettings.seo,
              ogImage: e.target.value,
            })
          }
          placeholder="https://example.com/og-image.jpg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Google Analytics ID
          </label>
          <Input
            type="text"
            value={localSettings.seo.googleAnalytics}
            onChange={(e) =>
              handleSettingChange("seo", {
                ...localSettings.seo,
                googleAnalytics: e.target.value,
              })
            }
            placeholder="GA-XXXXXXXXX-X"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Google Search Console
          </label>
          <Input
            type="text"
            value={localSettings.seo.searchConsole}
            onChange={(e) =>
              handleSettingChange("seo", {
                ...localSettings.seo,
                searchConsole: e.target.value,
              })
            }
            placeholder="verification-code"
          />
        </div>
      </div>
    </div>
  );

  const renderMonetizationSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Ad Provider
        </label>
        <select
          className="w-full px-4 py-2 bg-surface border border-border-accent/20 rounded-lg text-text-primary"
          value={localSettings.ads?.provider || "adsense"}
          onChange={(e) => handleAdsSettingChange("provider", e.target.value)}
        >
          <option value="adsense">Google AdSense</option>
          <option value="yllix">Yllix</option>
          <option value="custom">Custom Script</option>
        </select>
      </div>
      <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg border border-accent/20">
        <div className="flex items-center space-x-3">
          <Icon name="BadgeDollarSign" size={20} className="text-accent" />
          <div>
            <div className="font-medium text-text-primary">
              Enable Blog Ads (AdSense)
            </div>
            <div className="text-sm text-text-secondary font-caption">
              Show ads in the blog grid and optionally enable Auto Ads
            </div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!!localSettings.ads?.enabled}
            onChange={(e) =>
              handleAdsSettingChange("enabled", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface rounded-full peer peer-checked:bg-accent"></div>
        </label>
      </div>

      {(!localSettings.ads?.provider ||
        localSettings.ads?.provider === "adsense") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              AdSense Publisher ID
            </label>
            <Input
              type="text"
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              value={localSettings.ads?.publisher_id || ""}
              onChange={(e) =>
                handleAdsSettingChange("publisher_id", e.target.value)
              }
            />
            <div className="text-xs text-text-secondary font-caption mt-1">
              Required by AdSense. Copy from your AdSense account.
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Ad Slot ID (optional)
            </label>
            <Input
              type="text"
              placeholder="1234567890"
              value={localSettings.ads?.ad_slot || ""}
              onChange={(e) =>
                handleAdsSettingChange("ad_slot", e.target.value)
              }
            />
            <div className="text-xs text-text-secondary font-caption mt-1">
              If empty, only Auto Ads are used (if enabled).
            </div>
          </div>
        </div>
      )}

      {localSettings.ads?.provider === "yllix" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Yllix Publisher ID
            </label>
            <Input
              type="text"
              placeholder="Your Yllix publisher id"
              value={localSettings.ads?.yllix_publisher_id || ""}
              onChange={(e) =>
                handleAdsSettingChange("yllix_publisher_id", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Yllix Ad Unit Code
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 bg-surface border border-border-accent/20 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Paste the ad unit script snippet provided by Yllix"
              value={localSettings.ads?.yllix_unit_code || ""}
              onChange={(e) =>
                handleAdsSettingChange("yllix_unit_code", e.target.value)
              }
            />
            <div className="text-xs text-text-secondary font-caption mt-1">
              We will inject this safely into the blog grid at your interval.
            </div>
          </div>
        </div>
      )}

      {localSettings.ads?.provider === "custom" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Custom Script URL
            </label>
            <Input
              type="url"
              placeholder="https://cdn.example.com/ads.js"
              value={localSettings.ads?.custom_script_url || ""}
              onChange={(e) =>
                handleAdsSettingChange("custom_script_url", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Custom Ad HTML
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 bg-surface border border-border-accent/20 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="<div class='your-ad'></div>"
              value={localSettings.ads?.custom_ad_html || ""}
              onChange={(e) =>
                handleAdsSettingChange("custom_ad_html", e.target.value)
              }
            />
            <div className="text-xs text-text-secondary font-caption mt-1">
              Custom HTML placed as ad content. Use responsibly.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-2">
          <input
            id="auto-ads"
            type="checkbox"
            className="w-4 h-4"
            checked={!!localSettings.ads?.auto_ads}
            onChange={(e) =>
              handleAdsSettingChange("auto_ads", e.target.checked)
            }
          />
          <label htmlFor="auto-ads" className="text-sm text-text-secondary">
            Enable Auto Ads
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Grid Ad Interval
          </label>
          <Input
            type="number"
            min="3"
            step="1"
            value={localSettings.ads?.grid_interval ?? 6}
            onChange={(e) =>
              handleAdsSettingChange(
                "grid_interval",
                Math.max(1, Number(e.target.value) || 6),
              )
            }
          />
          <div className="text-xs text-text-secondary font-caption mt-1">
            Insert an ad after this many posts (requires Ad Slot ID).
          </div>
        </div>
      </div>

      {/* Header Code Injection */}
      <div className="space-y-4">
        <h4 className="text-lg font-heading font-semibold text-text-primary flex items-center gap-2">
          <Icon name="Code" size={20} className="text-primary" />
          Code Injection
        </h4>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Header Code (HTML/JS)
          </label>
          <textarea
            className="w-full px-4 py-3 bg-surface border border-border-accent/20 rounded-lg text-text-primary font-mono text-sm resize-y"
            rows={6}
            placeholder="<!-- Analytics, ads, or custom scripts -->"
            value={localSettings.ads?.header_code || ""}
            onChange={(e) =>
              handleAdsSettingChange("header_code", e.target.value)
            }
          />
          <div className="text-xs text-text-secondary font-caption mt-1">
            Code injected in the &lt;head&gt; tag. Use for analytics, ads, or
            custom scripts.
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Footer Code (HTML/JS)
          </label>
          <textarea
            className="w-full px-4 py-3 bg-surface border border-border-accent/20 rounded-lg text-text-primary font-mono text-sm resize-y"
            rows={4}
            placeholder="<!-- Footer scripts -->"
            value={localSettings.ads?.footer_code || ""}
            onChange={(e) =>
              handleAdsSettingChange("footer_code", e.target.value)
            }
          />
          <div className="text-xs text-text-secondary font-caption mt-1">
            Code injected before the closing &lt;/body&gt; tag.
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-warning/5 rounded-lg border border-warning/20">
        <div className="flex items-center space-x-3">
          <Icon name="AlertTriangle" size={20} className="text-warning" />
          <div>
            <div className="font-medium text-text-primary">
              Maintenance Mode
            </div>
            <div className="text-sm text-text-secondary font-caption">
              Temporarily disable public access
            </div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.maintenanceMode}
            onChange={(e) =>
              handleSettingChange("maintenanceMode", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-warning/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warning"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Custom CSS
        </label>
        <textarea
          value={localSettings.customCSS}
          onChange={(e) => handleSettingChange("customCSS", e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-surface border border-border-accent/20 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none font-code text-sm"
          placeholder="/* Add your custom CSS here */"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Custom JavaScript
        </label>
        <textarea
          value={localSettings.customJS}
          onChange={(e) => handleSettingChange("customJS", e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-surface border border-border-accent/20 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none font-code text-sm"
          placeholder="// Add your custom JavaScript here"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">
            Site Settings
          </h1>
          <p className="text-text-secondary font-caption mt-2">
            Configure your portfolio website settings and preferences
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              iconName="Save"
              iconPosition="left"
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-lg border border-border-accent/20 overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-fast ${
                activeTab === tab.id
                  ? "text-primary bg-primary/10 border-b-2 border-primary"
                  : "text-text-secondary hover:text-primary hover:bg-primary/5"
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "general" && renderGeneralSettings()}
          {activeTab === "appearance" && renderAppearanceSettings()}
          {activeTab === "content" && renderContentSettings()}
          {activeTab === "tech" && renderTechStackSettings()}
          {activeTab === "social" && renderSocialSettings()}
          {activeTab === "seo" && renderSEOSettings()}
          {activeTab === "monetization" && renderMonetizationSettings()}
          {activeTab === "advanced" && renderAdvancedSettings()}
        </div>
      </div>

      {/* Save Notice */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-primary text-background px-6 py-3 rounded-lg shadow-glow-primary">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} />
            <span className="text-sm font-medium">
              You have unsaved changes
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteSettings;
