// Monolithic Vercel Function
// Proxies all /api/* requests to the appropriate handlers in ../backend

const express = require("express");
const nodeCrypto = require("crypto");
const path = require("path");

const { withTransform } = require("../backend/_lib/responseWrap.js");
const { log } = require("../backend/_lib/log.js");
const { inc, observe } = require("../backend/_lib/metrics.js");
const { resolveBaseUrl } = require("../backend/_lib/respond.js");

const app = express();
app.use(express.json());

// Request ID + metrics + access logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestId =
    req.headers["x-request-id"] || nodeCrypto.randomBytes(8).toString("hex");
  req.id = requestId;
  res.setHeader("x-request-id", requestId);
  inc("requests_total");
  inc(`method_${req.method.toLowerCase()}_total`);
  res.on("finish", () => {
    const ms = Date.now() - start;
    observe("latency_ms", ms);
    inc(`status_${res.statusCode}_total`);
    log.info("access", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      ms,
    });
  });
  next();
});

// Updated wrapper with structured logging & metrics
const wrap = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (e) {
    inc("handler_errors_total");
    log.error("handler_error", {
      requestId: req.id,
      err: e.message,
      stack: e.stack,
    });
    res.status(500).json({
      error: "Internal Server Error",
      detail: e.message,
      requestId: req.id,
    });
  }
};

// Mount API routes
// Note: These paths must match the requests provided by Vercel
app.all(
  "/api/settings",
  wrap(
    withTransform(require("../backend/settings/index.js"), {
      camel: true,
      cacheSeconds: 30,
    }),
  ),
);
app.all(
  "/api/settings/features",
  wrap(
    withTransform(require("../backend/settings/features.js"), {
      camel: true,
      cacheSeconds: 5,
    }),
  ),
);
app.all(
  "/api/projects",
  wrap(
    withTransform(require("../backend/projects/index.js"), {
      camel: true,
      cacheSeconds: 10,
    }),
  ),
);
app.all(
  "/api/projects/by-id",
  wrap(
    withTransform(require("../backend/projects/by-id.js"), {
      camel: true,
      cacheSeconds: 10,
    }),
  ),
);
app.all(
  "/api/blog",
  wrap(
    withTransform(require("../backend/blog/index.js"), {
      camel: true,
      cacheSeconds: 15,
    }),
  ),
);
app.all(
  "/api/blog/by-slug",
  wrap(
    withTransform(require("../backend/blog/by-slug.js"), {
      camel: true,
      cacheSeconds: 60,
    }),
  ),
);
app.all(
  "/api/blog/related",
  wrap(
    withTransform(require("../backend/blog/related.js"), {
      camel: true,
      cacheSeconds: 30,
    }),
  ),
);
app.all(
  "/api/blog/revisions",
  wrap(withTransform(require("../backend/blog/revisions.js"), { camel: true })),
);
app.all(
  "/api/blog/search",
  wrap(
    withTransform(require("../backend/blog/search.js"), {
      camel: true,
      cacheSeconds: 10,
    }),
  ),
);
app.all(
  "/api/slides",
  wrap(
    withTransform(require("../backend/slides/index.js"), {
      camel: true,
      cacheSeconds: 30,
    }),
  ),
);
app.all("/api/slides/reorder", wrap(require("../backend/slides/reorder.js")));
app.all(
  "/api/comments",
  wrap(withTransform(require("../backend/comments/index.js"), { camel: true })),
);
app.all(
  "/api/comments/moderate",
  wrap(
    withTransform(require("../backend/comments/moderate.js"), { camel: true }),
  ),
);
app.all(
  "/api/likes/toggle",
  wrap(withTransform(require("../backend/likes/toggle.js"), { camel: true })),
);
app.all(
  "/api/views/increment",
  wrap(
    withTransform(require("../backend/views/increment.js"), { camel: true }),
  ),
);
app.all(
  "/api/newsletter",
  wrap(
    withTransform(require("../backend/newsletter/index.js"), { camel: true }),
  ),
);
app.all(
  "/api/profile/avatar",
  wrap(withTransform(require("../backend/profile/avatar.js"), { camel: true })),
);
app.all(
  "/api/media",
  wrap(withTransform(require("../backend/media/index.js"), { camel: true })),
);
app.all(
  "/api/media/upload",
  wrap(withTransform(require("../backend/media/upload.js"), { camel: true })),
);
app.all("/api/health", wrap(require("../backend/health/index.js")));
app.get("/sitemap.xml", wrap(require("../backend/sitemap.xml.js")));
// Publisher program related routes
app.all(
  "/api/profile/publisher-request",
  wrap(
    withTransform(require("../backend/profile/publisher-request.js"), {
      camel: true,
    }),
  ),
);
app.all(
  "/api/profile/publisher-requests",
  wrap(
    withTransform(require("../backend/profile/publisher-requests.js"), {
      camel: true,
    }),
  ),
);
app.all(
  "/api/profile/publisher-approval",
  wrap(
    withTransform(require("../backend/profile/publisher-approval.js"), {
      camel: true,
    }),
  ),
);
// User management (admin)
app.all(
  "/api/admin/users",
  wrap(
    withTransform(require("../backend/admin/users/index.js"), { camel: true }),
  ),
);
app.all(
  "/api/admin/users/warn",
  wrap(
    withTransform(require("../backend/admin/users/warn.js"), { camel: true }),
  ),
);
app.all(
  "/api/admin/users/ban",
  wrap(
    withTransform(require("../backend/admin/users/ban.js"), { camel: true }),
  ),
);

// Fallback for unhandled API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports = app;
