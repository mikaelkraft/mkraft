# Mikael Kraft Portfolio

A modern, full-stack portfolio website showcasing projects, blog posts, and professional experience. Built with React, Node.js, and PostgreSQL.

## 🎯 Mission & Purpose

Create a living technical portfolio and publishing platform that demonstrates engineering craft, accelerates content production, and serves as an experimentation sandbox for modern full‑stack patterns (React/Vite, dual backends, Postgres + Supabase) while remaining easily forkable for others.

## 🧭 Strategic Pillars
- **Showcase**: Present projects & narratives with high visual and performance polish.
- **Publish**: Smooth authoring → moderation → publish workflow for blog content.
- **Engage**: Foster interaction (likes, comments, newsletter, future recommendations).
- **Adapt**: Dual‑mode architecture (Supabase-only vs. Custom API) to scale complexity only when needed.
- **Evolve**: Roadmap-friendly foundation for search, analytics, AI assist, and structured growth.

## 🌱 Implicit Goals
- Act as a long‑term personal brand asset (stable URLs, SEO hygiene, content ownership).
- Provide a reference implementation others can fork and simplify or extend.
- Encourage clean layering & separation (API handlers reuseable serverless/Express).
- Make data durability + schema evolution intentional (migration scripts + patch files).
- Keep DX fast (Vite, small surface area, incremental TS potential, test scaffolding).
- Enable future: recommendations, semantic search, AI content augmentation without rewrite.
- Avoid premature complexity—introduce features behind composable abstractions (e.g. feature flags, background jobs later).

## 🔗 Quick Summary (If Skimming)
This repo = Portfolio + CMS + Blog + Engagement layer, shipping today with a pragmatic stack and a clearly mapped “next wave” of enhancements.

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
 - **Configurable Profile Fields** – Editable/required fields governed by DB rules with audit logging
 - **Safe Video Embeds** – Optional YouTube/Vimeo embeds sanitized + responsive wrapper
 - **Change Auditing** – Profile field changes recorded (who/what/when)
 - **Lightweight Rate Limiting** – Basic in-memory guard on sensitive mutation endpoints

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

### Environment & Secrets Management

| Type | File / Source | Committed? | Sent to Browser? | Notes |
|------|---------------|------------|------------------|-------|
| Local template | `.env.example` | Yes | N/A | Safe placeholder values only |
| Runtime secrets | `.env` / Vercel Project Settings | No | Only variables prefixed `VITE_` are embedded into client bundle |
| Server-only secrets | `POSTGRES_URL`, `POSTGRES_SSL`, future `JWT_SECRET` | No | No | Do NOT prefix with `VITE_` |
| Client config | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_USE_API` | Yes (exposed) | Yes | Required for frontend operation |

Important:
- Any variable starting with `VITE_` is statically injected into the built JavaScript and is publicly visible. Treat `VITE_SUPABASE_ANON_KEY` as a public key (Supabase uses RLS policies to protect data).
- Never commit `.env`; it's now ignored via `.gitignore`.
- Provide safe defaults in `.env.example` only.
- Use separate environments (Development / Preview / Production) in Vercel with distinct values.
- If you add sensitive server logic later (e.g., JWT signing), keep that secret unprefixed and used only inside server code (`server.js` or API handlers).

Secret Rotation Tips:
1. Update value in hosting provider dashboard.
2. Trigger a redeploy (push empty commit if needed).
3. Invalidate old credentials (DB keys, API keys) if applicable.

Auditing Exposure:
Run `grep -R "VITE_" build/` after a production build to see which keys were inlined.

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
 - `GET /api/profile` / `PUT /api/profile` - Fetch or update current (or target, admin) user profile with field rule enforcement
 - `GET /api/profile/fields` / `POST /api/profile/fields` - Read / upsert profile field rule definitions (admin mutation)

Full API documentation available in `README_API.md`.

### Profile Field Governance & Auditing

Profiles are governed by a `profile_field_rules` table allowing runtime control over:
- `enabled` – Whether a field is surfaced / writable.
- `editable_roles` – Array of roles permitted to edit (e.g. `["admin","publisher"]`).
- `required` – Enforced on update: missing or empty values trigger a 400.

Update Behavior:
- Non-admin users can only modify fields where their role appears in `editable_roles` and `enabled` is true.
- Admins may target another user via payload `{ "userId": "..." }`.
- Normalization: `website_url` & `avatar_url` auto-prepend `https://` if protocol absent; social handles strip leading `@`.
- Empty payload or no editable fields returns `400`.

Auditing:
- Each change writes a row to `profile_change_events` capturing: `user_id`, `actor_id`, `field_name`, `old_value`, `new_value`, timestamp.
- Values truncated to 1000 chars for storage safety.

Rate Limiting:
- Profile updates limited to 10 per minute per user (in-memory). Returns `429` when exceeded.
- For production scale replace with Redis / durable store keyed by user and possibly IP.

### Safe Video Embeds

Blog post HTML is sanitized; when `site_settings.enable_video` is true:
- Trusted sources: YouTube & Vimeo iframe `src` domains only.
- Allowed attributes reduced to a safe subset; `allow` attribute filtered to approved feature tokens.
- Each iframe wrapped in a `<div class="video-embed-container">...</div>` for responsive styling.
- When video disabled, disallowed `<iframe>` elements are stripped entirely (no orphan closing tags).

Add CSS (example) if not already present in global styles:
```css
.video-embed-container { position: relative; aspect-ratio: 16/9; width: 100%; max-width: 100%; }
.video-embed-container iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
```

