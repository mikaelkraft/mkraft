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

## Markdown authoring components (MarkdownField + MarkdownToolbar)

The application ships with a reusable rich markdown editing experience composed of two React components:

- `MarkdownToolbar`: a formatting + embed action bar (stateless aside from UI toggles)
- `MarkdownField`: a higher-level wrapper combining the toolbar with a `<textarea>` and enhanced media UX

Core capabilities

- Headings H1–H6 insertion
- Bold / Italic / Inline code / Code block / Preformatted block
- Blockquote, Bulleted list, Numbered list
- Link insertion (prompt-driven)
- Image upload (via configured `onUploadImage` callback → Supabase Storage today) with automatic markdown snippet insertion
- Media embeds (YouTube / Vimeo / Spotify) using sanitized iframe HTML snippets
- Table insertion (generates a 3x3 markdown table scaffold)
- Emoji picker (lightweight inlined set; inserts at cursor)
- Advanced toggle: hides rarely used embed + table controls behind a disclosure for a cleaner default surface
- Drag & drop image upload (drops anywhere over the field)
- Clipboard paste image upload (pastes PNG/JPEG directly from clipboard)

How uploads work

`MarkdownField` accepts an `onUploadImage(file) -> Promise<{ url: string }>` prop. When provided:

1. User clicks the image button OR drags/drops OR pastes an image
2. The file is passed to `onUploadImage`
3. On success, markdown `![alt text](url)` is injected at the cursor
4. Basic error handling (alert) triggers if the upload fails

Embeds

Embeds are inserted as raw HTML blocks (fenced by blank lines) for immediate preview in most markdown renderers that allow HTML passthrough. Helper utilities in `src/utils/markdownEmbeds.js` provide:

- `parseYouTubeId(urlOrId)`
- `parseVimeoId(urlOrId)`
- `parseSpotify(url)` (returns object describing type + id)
- `buildYouTubeEmbed(id)` / `buildVimeoEmbed(id)` / `buildSpotifyEmbed({ type, id })`

These assist both insertion and (future) server-side sanitation or transformation.

Extending the toolbar

Add a new button by editing `src/components/ui/MarkdownToolbar.jsx`. Follow existing patterns:

1. Implement a small handler that manipulates the textarea selection (receive `textareaRef` via parent `MarkdownField`)
2. Call shared `wrapSelection` or replicate selection logic (maintain start/end indices)
3. Insert text + restore focus

Selection utilities rely on plain DOM—no external markdown library—keeping bundle size low and behavior transparent.

Drag & Drop / Paste specifics

- Drop zone: the wrapping div around the textarea listens for `onDragOver` (preventDefault) and `onDrop`
- Paste handler inspects `event.clipboardData.items` for image types
- Both paths early-return if no `onUploadImage` prop is supplied

Accessibility & UX notes

- Buttons have `aria-label` attributes (add one when introducing new controls)
- Advanced actions collapsed by default reduces cognitive overload for casual editing
- Emoji picker state is toggled separately; clicking outside the picker (blur) can be extended to auto-close if desired

Potential future enhancements (not implemented yet)

- Slash command palette ("/table", " /img ")
- Live markdown preview panel with diff mode
- Syntax highlighting for fenced code blocks while typing
- Automatic link normalization + title fetch
- Pluggable extension registry (pass an array of action descriptors)

Testing

Embed builder + parser functions are covered in `test/markdownToolbar.embed.test.js`. If you add new embed types, extend that file with parser + builder round-trip tests.

## Live preview & slash commands (enhancements)

Added features:

- Preview toggle: renders sanitized HTML (marked + DOMPurify) lazily loaded on first use.
- Slash command palette: type `/` at start of a new token to open a small action list. Supported commands: `/h1`, `/h2`, `/h3`, `/table`, `/code`, `/quote`.

Implementation notes:

- Preview loads `marked` and `dompurify` dynamically to avoid impacting initial bundle.
- Slash detection uses regex `/\/(\w*)$/` on substring up to cursor; removal occurs by replacing final `/<word>` before applying transformed insertion.
- Extend commands by adding entries to `slashActions` in `MarkdownField.jsx` and handling them inside `slashCommand` dispatcher in `markdownInsert.js`.

Security: DOMPurify sanitization applied before injecting preview HTML; production markdown rendering path should also sanitize if raw HTML is permitted.

Usage example

