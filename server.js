// Simple Express adapter to run the serverless API locally or on any Node host
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const { withTransform } = require('./api/_lib/responseWrap.js');
const { log } = require('./api/_lib/log.js');
const { inc, observe } = require('./api/_lib/metrics.js');
const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Request ID + metrics + access logging middleware (must precede routes)
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || crypto.randomBytes(8).toString('hex');
  req.id = requestId;
  res.setHeader('x-request-id', requestId);
  inc('requests_total');
  inc(`method_${req.method.toLowerCase()}_total`);
  res.on('finish', () => {
    const ms = Date.now() - start;
    observe('latency_ms', ms);
    inc(`status_${res.statusCode}_total`);
    log.info('access', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      ms
    });
  });
  next();
});

// Updated wrapper with structured logging & metrics
const wrap = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (e) {
    inc('handler_errors_total');
    log.error('handler_error', { requestId: req.id, err: e.message, stack: e.stack });
    res.status(500).json({ error: 'Internal Server Error', detail: e.message, requestId: req.id });
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
app.all('/api/comments', wrap(withTransform(require('./api/comments/index.js'), { camel: true })));
app.all('/api/comments/moderate', wrap(withTransform(require('./api/comments/moderate.js'), { camel: true })));
app.all('/api/likes/toggle', wrap(withTransform(require('./api/likes/toggle.js'), { camel: true })));
app.all('/api/views/increment', wrap(withTransform(require('./api/views/increment.js'), { camel: true })));
app.all('/api/newsletter', wrap(withTransform(require('./api/newsletter/index.js'), { camel: true })));
app.all('/api/profile/avatar', wrap(withTransform(require('./api/profile/avatar.js'), { camel: true })));
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