### Error Responses (Conventions)
- Validation errors: `{ "error": "Missing required fields", "fields": ["bio","headline"] }`
- Rate limits: `{ "error": "Rate limit exceeded" }`
- Auth failures: `{ "error": "Unauthorized" }`


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

#### 1. Vercel (Recommended)
Supports two modes:
- Static Frontend + Serverless API (default)
- Or full custom server (if you really need Express) — usually unnecessary.

Steps:
1. Push repo to GitHub.
2. Import project in Vercel dashboard.
3. Set Environment Variables (see table below).
4. Vercel will run `npm install && npm run build` using `vercel.json` config.
5. Serverless functions live under `/api/*` automatically.

Routing Notes:
- All non-asset routes rewrite to `index.html` (SPA behavior).
- `/api/*` mapped to serverless handlers in `api/` directory.
- Static assets cached aggressively (immutable headers).

#### 2. Netlify
1. Build command: `npm run build`
2. Publish directory: `build`
3. Add a `_redirects` file (optional) for SPA:
   ```
   /* /index.html 200
   ```
4. Netlify Functions (optional) would require moving API code into `netlify/functions/` — current layout is Vercel-optimized.

#### 3. Render (Full Stack)
1. Create a Web Service (Node) for the API:
   - Start command: `node server.js`
   - Build command: `npm run build`
2. Serve static frontend either:
   - From same Express server (already supported in production mode), or
   - As a separate Static Site (build output: `build`)
3. Ensure `VITE_API_BASE_URL` points to your API domain (e.g. `https://your-api.onrender.com/api`).

#### 4. Traditional VPS / Docker
```bash
npm install
npm run build
NODE_ENV=production PORT=5000 node server.js
```
Reverse proxy (Nginx/Caddy) should:
- Serve `/build` static assets
- Proxy `/api` to Node process
- Fallback all other routes to `index.html`

### Environment Variable Mapping
| Purpose | Variable | Frontend? | Required (Mode) |
|---------|----------|-----------|-----------------|
| Use custom API | `VITE_USE_API` | Yes | true for Express mode |
| API base path | `VITE_API_BASE_URL` | Yes | When `VITE_USE_API=true` |
| Supabase URL | `VITE_SUPABASE_URL` | Yes | Always |
| Supabase anon key | `VITE_SUPABASE_ANON_KEY` | Yes | Always |
| Admin email | `VITE_ADMIN_EMAIL` | Yes | Always |
| Postgres URL | `POSTGRES_URL` | No (server only) | Custom API mode |
| Postgres SSL | `POSTGRES_SSL` | No | Managed DBs |
| API port (local) | `API_PORT` | No | Local dev |

Vercel UI will treat any `VITE_` variables as exposed to the client build.

### Choosing a Mode
| Mode | When to Use | Tradeoffs |
|------|-------------|-----------|
| Supabase Only | Fastest launch, minimal infra | Less control over API logic, limited custom caching |
| Custom API + Supabase Auth | Need custom endpoints, caching strategy, Postgres tuning | More moving parts |

### Scaling Considerations
- Add background jobs before introducing heavy synchronous mutation logic.
- Introduce search indexing (Typesense/Meilisearch) once post volume > ~100.
- Apply CDN headers for large media via storage provider (Supabase buckets / external CDN).

### Optional: TypeScript Migration Path
1. Add `tsconfig.json` + incremental rename of service/util files.
2. Enable `checkJS` for transitional safety.
3. Migrate API handlers last (stabilize contracts first).

### CI Suggestions
- Run `npm run test` and a Lighthouse CI action on PRs.
- Auto-format + lint via pre-commit or GitHub Action.

---

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
npm run lint:staged # Run lint-staged config over staged files
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

## ▶️ Next Steps (Execution Focus)
Immediate upcoming tracks to continue momentum:

1. Track 5 – Recommendation Engine MVP
   - Simple related posts via tag overlap & basic keyword scoring.
   - Endpoint: `/api/blog/related?slug=` returning up to 3 items.
   - Frontend widget (below post body) with click tracking.
2. Track 6 – Admin Command Palette
   - Ctrl/Cmd+K quick navigation + actions (New Post/Project, Toggle Theme, Go to Settings).
3. Track 7 – Full‑Text Search Skeleton
   - Postgres tsvector + GIN, `/api/blog/search?q=` + lightweight UI search bar.
4. Track 8 – Basic Feature Flags
   - `feature_flags` table + `/api/settings/features` + `useFeature()` hook to gate new UI.

These will be implemented sequentially (favoring small deployable slices). Feel free to reprioritize.
 
### Near-Term Additions (Planned Slices)
- Blog Post Detail Page with Related Posts widget (consuming Track 5 endpoint).
- Command Palette skeleton (Ctrl/Cmd+K) with navigation + create shortcuts.
- Feature Flag hook stub (`useFeature`) returning false until backend table added.
- Optional: Related post click tracking (increment simple counter for future ranking).


- **Mikael Kraft** © 2025 - Creator and Developer
- **Built with**: React 18, Vite, TailwindCSS, PostgreSQL
- **Powered by**: Node.js, Express, Supabase
- **Deployed on**: Vercel


## 🔮 Follow‑Up Opportunities (Next Wave)

Strategic enhancements grouped by theme to guide the next development wave. Feel free to prune or prioritize.

