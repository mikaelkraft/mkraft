function json(res, body, status = 200) {
  res.status(status).setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function error(res, message, status = 400, extra = {}) {
  json(res, { error: message, ...extra }, status);
}

function getUrl(req) {
  try {
    const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost';
    return new URL(req.url, base);
  } catch {
    // fallback for older runtimes
    const query = req.query || {};
    const params = new URLSearchParams(query);
    return new URL(`${req.url}?${params.toString()}`, 'http://localhost');
  }
}

module.exports = { json, error, getUrl };
