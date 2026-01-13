const { resolveBaseUrl } = require("./_lib/respond.js");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }
    const base = resolveBaseUrl();
    const lines = [
      "User-agent: *",
      "Disallow:",
      "",
      `Sitemap: ${base}/sitemap.xml`,
    ];
    res.statusCode = 200;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.setHeader("cache-control", "public, max-age=3600");
    res.end(lines.join("\n"));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain");
    res.end("robots generation failed");
  }
};