### Platform & Architecture
- API Versioning & Contract Docs (OpenAPI / Swagger generation)
- Background Job Queue (BullMQ / Cloud Tasks) for heavy operations (image processing, email sends)
- Edge Caching Layer (CDN headers + stale‑while‑revalidate strategy)
- Incremental Static Regeneration / Hybrid Rendering (evaluate SSR layer or pre-render key pages)
- Configurable Feature Flags (simple DB table + hook)
- Multi‑Tenant Mode (namespace site settings + content by org/user)

### Data & Content
- Full‑text Search (Postgres `tsvector`, or integrate with Typesense/Meilisearch)
- Content Draft autosave & revision history (version table w/ diff)
- Tag / Category Taxonomy Enhancements (hierarchical or weighted relevance)
- Content Scheduling (publish_at + background sweeper)
- Media Library with metadata (dimensions, dominant colors, alt text auditing)

### Blog & Engagement
- Related / Recommended Posts (embedding similarity or tag/keyword overlap)
- Reading Time + Outline / TOC generator
- Series / Collections for multi‑part posts
- Newsletter Backfill: auto‑generate issue from selected posts
- Webmentions / IndieWeb support (optionally moderated)

### Projects & Portfolio
- Case Study Layout Generator (templates for narrative structure)
- Technology Stack Badges with filtering & analytics
- Project Lifecycle States (Ideation, Building, Shipped, Sunset)
- Live Metrics Embed (GitHub stars, NPM downloads, uptime badges)

### Admin Experience (CMS)
- Bulk Actions (publish, archive, tag reassignment)
- Keyboard Shortcuts & Command Palette
- Unified Media Picker with inline crop/compress
- Audit Log (who changed what & when)
- Inline Validation Hints (schema-aware tooltips)

### Performance & Quality
- Core Web Vitals budget + automated Lighthouse CI
- Image Optimization Pipeline (responsive sizes + AVIF/WebP generation)
- Prefetch / Preload Strategy Tuning (route-based heuristics)
- Error Boundary Telemetry (link front-end errors to backend traces)

### Security & Compliance
- Rate Limit Analytics Dashboard (surface offenders, blocked IPs)
- Content Moderation Queue Enhancements (ML assisted toxicity / spam scores)
- Configurable Role-Based Access (granular permissions beyond admin)
- Security Headers Hardening (CSP nonce pipeline, strict COEP/COOP)
- 2FA for Admin Accounts (TOTP first, WebAuthn future)

### Accessibility & UX
- Automated a11y test suite (axe + CI gating)
- Focus order & landmark auditing
- High‑contrast theme mode toggle
- Adjustable motion / reduced animations preference
- AI‑assisted alt text suggestions for images

### Observability & Analytics
- Central Logging + Structured Event Schema
- Custom Event Funnel (project click → blog read → newsletter signup)
- Real‑time Presence / Active Visitors (socket or server-sent events)
- Content Performance Dashboard (CTR, scroll depth, share rate)

### Growth & Marketing
- On‑site Smart Nudges (exit intent newsletter modal with A/B variants)
- UTM Campaign Tracking + Attribution view in admin
- SEO Enhancements: XML sitemap automation + OpenGraph validator panel
- Social Card Image Automation (dynamic OG image generation per post/project)

### Monetization (Optional)
- Premium Content Flag (metered free access)
- Sponsorship / Partner Blocks (rotating inventory with impressions tracking)
- Donation Integration (Stripe Checkout or GitHub Sponsors surfacing)

### AI & Automation
- AI Draft Assistant (summarize, expand, tone shift in editor)
- Semantic Search / Recommendations (vector store derived from content)
- Auto Tagging & Keyword Extraction pipeline
- Smart Image Alt Text + Caption generation
- Chatbot / Q&A over blog + project corpus

### Developer Experience
- Type Coverage Increase (incremental TS adoption plan)
- Storybook or Ladle for UI component documentation
- Git Hooks (lint-staged + conventional commits + commit message lint)
- Preview Deploy Comments (link environment + diff summary)
- Database Migration Safety (generation + dry‑run diff tool)

### Reliability & Ops
- Health Check Expansion (dependency checks, migration drift detection)
- Automated Backups & Restore Drill Scripts
- Chaos Testing Lite (random failure injection in staging)
- Error Budget Policy (SLO dashboard + alert thresholds)

### Internationalization (Future)
- i18n Framework Integration (string extraction strategy)
- Language Negotiation & Canonical URL management
- Localized SEO metadata

### Governance & Trust
- Transparency Page (changelog + uptime + roadmap)
- Public Roadmap Board (derived from this list + status columns)
- Privacy & Data Retention Policy automation (auto purge old logs)

---
Prioritize according to impact vs. effort. Suggested first slice: (1) Structured logging + Lighthouse CI, (2) Media library improvements, (3) Draft revisions, (4) Recommendation engine MVP, (5) Admin command palette.

Feel free to request reordering or pruning; I can convert selected items into GitHub issues with acceptance criteria.


## 🛠 Actionable Next Moves (Execution Tracks)

Structured tracks translating the opportunity list into implementable sequences. Each track lists: Objective → Key Steps → Definition of Done (DoD) → Stretch.

### 1. Structured Logging & Metrics Foundation
**Objective:** Gain observability into API usage & errors.
**Steps:**
1. Create `src/utils/log.js` (wrapper: level, context, correlationId).
2. Add request ID middleware (header `x-request-id` fallback to UUID) in `server.js`.
3. Log start/end + duration for each API handler.
4. Emit lightweight counters (in-memory map) for: route hits, 4xx, 5xx.
5. Expose `/api/health` extended with metrics snapshot (non-sensitive).
**DoD:** Logs consistent JSON shape; metrics visible locally; no handler uncaught rejections.
**Stretch:** Pluggable exporter (console → future external sink).

