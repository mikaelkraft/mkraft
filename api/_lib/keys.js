// Utility helpers for converting object keys between snake_case and camelCase
// (Non-recursive by default; recursive option available.)

const toCamel = (s) => s.replace(/[_-](\w)/g, (_, c) => c ? c.toUpperCase() : '').replace(/^(.)/, m => m.toLowerCase());
const toSnake = (s) => s.replace(/([A-Z])/g, '_$1').toLowerCase();

function camelize(obj, deep = false) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const out = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    out[toCamel(k)] = deep && v && typeof v === 'object' && !Array.isArray(v) ? camelize(v, true) : v;
  }
  return out;
}

function snakify(obj, deep = false) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const out = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    out[toSnake(k)] = deep && v && typeof v === 'object' && !Array.isArray(v) ? snakify(v, true) : v;
  }
  return out;
}

module.exports = { camelize, snakify };
