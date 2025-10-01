import React, { useState, useEffect } from "react";
// Removed Helmet; centralized SEO handled elsewhere
import HeaderNavigation from "../../components/ui/HeaderNavigation";
import DynamicFooter from "../portfolio-home-hero/components/DynamicFooter";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";

const Documentation = () => {
  const [currentTheme, setCurrentTheme] = useState("cyberpunk");
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    // Get theme from localStorage
    const savedTheme = localStorage.getItem("theme") || "cyberpunk";
    setCurrentTheme(savedTheme);
  }, []);

  const sections = [
    { id: "overview", label: "Overview", icon: "Book" },
    { id: "api", label: "API Reference", icon: "Code" },
    { id: "usage", label: "Usage Guide", icon: "User" },
    { id: "examples", label: "Examples", icon: "FileText" },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-heading font-bold text-text-primary mb-4">
          Portfolio Platform Documentation
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed">
          Welcome to the WisdomInTech portfolio platform documentation. This
          guide will help you understand how to use and extend the portfolio
          platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface/20 rounded-lg p-6 border border-border-accent/20">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Zap" size={24} className="text-primary" />
            <h3 className="text-xl font-heading font-semibold text-text-primary">
              Quick Start
            </h3>
          </div>
          <p className="text-text-secondary mb-4">
            Get up and running with the portfolio platform in minutes.
          </p>
          <Button
            variant="outline"
            onClick={() => setActiveSection("usage")}
            iconName="ArrowRight"
            iconPosition="right"
          >
            View Usage Guide
          </Button>
        </div>

        <div className="bg-surface/20 rounded-lg p-6 border border-border-accent/20">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Code" size={24} className="text-secondary" />
            <h3 className="text-xl font-heading font-semibold text-text-primary">
              API Reference
            </h3>
          </div>
          <p className="text-text-secondary mb-4">
            Explore the available API endpoints and their usage.
          </p>
          <Button
            variant="outline"
            onClick={() => setActiveSection("api")}
            iconName="ArrowRight"
            iconPosition="right"
          >
            View API Docs
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-heading font-semibold text-text-primary mb-4">
          Platform Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-surface/10 rounded-lg border border-border-accent/10">
            <Icon name="Image" size={20} className="text-primary" />
            <span className="text-text-primary">Image Projects</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-surface/10 rounded-lg border border-border-accent/10">
            <Icon name="Video" size={20} className="text-primary" />
            <span className="text-text-primary">Video Projects</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-surface/10 rounded-lg border border-border-accent/10">
            <Icon name="Grid3x3" size={20} className="text-primary" />
            <span className="text-text-primary">Logo Galleries</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-surface/10 rounded-lg border border-border-accent/10">
            <Icon name="FileText" size={20} className="text-primary" />
            <span className="text-text-primary">Blog System</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-surface/10 rounded-lg border border-border-accent/10">
            <Icon name="Upload" size={20} className="text-primary" />
            <span className="text-text-primary">File Uploads</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-surface/10 rounded-lg border border-border-accent/10">
            <Icon name="Shield" size={20} className="text-primary" />
            <span className="text-text-primary">Admin Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAPI = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-heading font-bold text-text-primary mb-4">
          API Reference
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed">
          The portfolio platform provides a RESTful API for managing content and
          retrieving data.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-surface/20 rounded-lg p-6 border border-border-accent/20">
          <h3 className="text-xl font-heading font-semibold text-text-primary mb-4">
            Projects API
          </h3>

          <div className="space-y-4">
            <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-success/20 text-success rounded text-sm font-mono">
                  GET
                </span>
                <code className="text-primary font-mono">/api/projects</code>
              </div>
              <p className="text-text-secondary text-sm mb-2">
                Get all projects with optional filters
              </p>
              <div className="text-xs text-text-secondary">
                <strong>Query Parameters:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>
                    <code>published</code> - Filter by published status
                    (true/false)
                  </li>
                  <li>
                    <code>featured</code> - Filter by featured status
                    (true/false)
                  </li>
                  <li>
                    <code>limit</code> - Limit number of results (default: 100)
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-success/20 text-success rounded text-sm font-mono">
                  GET
                </span>
                <code className="text-primary font-mono">
                  /api/projects/by-id?id={"{uuid}"}
                </code>
              </div>
              <p className="text-text-secondary text-sm">
                Get a specific project by ID
              </p>
            </div>

            <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-warning/20 text-warning rounded text-sm font-mono">
                  POST
                </span>
                <code className="text-primary font-mono">/api/projects</code>
              </div>
              <p className="text-text-secondary text-sm">
                Create a new project (requires authentication)
              </p>
            </div>

            <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm font-mono">
                  PUT
                </span>
                <code className="text-primary font-mono">
                  /api/projects?id={"{uuid}"}
                </code>
              </div>
              <p className="text-text-secondary text-sm">
                Update an existing project (requires authentication)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface/20 rounded-lg p-6 border border-border-accent/20">
          <h3 className="text-xl font-heading font-semibold text-text-primary mb-4">
            Settings API
          </h3>

          <div className="space-y-4">
            <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-success/20 text-success rounded text-sm font-mono">
                  GET
                </span>
                <code className="text-primary font-mono">/api/settings</code>
              </div>
              <p className="text-text-secondary text-sm">
                Get site settings and configuration
              </p>
            </div>

            <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm font-mono">
                  PUT
                </span>
                <code className="text-primary font-mono">/api/settings</code>
              </div>
              <p className="text-text-secondary text-sm">
                Update site settings (requires authentication)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface/20 rounded-lg p-6 border border-border-accent/20">
          <h3 className="text-xl font-heading font-semibold text-text-primary mb-4">
            Blog API
          </h3>

          <div className="space-y-4">
            <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-success/20 text-success rounded text-sm font-mono">
                  GET
                </span>
                <code className="text-primary font-mono">/api/blog</code>
              </div>
              <p className="text-text-secondary text-sm">Get all blog posts</p>
            </div>

            <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-success/20 text-success rounded text-sm font-mono">
                  GET
                </span>
                <code className="text-primary font-mono">
                  /api/blog/by-slug?slug={"{slug}"}
                </code>
              </div>
              <p className="text-text-secondary text-sm">
                Get a specific blog post by slug
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsage = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-heading font-bold text-text-primary mb-4">
          Usage Guide
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed">
          Learn how to use the portfolio platform effectively.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-surface/20 rounded-lg p-6 border border-border-accent/20">
          <h3 className="text-xl font-heading font-semibold text-text-primary mb-4">
            Managing Projects
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                Creating Projects
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary">
                <li>Navigate to the Admin Dashboard</li>
                <li>Click on "Projects Management"</li>
                <li>Click "New Project" button</li>
                <li>
                  Fill in project details:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>
                      <strong>Title:</strong> Project name
                    </li>
                    <li>
                      <strong>Type:</strong> Choose from Image, Video, Gallery,
                      or Logo Gallery
                    </li>
                    <li>
                      <strong>Description:</strong> Brief project description
                    </li>
                    <li>
                      <strong>Featured Image:</strong> Main project image
                    </li>
                    <li>
                      <strong>Technologies:</strong> Comma-separated list of
                      technologies used
                    </li>
                  </ul>
                </li>
                <li>Click "Create" to save the project</li>
              </ol>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                Project Types
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Image" size={20} className="text-primary" />
                    <strong className="text-text-primary">Image Project</strong>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Standard project with a featured image and description.
                  </p>
                </div>

                <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Video" size={20} className="text-primary" />
                    <strong className="text-text-primary">Video Project</strong>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Project showcasing a video with optional poster image.
                  </p>
                </div>

                <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Grid3x3" size={20} className="text-primary" />
                    <strong className="text-text-primary">Image Gallery</strong>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Collection of images displayed in a grid layout.
                  </p>
                </div>

                <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Layout" size={20} className="text-primary" />
                    <strong className="text-text-primary">Logo Gallery</strong>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Infinite scrolling carousel of logos and brand designs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface/20 rounded-lg p-6 border border-border-accent/20">
          <h3 className="text-xl font-heading font-semibold text-text-primary mb-4">
            File Management
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                Supported File Types
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
                  <strong className="text-text-primary">Images</strong>
                  <p className="text-text-secondary text-sm mt-1">
                    JPG, PNG, WebP, SVG
                  </p>
                </div>
                <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
                  <strong className="text-text-primary">Videos</strong>
                  <p className="text-text-secondary text-sm mt-1">
                    MP4, WebM, OGG
                  </p>
                </div>
                <div className="bg-surface/10 rounded-lg p-4 border border-border-accent/10">
                  <strong className="text-text-primary">Documents</strong>
                  <p className="text-text-secondary text-sm mt-1">
                    PDF, DOC, DOCX
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                Upload Guidelines
              </h4>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>Keep file sizes under 10MB for optimal performance</li>
                <li>Use descriptive filenames</li>
                <li>Optimize images before uploading</li>
                <li>For videos, provide a poster image for better UX</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExamples = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-heading font-bold text-text-primary mb-4">
          Examples
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed">
          Practical examples of using the portfolio platform.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-surface/20 rounded-lg p-6 border border-border-accent/20">
          <h3 className="text-xl font-heading font-semibold text-text-primary mb-4">
            API Usage Examples
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                Fetch All Published Projects
              </h4>
              <div className="bg-background/50 rounded-lg p-4 border border-border-accent/10">
                <pre className="text-sm text-text-secondary overflow-x-auto">
                  {`fetch('/api/projects?published=true')
  .then(response => response.json())
  .then(projects => {
    console.log('Published projects:', projects);
  });`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                Get Featured Projects
              </h4>
              <div className="bg-background/50 rounded-lg p-4 border border-border-accent/10">
                <pre className="text-sm text-text-secondary overflow-x-auto">
                  {`fetch('/api/projects?featured=true&limit=6')
  .then(response => response.json())
  .then(projects => {
    console.log('Featured projects:', projects);
  });`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                Create a New Project
              </h4>
              <div className="bg-background/50 rounded-lg p-4 border border-border-accent/10">
                <pre className="text-sm text-text-secondary overflow-x-auto">
                  {`const projectData = {
  title: "My New Project",
  description: "A detailed description of the project",
  type: "image",
  featured_image: "https://example.com/image.jpg",
  tags: ["React", "Node.js"],
  status: "published"
};

fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify(projectData)
})
.then(response => response.json())
.then(result => {
  console.log('Project created:', result);
});`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface/20 rounded-lg p-6 border border-border-accent/20">
          <h3 className="text-xl font-heading font-semibold text-text-primary mb-4">
            Integration Examples
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                React Component Example
              </h4>
              <div className="bg-background/50 rounded-lg p-4 border border-border-accent/10">
                <pre className="text-sm text-text-secondary overflow-x-auto">
                  {`import React, { useState, useEffect } from 'react';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects?published=true');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <div key={project.id} className="project-card">
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <img src={project.featured_image} alt={project.title} />
        </div>
      ))}
    </div>
  );
};`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "api":
        return renderAPI();
      case "usage":
        return renderUsage();
      case "examples":
        return renderExamples();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Documentation - WisdomInTech Portfolio</title>
        <meta
          name="description"
          content="Documentation and API reference for the WisdomInTech portfolio platform"
        />
      </Helmet>

      <HeaderNavigation currentTheme={currentTheme} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface/20"
                    }`}
                  >
                    <Icon name={section.icon} size={20} />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">{renderContent()}</div>
        </div>
      </div>

      <DynamicFooter currentTheme={currentTheme} />
    </div>
  );
};

export default Documentation;