```jsx
<MarkdownField
  value={body}
  onChange={setBody}
  onUploadImage={async (file) => {
    const { url } = await storageService.uploadFile(
      "media",
      file,
      `blog/${file.name}`,
    );
    return { url };
  }}
  placeholder="Write your post..."
  className="min-h-[300px]"
/>
```

The toolbar will automatically wire to the underlying textarea via ref forwarding.

Security reminder

Because raw HTML for embeds is injected, ensure your markdown renderer either sanitizes or restricts to the expected iframe patterns. The provided helpers intentionally constrain attributes (allow, referrerpolicy, loading) to a safe minimal set.

---

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

## Canonical schema, triggers & patch strategy

Canonical baseline

- The file `db/wisdomintech_schema.sql` is the only authoritative base schema.
- Legacy `db/schema.sql` has been marked deprecated; do not edit it further. It remains only for historical reference.

Patch workflow

1. Every additive/change migration goes into a new `db/patch_YYYYMMDD[optional_suffix].sql` file.
2. Each patch must be idempotent (use `IF NOT EXISTS`, `CREATE OR REPLACE`, defensive `DROP TRIGGER IF EXISTS`, etc.).
3. Each patch should insert a marker row into `wisdomintech.__applied_patches` using its filename (without `.sql`) as `patch_name`.
4. The migration runner (`scripts/migrate.js`) now:
   - Applies the base schema (safe to run multiple times)
   - Ensures the marker table exists
   - Fetches already applied markers and only executes new patches
   - Backfills a marker after executing a patch if the patch forgot to insert one

Triggers added (2025-10-02 patch)

`patch_20251002_triggers_and_enhancements.sql` introduced:

- Generic `wisdomintech.set_updated_at()` trigger function applied to all mutable tables
- Soft delete columns (`deleted_at`) on: `blog_posts`, `projects`, `comments`
- Comment count maintenance triggers updating `blog_posts.comment_count` after INSERT/UPDATE/DELETE on `comments`
- Like count recalculation triggers keeping `like_count` in `projects` and `blog_posts` aligned with `wisdomintech.likes` (hero slides currently lack a like counter)

Design notes

- Recalculation over incremental math keeps correctness simple (optimize later with partial increments if needed)
- Soft deletes allow reversible removals and future audit logging without data loss
- All triggers are schema-qualified to avoid search_path issues

Adding a new patch (example template)

```sql
-- Patch: short description (YYYY-MM-DD)
CREATE TABLE IF NOT EXISTS wisdomintech.__applied_patches (
  patch_name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM wisdomintech.__applied_patches WHERE patch_name = 'patch_YYYYMMDD_feature') THEN
    -- Your idempotent DDL / DML here
    ALTER TABLE wisdomintech.projects ADD COLUMN IF NOT EXISTS some_new_column TEXT;
    INSERT INTO wisdomintech.__applied_patches(patch_name) VALUES('patch_YYYYMMDD_feature');
  END IF;
END
$$;
```

Operational guidance

- Local dev: rerun `npm run migrate` anytime; only unapplied patches run.
- CI: treat migration as part of bootstrapping ephemeral DB for integration tests (repeatable because of idempotency).
- Production: run the script during deploy (pre-start hook) to auto-apply new patches.

Future improvements (optional)

- Replace recalculation triggers with lighter incremental counters if performance profiling indicates need.
- Add audit tables capturing OLD/NEW rows for moderation / history.
- Introduce row-level security (RLS) if you migrate authenticated writes into this Postgres (currently not required for public reads via server API layer).

Security reminders

- Always qualify function and trigger names with schema to prevent collisions.
- Keep destructive DDL (DROP COLUMN, etc.) in dedicated patches reviewed carefully—avoid inlining into multi-purpose enhancement patches.

## Operational & metadata endpoints

### /api/health

Extended response includes infrastructure + performance + cache diagnostics:

- `dbLatencyMs`: round trip latency for a simple `SELECT 1`
- `version`: from `APP_VERSION` env (fallback package.json version)
- `commit`: from `GIT_COMMIT` / `VERCEL_GIT_COMMIT_SHA`
- `patches.applied`: integer count of applied schema patches
- `metrics`: internal app metrics snapshot (extensible)
- `memory`: process memory usage (`rss`, `heapUsed`, `heapTotal`, `external`)
- `uptimeSec`: process uptime seconds
- `flagCache`: feature flag cache diagnostics `{ count, ttlMs, ageMs, stale }`

