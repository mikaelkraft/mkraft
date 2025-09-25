// Simple Express adapter to run the serverless API locally or on any Node host
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const { withTransform } = require('./api/_lib/responseWrap.js');
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
app.all('/api/settings', wrap(withTransform(require('./api/settings/index.js'), { camel: true, cacheSeconds: 30 })));
app.all('/api/projects', wrap(withTransform(require('./api/projects/index.js'), { camel: true, cacheSeconds: 10 })));
app.all('/api/projects/by-id', wrap(withTransform(require('./api/projects/by-id.js'), { camel: true, cacheSeconds: 10 })));
app.all('/api/blog', wrap(withTransform(require('./api/blog/index.js'), { camel: true, cacheSeconds: 15 })));
app.all('/api/blog/by-slug', wrap(withTransform(require('./api/blog/by-slug.js'), { camel: true, cacheSeconds: 60 })));
app.all('/api/slides', wrap(withTransform(require('./api/slides/index.js'), { camel: true, cacheSeconds: 30 })));
app.all('/api/slides/reorder', wrap(require('./api/slides/reorder.js')));
app.all('/api/comments', wrap(require('./api/comments/index.js')));
app.all('/api/comments/moderate', wrap(require('./api/comments/moderate.js')));
app.all('/api/likes/toggle', wrap(require('./api/likes/toggle.js')));
app.all('/api/views/increment', wrap(require('./api/views/increment.js')));
app.all('/api/newsletter', wrap(require('./api/newsletter/index.js')));
app.all('/api/health', wrap(require('./api/health/index.js')));

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