### 2. Lighthouse CI + Performance Budgets
**Objective:** Prevent regressions in Core Web Vitals.
**Steps:**
1. Add `.github/workflows/perf.yml` running Lighthouse CI on build output.
2. Define budgets (JS < 2500 KB total, LCP < 3.0s local profile).
3. Fail PR if thresholds exceeded (warn first phase).
**DoD:** CI comment with scores; red build on hard fail.
**Stretch:** Track historical trends (artifact upload).

### 3. Media Library Enhancements (Phase 1)
**Objective:** Improve asset governance & metadata surface.
**Steps:**
1. Add DB table `media_assets` (id, path, width, height, mime, alt, created_at).
2. On upload (avatar / future media), store metadata.
3. Create `/api/media` list endpoint (paginated, filter by type).
4. Admin UI grid component to browse + copy URLs.
**DoD:** Assets visible with dimensions; alt text editable.
**Stretch:** Dominant color extraction (client side canvas first pass).

Status: ✅ Implemented (DB table, upload endpoint with metadata, admin grid). Follow-up enhancements listed below.

#### Suggested Next Incremental Enhancements (Post Phase 1)
To evolve the media system pragmatically while avoiding premature over‑engineering:
- Add DELETE endpoint with soft delete (`deleted_at`) and UI button.
- Generate responsive derivatives (e.g. 320/640/1280) via sharp; record in a `media_variants` table.
- Extract & store dominant color / palette for placeholder backgrounds.
- Add bulk tagging & alt text editing modal.
- Introduce signed upload URLs (Supabase Storage or S3) to offload server.
- Add simple CDN caching headers & cache-busting strategy (hash in filename if transformed).
- Implement usage references mapping (track which blog posts/projects reference an asset) to warn before delete.
- Accessibility audit: surface missing alt text count in admin dashboard.


### 4. Draft / Revision System (Posts)
**Objective:** Enable safe iterative authoring.
**Steps:**
1. Add `post_revisions` table (id, post_id, content_md, created_at, author_id).
2. Modify blog save endpoint: if post published → create new revision instead of overwriting.
3. Admin UI: Revisions panel (list + restore button).
4. Diff view (simple word diff or highlight changed blocks later).
**DoD:** Can restore an old revision; published slug stable.
**Stretch:** Autosave every X seconds (client debounced) when editing.
Status: ✅ Backend implemented (migration, capture on update, list & restore API). UI diff panel deferred (stretch).

### 5. Recommendation Engine MVP
**Objective:** Related posts module to improve session depth.
**Steps:**
1. Add SQL similarity using tag overlap + simple keyword frequency.
2. New endpoint `/api/blog/related?slug=...` returning top 3.
3. Inject widget into blog post page below content.
4. Track click events (log or metric counter).
**DoD:** At least one related post appears when tags shared.
**Stretch:** Later upgrade to embeddings.
Status: ✅ Backend + initial UI widget (related posts on blog post page). Future: click tracking + improved scoring.

Follow‑Up Enhancements (Related Posts):
- Track impression + click events (CTR for future ranking tuning).
- Add explanation tooltip: "Based on shared tags" (or future semantic source).
- Prefetch related posts immediately after main post load (parent-level concurrency) to shorten perceived latency.
- Implement fallback strategy when no tag overlap: recent posts in same category, then global recents.
- Introduce A/B test flag (e.g., `related_algo_v2`) to compare heuristic vs. future embedding scoring.
- Add skeleton shimmer placeholders (improves perceived load).
- Personalization (logged-in): boost posts recently interacted with (views/likes) but not yet read fully.
- Expand to show micro-metadata: estimated read time, published date badge.
- Cache layer: cache key `related:<slug>` with short TTL to reduce DB hits under traffic spikes.
- Semantic upgrade path: store vector embeddings for content/title; fallback gracefully if vector system offline.

### 6. Admin Command Palette
**Objective:** Power-user navigation & quick actions.
**Steps:**
1. Palette component (Ctrl/Cmd+K) with core actions.
2. Central action registry extracted (`coreActions`).
3. Fuzzy search scoring + keyboard navigation (↑ ↓ Enter).
4. Dynamic post suggestions (queries hit search API / fallback heuristic).
5. Ephemeral inline action: `post:Title` to create a new draft.
**DoD:** All core actions + search results navigable via keyboard, inline create appears for pattern.
**Stretch:** Command arguments & theming toggle (deferred).
Status: ✅ Completed (fuzzy scoring, grouping, suggestions, inline create, accessibility improvements).

### 7. Full‑Text Search Skeleton
**Objective:** Foundation for on-site search.
**Implemented:**
1. `search_vector` column + trigger + GIN index (patch `patch_20250928_full_text_search.sql`).
2. Endpoint `/api/blog/search?q=` now uses `websearch_to_tsquery` (natural operators) with weighted ranking (title boosted) and snippet generation via `ts_headline`.
3. Header inline search bar (feature-flag gated) + command palette integration.
4. `/search` results page with highlighted `<mark>` snippets (sanitized) fallback to excerpt.
5. Basic metrics logging (query length + result count) for future analytics.

**Definition of Done:** Ranked + highlighted results integrated into UI & palette under feature flag.

