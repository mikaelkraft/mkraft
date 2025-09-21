// Simple Express adapter to run the serverless API locally or on any Node host
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Small wrapper to normalize error handling
const wrap = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (e) {
    console.error('Handler error:', e);
    res.status(500).json({ error: 'Internal Server Error', detail: e.message });
  }
};

// Mount API routes by reusing the serverless handlers
app.all('/api/settings', wrap(require('./api/settings/index.js')));
app.all('/api/projects', wrap(require('./api/projects/index.js')));
app.all('/api/projects/by-id', wrap(require('./api/projects/by-id.js')));
app.all('/api/blog', wrap(require('./api/blog/index.js')));
app.all('/api/blog/by-slug', wrap(require('./api/blog/by-slug.js')));
app.all('/api/slides', wrap(require('./api/slides/index.js')));
app.all('/api/comments', wrap(require('./api/comments/index.js')));
app.all('/api/likes/toggle', wrap(require('./api/likes/toggle.js')));
app.all('/api/views/increment', wrap(require('./api/views/increment.js')));

// Health check
app.get('/healthz', (req, res) => res.json({ ok: true }));

// Optionally serve the built frontend in production
if (process.env.NODE_ENV === 'production') {
  const buildDir = path.join(__dirname, 'build');
  app.use(express.static(buildDir));
  app.get('*', (req, res) => res.sendFile(path.join(buildDir, 'index.html')));
}

const argPort = process.argv[2];
const rawPort = (argPort || process.env.API_PORT || process.env.PORT || '5000').toString().trim();
const PORT = Number.parseInt(rawPort, 10) || 5000;
app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`));
