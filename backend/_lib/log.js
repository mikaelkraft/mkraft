// Simple structured logger
// Usage: log.info('message', { contextKey: 'value' })
const levels = ["debug", "info", "warn", "error"];

function base(fields) {
  const ts = new Date().toISOString();
  return { ts, ...fields };
}

function serialize(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{"error":"log_serialize_failed"}';
  }
}

const log = {};
levels.forEach((level) => {
  log[level] = (msg, meta = {}) => {
    // Avoid logging undefined / circular
    const line = base({ level, msg, ...meta });
    if (level === "error") {
      console.error(serialize(line));
    } else {
      // Collapse debug/info/warn into warn channel to satisfy console policy (warn + error only)
      console.warn(serialize(line));
    }
  };
});

module.exports = { log };
