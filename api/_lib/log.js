// Simple structured logger
// Usage: log.info('message', { contextKey: 'value' })
const levels = ['debug', 'info', 'warn', 'error'];

function base(fields) {
  const ts = new Date().toISOString();
  return { ts, ...fields };
}

function serialize(obj) {
  try { return JSON.stringify(obj); } catch { return '{"error":"log_serialize_failed"}'; }
}

const log = {};
levels.forEach(level => {
  log[level] = (msg, meta = {}) => {
    // Avoid logging undefined / circular
    const line = base({ level, msg, ...meta });
    if (level === 'error') {
      // eslint-disable-next-line no-console
      console.error(serialize(line));
    } else if (level === 'warn') {
      // eslint-disable-next-line no-console
      console.warn(serialize(line));
    } else {
      // eslint-disable-next-line no-console
      console.log(serialize(line));
    }
  };
});

module.exports = { log };