**Stretch (Future):** Trigram similarity fallback for zero hits, analytics dashboard, adaptive weighting via engagement, semantic/vector augmentation.

Status: ✅ Completed (enhanced baseline delivered).

### 8. Basic Feature Flags
**Objective:** Safely roll out new UI components.
**Implemented:**
1. `feature_flags` table (key, enabled, note, timestamps).
2. `/api/settings/features` (GET, POST upsert with admin guard).
3. `useFeature(flagKey)` hook with: in-memory cache, stale‑while‑revalidate (30s), window focus re-fetch.
4. Local overrides via query param `?ff=flag_a:on,flag_b:off` persisted to `localStorage` (`featureFlagOverrides:v1`).
5. Admin UI `/admin/feature-flags`: create, toggle, inline note edit, override badges, reset overrides button.
6. Gating applied to search UI, related posts widget, and command palette surfaced features.

**Usage:** Append `?ff=my_flag:on` to enable locally; persistent until reset. Precedence: override → server flag → default.

**Definition of Done:** Runtime controllable flags with low-latency propagation (<30s) & local test overrides.

**Stretch (Future):** Percentage rollouts, user targeting, evaluation telemetry.

Status: ✅ Completed. Proceeding to Track 9.

### Publisher Program (Flag: `publisher_program`)
**Objective:** Enable multi-author workflow while preserving admin editorial control.

**Schema Additions:** `role` (viewer|publisher|admin), `publisher_request_status` (pending|approved|rejected), audit timestamps.

**Endpoints (flag-gated):**
- `GET/POST /api/profile/publisher-request` – viewer requests access; returns `{ role, publisher_request_status }`.
- `GET /api/profile/publisher-requests` – admin list pending requests.
- `POST /api/profile/publisher-approval` – admin approve/reject.

**Role Rules (Phase 2 – Invite):**
- viewer: read content, can request access (once pending).
- publisher: create draft posts only (server forces `status=draft`, `featured=false`).
- admin: full CRUD, publish/feature, approve publishers.

**Rate Limiting:** In‑memory guard (5 requests / 10 min / user) on request endpoint; single pending enforced.

**Phased Rollout:**
1. Internal (flag off): Only admin authorship (legacy behavior).
2. Invite (flag on): Manual approval pipeline; publishers draft content.
3. Open (future): Auto-approval / invitation codes, quota & quality metrics.

**Planned Enhancements:**
- Draft review queue UI (diff vs. last revision).
- Email / notification on approval.
- Publisher activity metrics (draft count, accepted ratio).
- Advanced rate limiting / abuse signals (IP + account age) via Redis.
- Optional editorial notes per approval.

Status: ✅ Core publisher workflow & admin tooling implemented (requests panel, approval actions with optimistic UI, draft review queue, revision diff & restore, role badges). Further enhancements (notifications, metrics) remain optional.

### Admin Workflows (Current Implementation)

The admin dashboard (`/admin-dashboard-content-management`) now includes several workflows that enable safe multi‑author publishing while preserving editorial control.

#### 1. Publisher Access Requests
- Location: "Publisher Requests" section (visible only when `publisher_program` flag enabled and user is admin).
- Contents: List of users with `publisher_request_status = 'pending'` including email and requested timestamp.
- Actions: Approve or Reject.
   - Approve: Sets `role = 'publisher'`, `publisher_request_status = 'approved'`.
   - Reject: Sets `publisher_request_status = 'rejected'` (role unchanged).
- UX Details: Optimistic removal of the row; per‑row loading overlay; fallback re-fetch if error.
- Logging: Each action emits a structured JSON line (`publisher_request_moderated`) with moderator and target context.

#### 2. Draft Review Queue
- Purpose: Surface draft posts authored by publishers (never auto‑publish).
- Data: Filters posts where `status = 'draft'` AND author role = `publisher`.
- Intended Flow:
   1. Publisher creates or edits draft.
   2. Admin reviews in queue, optionally opens editor.
   3. Admin publishes (standard blog publish path) after optional revision restore/diff.

#### 3. Revision History & Diff
- Side Panel: Within the blog editor, a revision panel lists prior versions (timestamp + truncated content hash/preview).
- Diff Viewer: Selecting a revision opens an inline diff overlay (line‑level: added / removed / context).
- Restore: Applies selected revision content back into the editor for further edits or publishing.
- Backend: Revisions captured automatically on `PUT /api/blog` before overwriting existing content.

#### 4. Role Badges
- Component: `RoleBadge` centralizes styling and semantics (SUPER ADMIN gradient variant, ADMIN, PUBLISHER, VIEWER).
- Visible In: Blog detail (author line), related posts list, admin tables (blog management, review queue), publisher requests list.
- Logic: SUPER ADMIN rendered when email matches configured `ADMIN_EMAIL` / `VITE_ADMIN_EMAIL` (auto‑promotion handled in auth layer).

#### 5. Structured Logging (Auditing)
- Logger: `api/_lib/log.js` emits JSON lines with ISO timestamp.
- Access: Each request logs an `access` event including requestId, latency, status.
- Approval Events: `publisher_request_moderated` records moderation decisions with previous/new role and status.
- Error Events: Standardized `handler_error` & domain-specific errors include `requestId` for correlation.
- Future: These logs can be shipped to external sinks (e.g., Logtail, Datadog) without code change by redirecting stdout/stderr.

#### 6. Feature Flag Integration
- All publisher program UI surfaces gate on the `publisher_program` flag.
- Disable flag to hide multi‑author UI while preserving data.

