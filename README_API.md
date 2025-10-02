API + Postgres quick start

1. Configure environment

Create a .env file with at least:

- POSTGRES_URL=postgres://user:pass@host:5432/dbname
- POSTGRES_SSL=true # most managed providers require SSL
- ADMIN_EMAIL=admin@example.com
- SUPABASE_URL=... # for admin verification via Supabase auth
- SUPABASE_ANON_KEY=...
- VITE_USE_API=true
- VITE_API_BASE_URL=/api

2. Initialize database

Run the portable schema against your Postgres:

npm run migrate

npm run dev:api

This starts Express on http://localhost:5000 and mounts all /api endpoints.

4. Start client

In another terminal:

npm run dev:client

Vite runs on http://localhost:4028. With VITE_USE_API=true and VITE_API_BASE_URL=/api, the client will call the local API.

5. Production

Build the client:

npm run build

Run Express in production mode to serve /api and the built frontend (optional):

NODE_ENV=production PORT=5000 node server.js
API and Postgres alternative (No Supabase custom domain)

Overview

- Keep Supabase Auth for admin login on the free plan.
- Move data reads (public content) to your own Postgres (Neon/Railway/Render) via Vercel serverless API in /api.
- Writes (admin CRUD) can remain via Supabase for now, or you can extend the API with auth checks.

What changes are included

- /api/\* endpoints backed by node-postgres:
  - GET /api/settings -> site settings (single row)
  - GET /api/projects?published=true&featured=true -> list projects
  - GET /api/projects/by-id?id=... -> one project
  - GET /api/blog?published=true&search=...&category=...&tag=... -> list posts
  - GET /api/blog/by-slug?slug=... -> one post with comments
  - GET /api/slides?published=true -> hero slides
- Feature flag on client: set VITE_USE_API=true to use API for reads.
- SQL schema at db/schema.sql creates schema wisdomintech and tables.

Setup steps

1. Provision Postgres

   - Neon (Free), Railway, Render, Supabase Postgres-only (self-hosted) all work.
   - Get a POSTGRES_URL (psql connection string). Enable SSL if required.

2. Apply schema

   - Run the SQL in db/schema.sql on your database.

3. Configure Vercel project

   - Add environment variables (Production/Preview):
     - POSTGRES_URL=...
     - POSTGRES_SSL=true
     - VITE_USE_API=true
     - VITE_API_BASE_URL=/api (or your external URL)
     - VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (for Auth)
     - VITE_ADMIN_EMAIL=your_admin_email
     - SUPABASE_JWKS_URL=<your-supabase-url>/auth/v1/keys (optional; auth middleware for future writes)

4. Deploy
   - Push to GitHub; Vercel will build and serve Vite static assets and serverless functions in /api.

Notes

- Current code only uses API for public GETs. Admin writes still use Supabase. You can migrate writes later by adding POST/PUT/DELETE endpoints that verify Supabase JWT in Authorization header (see api/\_lib/auth.js).
- Storage: Image/video uploads are still going to Supabase Storage per earlier wiring. You can keep that or swap to S3-compatible storage later.
- If you keep everything read-only via API, you do not need JWT verification yet.

Neon + Supabase recommended setup

- Neon (or Railway/Render) hosts your Postgres for all content, reachable from anywhere.
- Supabase is used for Auth (login) and Storage (media uploads) only.

Environment variables

- POSTGRES_URL: your Neon connection string
- POSTGRES_SSL: true
- VITE_USE_API: true
- VITE_API_BASE_URL: /api (or your deployed API URL)
- VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY: for Supabase Auth/Storage
- ADMIN_EMAIL: account allowed to perform admin API writes

Setup flow

1. Create Neon project and copy the connection string.
2. Create Supabase project; copy URL and ANON key; create storage buckets (e.g., media, logos) in Storage.
3. Add env vars to local .env and your hosting provider.
4. Run: npm run migrate (applies db/wisdomintech_schema.sql to Neon)
5. Optional: npm run seed
6. Start API: npm run dev:api (or deploy to Vercel)
7. Start client: npm run dev:client
