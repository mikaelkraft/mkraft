import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Removed Helmet; global OGMeta / Canonical handle SEO
import HeaderNavigation from "../../components/ui/HeaderNavigation";
import DynamicFooter from "../portfolio-home-hero/components/DynamicFooter";
import Icon from "../../components/AppIcon";
import Image from "../../components/AppImage";
import Button from "../../components/ui/Button";
import LogoCarousel from "../../components/ui/LogoCarousel";
import projectService from "../../utils/projectService";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTheme, setCurrentTheme] = useState("cyberpunk");

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const res = await projectService.getProjectById(id);
        if (res.success) {
          setProject(res.data);
          // Increment view count
          await projectService.incrementViewCount(id);
        } else {
          setError("Project not found");
        }
      } catch (err) {
        setError("Failed to load project");
        console.error("Error loading project:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProject();
    }
  }, [id]);

  useEffect(() => {
    // Get theme from localStorage
    const savedTheme = localStorage.getItem("theme") || "cyberpunk";
    setCurrentTheme(savedTheme);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderNavigation currentTheme={currentTheme} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading project...</p>
          </div>
        </div>
        <DynamicFooter currentTheme={currentTheme} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderNavigation currentTheme={currentTheme} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon
              name="AlertCircle"
              size={48}
              className="text-error mx-auto mb-4"
            />
            <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
              Project Not Found
            </h1>
            <p className="text-text-secondary mb-6">{error}</p>
            <Button
              onClick={() => navigate("/projects-portfolio-grid")}
              variant="primary"
            >
              Back to Projects
            </Button>
          </div>
        </div>
        <DynamicFooter currentTheme={currentTheme} />
      </div>
    );
  }

  const renderProjectContent = () => {
    switch (project.type) {
      case "video":
        return (
          <div className="space-y-6">
            {project.video_url && (
              <div className="aspect-video rounded-lg overflow-hidden bg-surface/20">
                <video
                  src={project.video_url}
                  poster={project.video_poster}
                  controls
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
        );
      case "gallery":
        return (
          <div className="space-y-6">
            {project.gallery_images && project.gallery_images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.gallery_images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden bg-surface/20"
                  >
                    <Image
                      src={image}
                      alt={`${project.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "logo_gallery":
        return (
          <div className="space-y-6">
            <LogoCarousel images={project.gallery_images || []} />
            {project.gallery_images && project.gallery_images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                {project.gallery_images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden bg-surface/20 p-4 flex items-center justify-center"
                  >
                    <Image
                      src={image}
                      alt={`Logo ${index + 1}`}
                      className="max-w-full max-h-full object-contain hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {project.featured_image && (
              <div className="aspect-video rounded-lg overflow-hidden bg-surface/20">
                <Image
                  src={project.featured_image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Title & description meta handled centrally (OGMeta) */}

      <HeaderNavigation currentTheme={currentTheme} />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Back button */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/projects-portfolio-grid")}
            variant="ghost"
            iconName="ArrowLeft"
            iconPosition="left"
            className="text-text-secondary hover:text-primary"
          >
            Back to Projects
          </Button>
        </div>

        {/* Project header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-heading font-bold text-text-primary">
              {project.title}
            </h1>
            {project.featured && (
              <Icon name="Star" size={28} className="text-accent" />
            )}
            <div
              className={`px-3 py-1 rounded-full text-sm font-caption ${
                project.status === "published"
                  ? "bg-success/20 text-success border border-success/30"
                  : "bg-warning/20 text-warning border border-warning/30"
              }`}
            >
              {project.status.toUpperCase()}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-caption bg-primary/20 text-primary border border-primary/30`}
            >
              {project.type?.replace("_", " ").toUpperCase() || "PROJECT"}
            </div>
          </div>

          {project.description && (
            <p className="text-lg text-text-secondary leading-relaxed max-w-4xl">
              {project.description}
            </p>
          )}
        </div>

        {/* Project content */}
        <div className="mb-12">{renderProjectContent()}</div>

        {/* Project details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {project.content && (
              <div>
                <h2 className="text-2xl font-heading font-semibold text-text-primary mb-4">
                  Project Overview
                </h2>
                <div className="prose prose-lg text-text-secondary">
                  {project.content}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Technologies */}
            {project.tags && project.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-caption border border-primary/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="space-y-4">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-surface/20 rounded-lg border border-border-accent/20 hover:border-primary/30 transition-colors"
                >
                  <Icon
                    name="Github"
                    size={20}
                    className="text-text-secondary"
                  />
                  <span className="text-text-primary font-medium">
                    View Source Code
                  </span>
                  <Icon
                    name="ExternalLink"
                    size={16}
                    className="text-text-secondary ml-auto"
                  />
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-surface/20 rounded-lg border border-border-accent/20 hover:border-primary/30 transition-colors"
                >
                  <Icon
                    name="ExternalLink"
                    size={20}
                    className="text-text-secondary"
                  />
                  <span className="text-text-primary font-medium">
                    View Live Project
                  </span>
                  <Icon
                    name="ExternalLink"
                    size={16}
                    className="text-text-secondary ml-auto"
                  />
                </a>
              )}
            </div>

            {/* Project stats */}
            <div className="bg-surface/20 rounded-lg p-6 border border-border-accent/20">
              <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
                Project Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Views</span>
                  <span className="text-text-primary font-medium">
                    {project.view_count || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Likes</span>
                  <span className="text-text-primary font-medium">
                    {project.like_count || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Created</span>
                  <span className="text-text-primary font-medium">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DynamicFooter currentTheme={currentTheme} />
    </div>
  );
};

export default ProjectDetail;