### Operational Notes
- Draft Safety: Publishers can only create drafts; server rejects attempts to publish directly unless role `admin`.
- Revision Integrity: Revisions are append‑only; future pruning policy can be added (e.g., keep last N or last 30 days).
- Optimistic UI Recovery: Failed approval calls revert UI state and surface a toast (implementation hook available—ensure toast provider running).
- Security: Admin endpoints enforce `requireAdmin`; non‑admins receive 401 without leaking existence of other users.

### Suggested Future Enhancements (Optional)
- Email notification on approval/rejection (hook into structured log stream or inline in handler).
- Publisher dashboard: personal draft metrics, approval history.
- Audit log viewer in admin UI (filter by actor, action type, date range).
- Soft delete & restoration for posts + revision diff on restore confirmation.
- Automated quality signals (min content length, broken link scanner) integrated into review queue list with badges.

## 🤝 Contributing & Commit Conventions

## 🛡️ User Management & Moderation

The platform now supports basic user moderation primitives enabling progressive enforcement without deleting accounts.

### Schema Additions
Added to `user_profiles` (via patch migration):
- `banned` boolean DEFAULT false
- `ban_reason` text
- `banned_at` timestamptz
- `warning_count` integer DEFAULT 0
- `last_warning_at` timestamptz

### Admin Endpoints
All require admin role:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/users` | GET | List users with moderation fields (searchable via `?search=`) |
| `/api/admin/users/warn` | POST | Increment warning count; body: `{ user_id, reason? }` |
| `/api/admin/users/ban` | POST | Ban or unban; body: `{ user_id, action: 'ban'|'unban', reason? }` |

### Warning Logic
`/api/admin/users/warn` increments `warning_count`, sets `last_warning_at = now()`, and logs `user_warned` structured event.

### Ban Logic
`/api/admin/users/ban` with `action = 'ban'` sets:
```
banned = true,
ban_reason = <reason||null>,
banned_at = now()
```
`action = 'unban'` resets `banned=false`, keeps historical `ban_reason` & `banned_at` for lightweight audit (future: separate audit table if needed).

### Enforcement Points
- Publisher Access Request endpoint rejects banned users (401/Forbidden style).
- Blog create/update pathway blocks banned users from creating drafts.
Additional enforcement (comments, likes) can be layered similarly by checking `user.banned` from auth context.

### Structured Logging Events
| Event | Fields (subset) | Description |
|-------|-----------------|-------------|
| `user_warned` | moderator_id, target_user_id, new_warning_count, reason | User received a warning |
| `user_ban_status_change` | moderator_id, target_user_id, action, previous_banned, new_banned, reason | Ban/unban executed |

All logs share requestId and ISO timestamp for correlation.

### Future Extensions (Optional)
- Escalation threshold (auto-ban after N warnings within window)
- Separate `user_moderation_events` table for immutable audit trail
- UI surfacing warning history & ban status in admin user panel
- Email notifications on warn/ban/unban

## 🔗 Canonical URLs & Deployment Base

To ensure consistent absolute URLs (SEO canonical tags, sharing, sitemaps), configure a production origin.

### Environment Variables (Server)
Priority order for deriving base URL:
1. `SITE_BASE_URL` (e.g. `https://example.com`)
2. `VERCEL_URL` (auto set by Vercel; host only)
3. `PUBLIC_BASE_URL` (future compatibility)
4. Fallback `http://localhost`

If `NODE_ENV=production` and the resolved base ends in `localhost`, a startup warning is logged:
```
[config-warning] SITE_BASE_URL/VERCEL_URL not set; canonical URLs will use localhost.
```

### Helpers
- Server: `buildCanonicalUrl(path)` in `api/_lib/respond.js` returns absolute URL without trailing slash.
- Client: `getCanonicalUrl(path)` in `src/utils/canonical.js` uses `VITE_SITE_BASE_URL` or `window.location.origin`.

### Recommended Setup
Set both for clarity:
```
SITE_BASE_URL=https://yourdomain.com
VITE_SITE_BASE_URL=https://yourdomain.com
```

Use `VITE_SITE_BASE_URL` only for client bundle exposure; never expose secret server-only origins.

### Usage Example (Server-side OG / future sitemap)
```js
const { buildCanonicalUrl } = require('./api/_lib/respond.js');
const canonical = buildCanonicalUrl('/blog/my-post');
```

### Common Pitfalls
- Missing protocol: always include `https://` in `SITE_BASE_URL`.
- Trailing slash differences: helper trims trailing slash to avoid duplicate variants.
- Inconsistent staging domains: set a distinct `SITE_BASE_URL` per environment to keep analytics/SEO isolated.

## 🌐 Sitemap Architecture (Indexed)

`/sitemap.xml` now serves a **sitemap index** referencing three specialized sitemaps:

| File | Purpose | Cache TTL |
|------|---------|-----------|
| `/sitemap-posts.xml` | Published blog posts with engagement‑weighted priority | 5 min |
| `/sitemap-projects.xml` | Published projects | 10 min |
| `/sitemap-categories.xml` | Category hub filtered pages | 30 min |

### Priority Heuristics
Posts use a lightweight engagement score: base 0.50 + log‑scaled views + likes (capped) → 0.50–0.90 range. Projects & categories use fixed mid‑range priorities (0.55, 0.50) to avoid diluting post focus.

### Last Modified (`lastmod`)
- Posts / Projects: `updated_at` fallback `created_at` per row.
- Categories: current generation timestamp (reflects dynamic aggregation).
- Index: current time (links act as freshness signal; downstream crawlers will fetch children respecting their own cache policies).