Sample (fields truncated for brevity):

```json
{
  "status": "ok",
  "db": "up",
  "dbLatencyMs": 4,
  "version": "0.3.0",
  "commit": "a1b2c3d",
  "patches": { "applied": 12 },
  "memory": { "rss": 74289152, "heapUsed": 18273640 },
  "uptimeSec": 351,
  "flagCache": { "count": 5, "ttlMs": 30000, "ageMs": 1200, "stale": false },
  "timestamp": "2025-10-02T12:00:00.000Z"
}
```

### /api/meta

Returns build + schema + feature flag snapshot. Add `?verbose=1` for extended diagnostics:

Verbose additions:

- `tableCounts`: lightweight counts for selected content tables
- `featureFlags.list`: array of `{ key, enabled, note, updated_at }`
- `featureFlags.map`: key -> boolean map for quick lookups
- `flagCache`: cache timing diagnostics `{ ttlMs, loadedAt, ageMs, stale }`

### /api/feature-flags

Admin endpoint for inspecting and toggling feature flags.

Methods:

- GET `/api/feature-flags` -> `{ flags: { key: boolean, ... } }` (forces refresh)
- POST `/api/feature-flags` body: `{ key: string, enabled: boolean, note?: string }` -> upserts flag (admin auth required via Supabase JWT / admin email heuristic)

### Tooling additions

- Patch generator: `npm run new:patch add_column_x` creates a timestamped patch template.
- Pre-push hook: runs lint + full tests before pushing.
- GitHub Actions CI (`.github/workflows/ci.yml`): lint + tests on pushes and PRs to `main`.

```json
{
  "status": "ok",
  "version": "0.3.0",
  "commit": "a1b2c3d",
  "patches": [
    {
      "patch_name": "patch_20251002_triggers_and_enhancements",
      "applied_at": "2025-10-02T11:58:00Z"
    }
  ],
  "featureFlags": { "experimentalMarkdown": true },
  "timestamp": "2025-10-02T12:00:01.000Z"
}
```

## Feature flags

Loader utility: `api/_lib/featureFlags.js`

Resolution order:

1. Dedicated table `wisdomintech.feature_flags` (columns: key TEXT PK, enabled BOOLEAN)
2. Fallback to `site_settings.ui` JSON path `ui.featureFlags`

Caching: in-memory TTL (default 30s via `FEATURE_FLAGS_TTL_MS`). Call `getFeatureFlags(true)` to force refresh. Diagnostics exposed:

- `/api/health` → `flagCache.count`, `ttlMs`, `ageMs`, `stale`
- `/api/meta?verbose=1` → `flagCache.loadedAt` (ISO), `ageMs`, `stale`

Client usage (example future wiring): expose subset via `/api/meta` or dedicated endpoint, then hydrate a React context.

## Server markdown sanitization

Utility: `api/_lib/markdownSanitize.js`

Pipeline (current implementation):

1. Parse a minimal subset of markdown (headings, bold, italic, inline code, paragraphs) via an internal `miniMarkdown` string transformer. No external parser libraries are used server-side.
2. Insert raw HTML placeholders for trusted iframe embed snippets before markdown transformation to avoid interference, then restore them after textual formatting.
3. Load the result into JSDOM and perform a strict whitelist scrub:

- Allowed tags: small curated set (paragraphs, headings, emphasis, code, lists, tables, img, iframe)
- Attribute filtering per tag (only safe attributes preserved; `javascript:` and non-image `data:` URLs stripped)
- Iframe `src` must match YouTube / Vimeo / Spotify allow-list regexes or the node is removed.

4. Enforce lazy loading + referrer policy on iframes.

Rationale:

- Eliminates dependency weight / SSR bundling complexity from `marked` + `dompurify`.
- Reduces attack surface by never generating broader HTML than explicitly supported.
- Keeps behavior deterministic for tests and future extension.

Usage in an endpoint:

```js
const { sanitizeMarkdown } = require("../_lib/markdownSanitize");
const safeHtml = sanitizeMarkdown(untrustedMarkdownString);
```

Tests: `test/markdown.sanitize.test.js` covers iframe allow-list, tag stripping, attribute pruning, and italic/bold interactions with placeholders.

Future enhancements (optional):

