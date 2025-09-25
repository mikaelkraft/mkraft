const crypto = require('crypto');
const { camelize } = require('./keys.js');

function computeEtag(payload) {
  return 'W/"' + crypto.createHash('sha1').update(payload).digest('base64').slice(0,27) + '"';
}

// Wrap a serverless handler to post-process JSON responses into camelCase and add ETag caching.
function withTransform(handler, { camel = true, cacheSeconds = 0 } = {}) {
  return async (req, res) => {
    const originalJson = res.json;
    const originalEnd = res.end;
    let bodyBuffer = null;
    // Monkey patch
    res.json = function (obj) {
      let payloadObj = obj;
      if (camel && obj && typeof obj === 'object') {
        if (Array.isArray(obj)) payloadObj = obj.map(o => (o && typeof o === 'object' && !Array.isArray(o)) ? camelize(o, true) : o);
        else payloadObj = camelize(obj, true);
      }
      const jsonStr = JSON.stringify(payloadObj);
      bodyBuffer = Buffer.from(jsonStr);
      const etag = computeEtag(jsonStr);
      res.setHeader('ETag', etag);
      if (cacheSeconds > 0) {
        res.setHeader('Cache-Control', `public, max-age=${cacheSeconds}`);
      } else {
        res.setHeader('Cache-Control', 'no-store');
      }
      // Conditional request support
      if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304;
        return originalEnd.call(res);
      }
      return originalJson.call(res, payloadObj);
    };
    return handler(req, res);
  };
}

module.exports = { withTransform };
