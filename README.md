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

## 🛠️ Installation Guide

### For Personal Use (Fork and Customize)

This guide will help you fork this portfolio and customize it for your own use.

#### Step 1: Fork and Clone
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/mkraft.git
cd mkraft

# Install dependencies
npm install
```

#### Step 2: Choose Your Setup Method

**Option A: Simple Setup with Supabase (Recommended for beginners)**

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a free account
   - Create a new project
   - Go to Settings > API to get your credentials

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```bash
   # Basic setup - Supabase only
   VITE_USE_API=false
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_ADMIN_EMAIL=your.email@example.com
   ```

3. **Apply database schema**
   - In Supabase dashboard, go to SQL Editor
   - Copy and run the SQL from `supabase/migrations/20250116120000_mikaelkraft_portfolio_schema.sql`

4. **Start development**
   ```bash
   npm start
   ```
   Visit http://localhost:4028

**Option B: Advanced Setup with Custom PostgreSQL**

1. **Set up PostgreSQL Database**
   - Create account on [Neon](https://neon.tech), [Railway](https://railway.app), or [Render](https://render.com)
   - Create a new PostgreSQL database
   - Get your connection string

2. **Create Supabase project** (for auth only)
   - Follow Supabase setup from Option A above
   - Create storage buckets: `media`, `logos` in Storage section

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with full configuration:
   ```bash
   # Database
   POSTGRES_URL=postgres://user:pass@host:5432/dbname
   POSTGRES_SSL=true
   
   # API Mode
   VITE_USE_API=true
   VITE_API_BASE_URL=/api
   
   # Supabase (for auth and storage)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_ADMIN_EMAIL=your.email@example.com
   
   # API Server
   API_PORT=5000
   ADMIN_EMAIL=your.email@example.com
   ```

4. **Initialize database**
   ```bash
   npm run migrate
   npm run seed  # Optional: adds sample data
   ```

5. **Start development servers**
   ```bash
   npm run dev  # Starts both client and API
   ```
   - Frontend: http://localhost:4028
   - API: http://localhost:5000

#### Step 3: Customize for Your Portfolio

1. **Update personal information**
   - Edit the content in admin dashboard at `/admin-dashboard-content-management`
   - Or directly modify database entries
   - Update social media links and personal details

2. **Add your projects**
   - Access admin dashboard
   - Use Projects tab to add your work
   - Include GitHub links, live demos, and screenshots

3. **Customize styling**
   - Edit theme files in `src/styles/`
   - Modify `tailwind.config.js` for custom colors
   - Update logos and images in `public/` folder

4. **Set up authentication**
   - Use the admin email you configured to log in
   - Access admin features at `/admin-dashboard-content-management`

#### Step 4: Deploy Your Portfolio

**Vercel Deployment (Recommended)**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically with each commit

**Other Hosting Options**
```bash
# Build for production
npm run build

# Deploy the build/ folder to your hosting provider
# (Netlify, GitHub Pages, etc.)
```

### Common Issues and Solutions

**Build Errors**
- Make sure all environment variables are set
- Check that database connection is working
- Verify Node.js version (14.x or higher)

**Database Connection Issues**
- Ensure POSTGRES_SSL=true for managed databases
- Check firewall settings
- Verify connection string format

**Authentication Problems**
- Confirm VITE_ADMIN_EMAIL matches your login email
- Check Supabase project settings
- Verify environment variables are loaded

### Need Help?

- Check `README_API.md` for detailed API documentation
- Review the `.env.example` file for all configuration options
- Ensure all prerequisites are installed before starting

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

## 🚀 Quick Reference

### Development Commands
```bash
npm start          # Start development server (frontend only)
npm run dev        # Start both frontend and API servers
npm run dev:client # Start frontend server only
npm run dev:api    # Start API server only
npm run build      # Build for production
npm run migrate    # Apply database schema
npm run seed       # Add sample data
```

### Project URLs (Development)
- **Frontend**: http://localhost:4028
- **API Server**: http://localhost:5000  
- **Admin Dashboard**: http://localhost:4028/admin-dashboard-content-management

### Key Files to Customize
- `.env` - Environment configuration
- `src/pages/` - Page components and content
- `src/styles/` - Themes and styling
- `public/` - Static assets (logos, images)
- `supabase/migrations/` - Database schema

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

