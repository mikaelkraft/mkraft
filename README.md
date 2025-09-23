# Mikael Kraft Portfolio

A modern, full-stack portfolio website showcasing projects, blog posts, and professional experience. Built with React, Node.js, and PostgreSQL.

## 🚀 Features

- **Modern Portfolio Website** - Showcase projects, skills, and professional experience
- **Content Management System** - Admin dashboard for managing projects and blog posts
- **Blog Platform** - Integrated blog with categories, tags, and commenting system
- **Project Showcase** - Dynamic project grid with filtering and detailed views
- **Dual Backend Support** - Works with both Supabase and custom PostgreSQL + Express API
- **React 18** - Latest React with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - Efficient state management
- **TailwindCSS** - Modern utility-first CSS framework with custom themes
- **React Router v6** - Client-side routing with protected admin routes
- **Data Visualization** - Integrated charts and analytics
- **Form Management** - React Hook Form for efficient form handling
- **Animation** - Framer Motion for smooth UI animations
- **Responsive Design** - Mobile-first design with dark/light theme support

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn
- PostgreSQL database (Neon, Railway, Render, or Supabase)
- Optional: Supabase account for auth and storage

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mikaelkraft/mkraft.git
   cd mkraft
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database and Supabase credentials
   ```

4. Initialize database (if using custom PostgreSQL):
   ```bash
   npm run migrate
   npm run seed  # Optional: add sample data
   ```

5. Start the development servers:
   ```bash
   # Start both client and API
   npm run dev
   
   # Or start separately:
   npm run dev:client  # Frontend on http://localhost:4028
   npm run dev:api     # API on http://localhost:5000
   ```

## 📁 Project Structure

```
mkraft/
├── api/                    # Serverless API endpoints
│   ├── blog/              # Blog-related endpoints
│   ├── projects/          # Project-related endpoints
│   ├── settings/          # Site settings endpoints
│   └── ...
├── db/                    # Database schema and migrations
├── public/                # Static assets
├── scripts/               # Database migration and seeding scripts
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   └── ui/           # General UI components
│   ├── contexts/         # React contexts (Auth, Toast)
│   ├── pages/            # Page components
│   │   ├── portfolio-home-hero/           # Portfolio homepage
│   │   ├── projects-portfolio-grid/       # Projects showcase
│   │   ├── blog-content-hub/             # Blog platform
│   │   └── admin-dashboard-content-management/  # Admin CMS
│   ├── styles/           # Global styles and Tailwind config
│   ├── utils/            # Utility functions and services
│   │   ├── api/          # API client utilities
│   │   ├── projectService.js    # Project data management
│   │   ├── blogService.js       # Blog data management
│   │   └── ...
│   ├── App.jsx           # Main application component
│   ├── Routes.jsx        # Application routes
│   └── index.jsx         # Application entry point
├── supabase/             # Supabase migrations and config
├── .env.example          # Environment variables template
├── server.js             # Express server for local development
├── package.json          # Project dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.mjs       # Vite configuration
```

## 🎯 Architecture

This portfolio supports two deployment modes:

### Mode 1: Supabase Only (Simple)
- Uses Supabase for database, auth, and storage
- Client-side data fetching
- Set `VITE_USE_API=false` in environment

### Mode 2: Custom API + PostgreSQL (Advanced)
- Custom Express API with PostgreSQL
- Supabase for auth and storage only
- Better performance and control
- Set `VITE_USE_API=true` in environment

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database
POSTGRES_URL=postgres://user:pass@host:5432/dbname
POSTGRES_SSL=true

# API Configuration
VITE_USE_API=true
VITE_API_BASE_URL=/api

# Supabase (for auth and storage)
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Admin
VITE_ADMIN_EMAIL=admin@example.com
```

### Database Setup

1. **Using Supabase**: Apply the migration in `supabase/migrations/`
2. **Using Custom PostgreSQL**: Run `npm run migrate` to apply schema from `db/`

## 🌐 API Endpoints

When `VITE_USE_API=true`, the following endpoints are available:

- `GET /api/settings` - Site configuration
- `GET /api/projects` - List projects
- `GET /api/projects/by-id?id=...` - Get single project
- `GET /api/blog` - List blog posts
- `GET /api/blog/by-slug?slug=...` - Get single blog post
- `GET /api/slides` - Hero slides
- `POST /api/views/increment` - Track page views
- `POST /api/likes/toggle` - Toggle likes

Full API documentation available in `README_API.md`.


## 🎨 Styling & Themes

This project uses Tailwind CSS with custom theming:

- **Multiple Themes**: Cyberpunk, dark, light themes
- **Responsive Design**: Mobile-first approach
- **Custom Components**: Reusable UI components
- **Animations**: Framer Motion for smooth transitions
- **Typography**: Fluid typography for responsive text

## 📱 Features

### Portfolio Features
- **Hero Section**: Dynamic hero with video background support
- **Project Showcase**: Filterable project grid with technology tags
- **Blog Platform**: Full-featured blog with categories and tags
- **Admin Dashboard**: Content management system for projects and posts
- **Analytics**: View counting and engagement tracking
- **Social Integration**: Social media links and sharing

### Technical Features
- **Authentication**: Supabase Auth integration
- **Database**: Dual support for Supabase and PostgreSQL
- **API**: RESTful API with Express.js
- **State Management**: Redux Toolkit for app state
- **Form Handling**: React Hook Form with validation
- **Error Handling**: Comprehensive error boundaries
- **SEO**: React Helmet for meta tags

## 📦 Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

1. **Vercel (Recommended)**:
   - Connect your GitHub repository
   - Configure environment variables
   - Deploy with automatic CI/CD

2. **Traditional Hosting**:
   ```bash
   npm run build
   # Deploy the `build/` folder to your hosting provider
   ```

3. **Full-Stack Deployment**:
   ```bash
   # Build client
   npm run build
   
   # Start production server
   NODE_ENV=production PORT=5000 node server.js
   ```

## 🚀 Getting Started

### Quick Start (Supabase)
1. Clone the repository
2. Install dependencies: `npm install`
3. Create Supabase project and apply migrations
4. Configure `.env` with Supabase credentials
5. Start development: `npm start`

### Advanced Setup (Custom API)
1. Set up PostgreSQL database (Neon, Railway, etc.)
2. Configure `.env` with `VITE_USE_API=true`
3. Run migrations: `npm run migrate`
4. Start both servers: `npm run dev`

For detailed setup instructions, see `README_API.md`.

## 🧩 Adding Content

### Adding Projects
1. Access admin dashboard at `/admin-dashboard-content-management`
2. Use the Projects tab to add/edit projects
3. Include project details, technologies, and images

### Adding Blog Posts
1. Use the Blog tab in admin dashboard
2. Write posts in Markdown format
3. Set categories, tags, and publish status

### Customizing Themes
1. Edit theme configurations in `src/styles/`
2. Modify Tailwind configuration
3. Update theme options in admin settings

## 🙏 Acknowledgments

- **Mikael Kraft** © 2025 - Creator and Developer
- **Built with**: React 18, Vite, TailwindCSS, PostgreSQL
- **Powered by**: Node.js, Express, Supabase
- **Deployed on**: Vercel