### Robots.txt
Dynamic endpoint at `/robots.txt` references the index:
```
User-agent: *
Disallow:

Sitemap: https://yourdomain.com/sitemap.xml
```
Base URL auto‑resolved (see Canonical section) – in production set `SITE_BASE_URL` / `VITE_SITE_BASE_URL`.

### Extending
Add a new type by creating `api/sitemap-<type>.xml.js` and referencing it inside `api/sitemap.xml.js` index array. Use distinct cache TTLs based on volatility (e.g. jobs listing hourly vs. documentation weekly).

### Testing
`test/sitemap.test.js` now fetches the index and then validates the posts sitemap XML structure. Additional child sitemap validations can be added similarly (kept minimal for speed).

### Safeguards & Scale
Row caps remain (posts 5000, projects 2000, categories 500) to prevent accidental payload explosion. Adjust limits as growth requires. If nearing caps, consider pagination (next sitemap file partitioning) or date partitioned sitemaps.

### Future Enhancements (Optional)
- Partition large post sets by year/month (e.g., `/sitemap-posts-2025.xml`).
- Pre‑generate & cache warmers (cron) instead of on-demand computation under traffic spikes.
- Include image/alternate language namespaces if i18n or image SEO become priorities.
- Export priority + frequency heuristics to config for tuning without code changes.

### Canonical Suppression for 404
The `NotFound` route now sets a global suppression flag so the canonical tag isn’t emitted for soft 404s, reducing the risk of polluting the canonical graph with error states.

## 👤 Profile Editing System

Users (and admins) can now enrich profile data beyond `full_name` & `avatar_url`.

### Fields Added
`bio`, `website_url`, `twitter_handle`, `github_handle`, `linkedin_handle`, `location`, `headline`, `profile_meta` (JSON container for future structured data like badges, pronouns, etc.).

### Field Rules Configuration
Governed by table `profile_field_rules`:
| Column | Purpose |
|--------|---------|
| `field_name` | Profile field key |
| `enabled` | Toggles visibility & updatability (non-admin users cannot see disabled fields) |
| `editable_roles` | Array of roles allowed to modify (`admin`, `publisher`, `viewer`) |
| `required` | (Reserved) Allows future validation enforcement |

Default seed enables all new fields for all roles (idempotent migration).

### Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profile` | GET | Returns current user profile (or `?userId=` when admin) filtering disabled fields for non-admins. |
| `/api/profile` | PUT | Update allowed fields for self (or `userId` for admin). Skips disabled or disallowed fields silently. |
| `/api/profile/fields` | GET | Public enabled field rules (admin may pass `?all=true` to view all). |
| `/api/profile/fields` | POST (admin) | Batch upsert rules `{ rules: [{ field_name, enabled, editable_roles, required }] }`. |
| `/api/profile/avatar` | PUT | (Existing) Update avatar; admin can target another user via `?userId=`. |

### Permissions Model
- Admin can edit any enabled field on any user, regardless of `editable_roles` (simplified policy).
- Non-admin updates are restricted per-field by inclusion in `editable_roles` AND `enabled=true`.
- Disabled fields are excluded from GET responses for non-admins (privacy by configuration).

### Future Hardening Ideas
- Enforce `required=true` on update (currently stored only).
- Audit log table for profile field changes.
- Rate limiting on profile mutations.
- Normalization/validation (e.g., enforce `https://` on `website_url`).

## 🎞 Blog Video Embedding (YouTube / Vimeo)

Controlled by `site_settings.enable_video` flag.

### Sanitization Behavior
The HTML sanitizer (`api/_lib/sanitize.js`) now accepts `{ allowVideo: true }` and, when enabled:
- Allows `<iframe>` with a restricted attribute set (`src`, `title`, `allow`, `allowfullscreen`, `width`, `height`, `frameborder`).
- Whitelists only `https://www.youtube.com/`, `https://youtu.be/`, and `https://player.vimeo.com/` sources.
- Strips any non-whitelisted iframe entirely.
- When videos disabled: all iframes removed (including orphan closing tags).

### Usage
On blog post create/update the system detects `enable_video` and passes the flag to the sanitizer; existing stored content will not retroactively gain iframes unless re-saved.

### Security Notes
- No `allow` filtering beyond pass-through; consider whitelisting explicit capabilities (e.g., `allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`).
- Additional providers (e.g., Loom, Wistia) require expanding the regex whitelist.
- Consider a future post-processing step to wrap iframes in a responsive container & lazy-load.

### Testing
`test/sanitize.video.test.js` validates whitelist acceptance & unapproved removal for defense-in-depth.




This project uses lightweight guardrails to keep the history clean and automatable.

### Git Hooks
Husky installs local hooks on `npm install` (via `prepare` script):
- `pre-commit`: Runs `lint-staged` (ESLint --fix + Prettier) then a fast test subset.
- `commit-msg`: Validates Conventional Commit message format and suggests scopes.

If hooks are skipped (CI or manual), ensure formatting and commit style still pass.

