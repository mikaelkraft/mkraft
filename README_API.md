API and Postgres alternative (No Supabase custom domain)

Overview
- Keep Supabase Auth for admin login on the free plan.
- Move data reads (public content) to your own Postgres (Neon/Railway/Render) via Vercel serverless API in /api.
- Writes (admin CRUD) can remain via Supabase for now, or you can extend the API with auth checks.

What changes are included
- /api/* endpoints backed by node-postgres:
  - GET /api/settings -> site settings (single row)
  - GET /api/projects?published=true&featured=true -> list projects
  - GET /api/projects/by-id?id=... -> one project
  - GET /api/blog?published=true&search=...&category=...&tag=... -> list posts
  - GET /api/blog/by-slug?slug=... -> one post with comments
  - GET /api/slides?published=true -> hero slides
- Feature flag on client: set VITE_USE_API=true to use API for reads.
- SQL schema at db/schema.sql creates schema wisdomintech and tables.

Setup steps
1) Provision Postgres
   - Neon (Free), Railway, Render, Supabase Postgres-only (self-hosted) all work.
   - Get a POSTGRES_URL (psql connection string). Enable SSL if required.

2) Apply schema
   - Run the SQL in db/schema.sql on your database.

3) Configure Vercel project
   - Add environment variables (Production/Preview):
     - POSTGRES_URL=...
     - POSTGRES_SSL=true
     - VITE_USE_API=true
     - VITE_API_BASE_URL=/api (or your external URL)
     - VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (for Auth)
     - VITE_ADMIN_EMAIL=your_admin_email
     - SUPABASE_JWKS_URL=<your-supabase-url>/auth/v1/keys (optional; auth middleware for future writes)

4) Deploy
   - Push to GitHub; Vercel will build and serve Vite static assets and serverless functions in /api.

Notes
- Current code only uses API for public GETs. Admin writes still use Supabase. You can migrate writes later by adding POST/PUT/DELETE endpoints that verify Supabase JWT in Authorization header (see api/_lib/auth.js).
- Storage: Image/video uploads are still going to Supabase Storage per earlier wiring. You can keep that or swap to S3-compatible storage later.
- If you keep everything read-only via API, you do not need JWT verification yet.
