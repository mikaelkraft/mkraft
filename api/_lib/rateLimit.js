// Simple in-memory rate limiter (per key) for low-volume deployments.
// Not suitable for multi-instance horizontal scaling (would need Redis or similar).

const buckets = new Map();

function rateLimit({ windowMs = 60_000, max = 30, keyGenerator } = {}) {
  return (req, res, next) => {
    try {
      const now = Date.now();
      const key = keyGenerator ? keyGenerator(req) : (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown');
      if (!buckets.has(key)) {
        buckets.set(key, []);
      }
      const arr = buckets.get(key);
      // prune
      while (arr.length && (now - arr[0]) > windowMs) arr.shift();
      if (arr.length >= max) {
        res.status(429).setHeader('content-type','application/json').end(JSON.stringify({ error: 'Rate limit exceeded' }));
        return;
      }
      arr.push(now);
      next();
    } catch (e) {
      next(); // fail-open
    }
  };
}

module.exports = { rateLimit };
