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