- Add fenced code block handling with language class whitelisting
- Permit configurable additional iframe origins passed via env/array
- Swap mini parser for a battle-tested library if expanded markdown breadth is later required (still pass through same scrub stage)

Security note: Because we explicitly re-escape user text before HTML shaping and then enforce tag/attribute origin constraints, the sanitizer rejects inline event handlers, script URLs, and unexpected embeds.

## Supabase Postgres deployment (content schema alternative)

If you prefer to host the canonical content schema on Supabase Postgres instead of (or in addition to) Neon:

1. Create a new Supabase project (or reuse an existing one). Obtain the connection string (Project Settings → Database → Connection string → URI).
2. Add that string to your local `.env` as `POSTGRES_URL` (Supabase includes `?sslmode=require` automatically for external connections).
3. Run migrations locally:

```bash
npm run migrate
```

4. (Optional) Seed:

```bash
npm run seed
```

5. Confirm applied patches:

```sql
SELECT patch_name, applied_at FROM wisdomintech.__applied_patches ORDER BY applied_at;
```

6. In Supabase dashboard, disable (or do not enable) Row Level Security for publicly read tables since the API layer sits in front (you can later move to RLS with service key usage if you expose direct client queries).
7. Keep Supabase Auth & Storage usage unchanged; your API `/api/*` endpoints will hit the same Supabase Postgres instead of Neon transparently because only `POSTGRES_URL` changed.

Considerations:

- Supabase migration history table (their own internal tracking) is separate; we maintain our own patch registry to stay portable across providers.
- If you already had data in Supabase, ensure column additions are backward-compatible (all patches are additive / idempotent by design).

## Verification & rollback guidance

## End-to-end migration steps (Neon + Supabase Auth/Storage)

Below is a concise, repeatable playbook to stand up (or re-sync) the full content schema on a fresh Postgres (Neon) while retaining Supabase for Auth + Storage.

### 1. Prerequisites

- Node.js installed (>=18)
- Access to a Neon project (or any Postgres URL) and a Supabase project for Auth/Storage
- Environment variables prepared (see `.env.example`)

### 2. Create / update your `.env`

Minimum required for migrations:

```
POSTGRES_URL=postgres://user:pass@host:5432/dbname
POSTGRES_SSL=true
FEATURE_FLAGS_TTL_MS=30000
```

Optional (but recommended) duplicates:

```
DATABASE_URL=${POSTGRES_URL}
PG_POOL_MAX=5
PG_IDLE_TIMEOUT=30000
```

Add Supabase auth if you will exercise admin endpoints locally:

```
SUPABASE_URL=... (project URL)
SUPABASE_ANON_KEY=... (anon key)
ADMIN_EMAIL=your_admin_email
```

### 3. Run migrations

Command (idempotent: safe to re-run):

```bash
npm run migrate
```

What happens:

1. Applies `db/wisdomintech_schema.sql` (CREATE SCHEMA + tables/functions/triggers) – safe if already present
2. Ensures marker table: `wisdomintech.__applied_patches`
3. Discovers patch files matching `patch_*.sql` (sorted lexicographically)
4. Skips any patch whose filename (without `.sql`) is already in marker table
5. Executes remaining patches in order; each patch inserts its own marker or the runner backfills it

### 4. Verify schema state

Using psql (or any SQL client):

```sql
SELECT patch_name, applied_at FROM wisdomintech.__applied_patches ORDER BY applied_at;
```

Result should list every `patch_YYYYMMDD...` file present in `db/` locally.

Quick object spot checks:

```sql
\dt wisdomintech.*                -- all tables
\d wisdomintech.blog_posts        -- confirm updated_at, deleted_at, like_count, comment_count
\df+ wisdomintech.set_updated_at  -- trigger function
```

### 5. Seed (optional)

If you have a `scripts/seed.js` implemented:

```bash
npm run seed
```

### 6. Run API locally

```bash
npm run dev:api
```

Hit health + meta endpoints:

```bash
curl -s http://localhost:5000/api/health | jq '.status, .patches'
curl -s http://localhost:5000/api/meta?verbose=1 | jq '.patches | length'
```

### 7. Deploy (Vercel example)

In Vercel project settings → Environment Variables (Production & Preview):