### Conventional Commit Format
```
type(scope?): subject
```
Allowed types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`

Examples:
```
feat(search): add snippet highlighting
fix: prevent null pointer in related posts
chore(deps): bump sharp to 0.33.x
refactor(flags): extract override parser
```

Rules:
1. Subject is sentence‑style, no trailing period.
2. Scope optional; use sparingly (folder or domain), keep lowercase.
3. Use `revert:` type for rollbacks (message auto-generated by `git revert`).

### Skipping Hooks
Use `HUSKY=0 git commit -m "..."` only for emergency hotfixes—avoid in regular workflow.

### Lint / Format
ESLint + Prettier integrated. Adjust rules in `.eslintrc.cjs`. Unused imports produce warnings (auto-removed on commit if possible).

### Fast Test Strategy (Future)
`pre-commit` runs `npm run test:fast` (validation layer). Full suite still via `npm test` or CI.

### Rationale
Consistent commit metadata enables:
- Automated CHANGELOG generation (`npm run changelog`).
- Automated changelog generation.
- Scope-based release notes.
- Easier code archaeology (grep by type or scope).

---

### 9. Git Hooks & Conventional Commits
**Objective:** Improve commit hygiene & accelerate code reviews.
**Steps:**
1. Add `husky` + `lint-staged` devDeps.
2. Pre-commit: run `npm test -- --run \"src/utils\"` (fast subset) + prettier.
3. Commit-msg hook: simple regex for conventional style.
**DoD:** Invalid commit message blocked; staged files formatted.
**Stretch:** Scope suggestions based on changed paths.

### 10. Code Splitting & Bundle Reduction
**Objective:** Reduce initial JS cost.
**Steps:**
1. Lazy import admin dashboard routes (`React.lazy`).
2. Lazy load heavy viz libs (d3/recharts) only where needed.
3. Add manualChunks in `vite.config.mjs` for vendor separation.
4. Measure before/after (Lighthouse, bundle size diff).
**DoD:** ≥20% reduction in main bundle.
**Stretch:** Prefetch on idle.

### 11. Security Headers & Hardening
**Objective:** Baseline security posture.
**Steps:**
1. Add helmet-lite manual headers in `server.js` (CSP, Referrer-Policy, Permissions-Policy).
2. Configure `Strict-Transport-Security` (handled by host if using Vercel).
3. Add minimal request size limit + body parser limit.
4. Document threat model assumptions in `SECURITY.md`.
**DoD:** Headers visible in response; no breakage of scripts/styles.
**Stretch:** CSP nonce pipeline.

### 12. Accessibility Automation
**Objective:** Detect regressions early.
**Steps:**
1. Add `axe-core` + a vitest a11y smoke test on key pages (render + check violations).
2. CI step fails on new critical violations.
**DoD:** Test suite reports 0 critical issues on base pages.
**Stretch:** Add color contrast scanning.

### 13. Internationalization Readiness
**Objective:** Prepare for multi-language without refactor.
**Steps:**
1. Wrap user-facing strings in a central `t()` util (pass-through for now).
2. Inventory static strings (generate report).
3. Add language setting in site settings table.
**DoD:** All major UI strings pass through abstraction.
**Stretch:** JSON locale file loader.

### 14. Semantic Events Schema
**Objective:** Consistent analytics events.
**Steps:**
1. Define `events.md` spec (event_name, required props).
2. Utility `track(event, props)` with runtime validation.
3. Emit events: project_view, blog_read, like_toggle, newsletter_subscribe.
**DoD:** Events logged in dev console structured.
**Stretch:** Adapter for external analytics later.

### 15. Background Job Abstraction
**Objective:** Future-proof for async workloads.
**Steps:**
1. Create `jobs/queue.js` (in-memory FIFO now; interface: enqueue(type,payload)).
2. Worker loop processes tasks (e.g., image metadata extraction placeholder).
3. Replace direct heavy logic calls with enqueue.
**DoD:** Jobs run async without blocking request.
**Stretch:** Swap implementation to BullMQ transparently.

### 16. Automated OG Image Generation
**Objective:** Rich sharing previews.
**Steps:**
1. Add serverless function `/api/og/post` generating PNG (satori/canvas).
2. Template: title, author, date, gradient background.
3. Add `<meta property="og:image">` dynamic injection (React Helmet).
**DoD:** Visiting share debugger shows custom image.
**Stretch:** Theming by post tags.

### 17. Minimal Search Telemetry
**Objective:** Understand search behavior post-launch.
**Steps:**
1. Log query + result_count (no PII) when `/api/blog/search` called.
2. Add simple admin panel chart (top queries, zero-result queries).
**DoD:** Dashboard shows distribution.
**Stretch:** Suggest content gaps.

### 18. Privacy & Data Lifecycle
**Objective:** Reduce long-term risk.
**Steps:**
1. Add cron substitute (setInterval) pruning old view logs > 180d.
2. Document retention in README privacy note.
**DoD:** Old rows removed locally.
**Stretch:** Configurable retention per table.

### 19. Error Budget & SLO Draft
**Objective:** Reliability baseline.
**Steps:**
1. Define provisional SLOs (API success rate 99%, latency p95 < 400ms).
2. Extend metrics collection to track success/failure per route.
3. Simple report endpoint `/api/ops/metrics`.
**DoD:** Can manually inspect if error budget consumed.
**Stretch:** Alerting hook stub.

### 20. Progressive TypeScript Adoption
**Objective:** Improve maintainability gradually.
**Steps:**
1. Add `tsconfig.json` with `allowJs` & `checkJs`.
2. Convert utility file (e.g., `src/utils/authService.js`) to `.ts`.
3. Introduce types for API response wrappers.
**DoD:** Build passes, no type regressions; one file typed.
**Stretch:** Convert API handlers.

---
Pick any track and execute independently; they’re intentionally decoupled. Ask to generate GitHub issues for specific tracks when ready.

