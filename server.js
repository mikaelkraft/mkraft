// Simple Express adapter to run the serverless API locally or on any Node host
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const nodeCrypto = require("crypto");

const { withTransform } = require("./backend/_lib/responseWrap.js");
const { log } = require("./backend/_lib/log.js");
const { inc, observe } = require("./backend/_lib/metrics.js");
const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

const { resolveBaseUrl } = require("./backend/_lib/respond.js");
// Host mismatch warning (production only)
if (process.env.NODE_ENV === "production") {
  const configured = (() => {
    try {
      return new URL(resolveBaseUrl()).host;
    } catch {
      return null;
    }
  })();
  if (configured) {
    app.use((req, res, next) => {
      const host = (req.headers.host || "").split(",")[0].trim();
      if (host && host !== configured) {
        console.warn(
          `[host-mismatch] incoming host "${host}" differs from configured base host "${configured}"`,
        );
      }
      next();
    });
  }
}

// Request ID + metrics + access logging middleware (must precede routes)
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

// Mount API routes by reusing the serverless handlers
app.all(
  "/api/settings",
  wrap(
    withTransform(require("./backend/settings/index.js"), {
      camel: true,
      cacheSeconds: 30,
    }),
  ),
);
app.all(
  "/api/settings/features",
  wrap(
    withTransform(require("./backend/settings/features.js"), {
      camel: true,
      cacheSeconds: 5,
    }),
  ),
);
app.all(
  "/api/projects",
  wrap(
    withTransform(require("./backend/projects/index.js"), {
      camel: true,
      cacheSeconds: 10,
    }),
  ),
);
app.all(
  "/api/projects/by-id",
  wrap(
    withTransform(require("./backend/projects/by-id.js"), {
      camel: true,
      cacheSeconds: 10,
    }),
  ),
);
app.all(
  "/api/blog",
  wrap(
    withTransform(require("./backend/blog/index.js"), {
      camel: true,
      cacheSeconds: 15,
    }),
  ),
);
app.all(
  "/api/blog/by-slug",
  wrap(
    withTransform(require("./backend/blog/by-slug.js"), {
      camel: true,
      cacheSeconds: 60,
    }),
  ),
);
app.all(
  "/api/blog/related",
  wrap(
    withTransform(require("./backend/blog/related.js"), {
      camel: true,
      cacheSeconds: 30,
    }),
  ),
);
app.all(
  "/api/blog/revisions",
  wrap(withTransform(require("./backend/blog/revisions.js"), { camel: true })),
);
app.all(
  "/api/blog/search",
  wrap(
    withTransform(require("./backend/blog/search.js"), {
      camel: true,
      cacheSeconds: 10,
    }),
  ),
);
app.all(
  "/api/slides",
  wrap(
    withTransform(require("./backend/slides/index.js"), {
      camel: true,
      cacheSeconds: 30,
    }),
  ),
);
app.all("/api/slides/reorder", wrap(require("./backend/slides/reorder.js")));
app.all(
  "/api/comments",
  wrap(withTransform(require("./backend/comments/index.js"), { camel: true })),
);
app.all(
  "/api/comments/moderate",
  wrap(
    withTransform(require("./backend/comments/moderate.js"), { camel: true }),
  ),
);
app.all(
  "/api/likes/toggle",
  wrap(withTransform(require("./backend/likes/toggle.js"), { camel: true })),
);
app.all(
  "/api/views/increment",
  wrap(withTransform(require("./backend/views/increment.js"), { camel: true })),
);
app.all(
  "/api/newsletter",
  wrap(
    withTransform(require("./backend/newsletter/index.js"), { camel: true }),
  ),
);
app.all(
  "/api/profile/avatar",
  wrap(withTransform(require("./backend/profile/avatar.js"), { camel: true })),
);
app.all(
  "/api/media",
  wrap(withTransform(require("./backend/media/index.js"), { camel: true })),
);
app.all(
  "/api/media/upload",
  wrap(withTransform(require("./backend/media/upload.js"), { camel: true })),
);
app.all("/api/health", wrap(require("./backend/health/index.js")));
app.get("/sitemap.xml", wrap(require("./backend/sitemap.xml.js")));
// Publisher program related routes
app.all(
  "/api/profile/publisher-request",
  wrap(
    withTransform(require("./backend/profile/publisher-request.js"), {
      camel: true,
    }),
  ),
);
app.all(
  "/api/profile/publisher-requests",
  wrap(
    withTransform(require("./backend/profile/publisher-requests.js"), {
      camel: true,
    }),
  ),
);
app.all(
  "/api/profile/publisher-approval",
  wrap(
    withTransform(require("./backend/profile/publisher-approval.js"), {
      camel: true,
    }),
  ),
);
// User management (admin)
app.all(
  "/api/admin/users",
  wrap(
    withTransform(require("./backend/admin/users/index.js"), { camel: true }),
  ),
);
app.all(
  "/api/admin/users/warn",
  wrap(
    withTransform(require("./backend/admin/users/warn.js"), { camel: true }),
  ),
);
app.all(
  "/api/admin/users/ban",
  wrap(withTransform(require("./backend/admin/users/ban.js"), { camel: true })),
);

// Health check
app.get("/healthz", (req, res) => res.json({ ok: true }));

// Optionally serve the built frontend in production
if (process.env.NODE_ENV === "production") {
  const buildDir = path.join(__dirname, "dist");
  app.use(express.static(buildDir));
  app.get("*", (req, res) => res.sendFile(path.join(buildDir, "index.html")));
}

const argPort = process.argv[2];
const rawPort = (argPort || process.env.API_PORT || process.env.PORT || "5000")
  .toString()
  .trim();
const PORT = Number.parseInt(rawPort, 10) || 5000;
app.listen(PORT, () => {
  const base = resolveBaseUrl();
  console.warn(
    `[startup] API server listening on ${base.replace(/\/$/, "")}/ (port ${PORT})`,
  );
});