```
POSTGRES_URL=...
POSTGRES_SSL=true
DATABASE_URL=...              # optional mirror
FEATURE_FLAGS_TTL_MS=30000
VITE_USE_API=true
VITE_API_BASE_URL=/api
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
ADMIN_EMAIL=...
SITE_BASE_URL=https://your-domain
VITE_SITE_BASE_URL=https://your-domain
```

After first deploy, Vercel serverless function cold start will execute migration (if you wire it as a build/prestart step) or invoke manually once by calling a protected admin route that triggers migration (future enhancement).

### 8. Ongoing patch workflow

1. Generate new patch skeleton:

```bash
npm run new:patch add_feature_xyz
```

2. Edit generated file in `db/patch_YYYYMMDD_add_feature_xyz.sql`
3. Make idempotent changes (use IF NOT EXISTS / CREATE OR REPLACE)
4. Add marker insert inside patch block
5. Commit & push → deploy → migration runner applies only new patch

### 9. Troubleshooting

| Symptom                                       | Likely Cause                        | Resolution                                             |
| --------------------------------------------- | ----------------------------------- | ------------------------------------------------------ |
| Migration script exits: POSTGRES_URL required | Env var missing in runtime          | Set POSTGRES_URL locally / provider                    |
| Patch not applying                            | Filename marker already inserted    | Rename patch (new file) with correct change and push   |
| Health endpoint slow                          | Network latency to managed Postgres | Confirm region proximity; reduce cold start by warming |
| Flag cache stale too long                     | TTL too high                        | Lower FEATURE_FLAGS_TTL_MS                             |

### 10. Supabase-only deployment variant

If you use Supabase Postgres for content + Auth + Storage:

1. Set `POSTGRES_URL` to Supabase connection string (includes `sslmode=require`)
2. Run `npm run migrate`
3. Keep `SUPABASE_URL` / `SUPABASE_ANON_KEY` for auth in both server and client
4. All API reads now target Supabase Postgres transparently

No further adjustments required—the schema + patches are provider-agnostic.

Verification after deploy:

1. Health endpoint: `GET /api/health` should report `status: ok` and a non-zero `patches.applied` count.
2. Meta endpoint: `GET /api/meta` should list the latest patch filename matching the most recent file in `db/`.
3. Schema introspection (psql):

```sql
\dt wisdomintech.*
SELECT count(*) FROM wisdomintech.__applied_patches;
```

4. Trigger spot check (example):

```sql
\d wisdomintech.blog_posts  -- verify updated_at, deleted_at columns
\df+ wisdomintech.set_updated_at
```

5. Feature flags load test:

```sql
INSERT INTO wisdomintech.feature_flags (flag_key, enabled) VALUES ('_verification_temp', true)
ON CONFLICT (flag_key) DO NOTHING;
SELECT * FROM wisdomintech.feature_flags WHERE flag_key = '_verification_temp';
```

Then call `/api/meta` (if it exposes flags) or rely on `/api/_lib/featureFlags.js` via a temporary diagnostic endpoint to confirm caching.

Rollback strategy (lightweight):

- Because patches are additive and idempotent, rollback typically means deploying a hotfix patch that negates prior unintended changes (e.g., setting a flag false, dropping an accidentally added trigger) rather than deleting history.
- Avoid deleting rows from `__applied_patches`; instead, create a compensating patch file (e.g., `patch_20251003_compensate_bad_trigger.sql`) that reverses or amends prior DDL.
- For catastrophic cases (rare), snapshot the DB (provider backup) before applying new patches; restore from snapshot if needed.

Suggested compensating patch template:

```sql
-- Patch: Remove incorrect trigger (YYYY-MM-DD)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM wisdomintech.__applied_patches WHERE patch_name = 'patch_20251003_compensate_bad_trigger'
  ) THEN
   DROP TRIGGER IF EXISTS some_faulty_trigger ON wisdomintech.blog_posts;
   INSERT INTO wisdomintech.__applied_patches(patch_name) VALUES('patch_20251003_compensate_bad_trigger');
  END IF;
END$$;
```

Operational checklist (post-deploy):

- [ ] Migrations applied cleanly (no errors in logs)
- [ ] `/api/health` ok + latency within expected bounds
- [ ] `/api/meta` lists new patch
- [ ] Sample blog post request still resolves (e.g., `/api/blog/by-slug?slug=...`)
- [ ] Feature flags reflect expected values
- [ ] No unexpected privilege errors (search logs for `permission denied`)
