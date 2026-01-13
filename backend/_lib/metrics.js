// Simple in-memory counters & timers (ephemeral; resets on deploy)
const counters = Object.create(null);
const timers = Object.create(null);

function inc(name, by = 1) {
  counters[name] = (counters[name] || 0) + by;
}

function observe(name, ms) {
  const bucket = timers[name] || { count: 0, total: 0, min: Infinity, max: 0 };
  bucket.count += 1;
  bucket.total += ms;
  bucket.min = Math.min(bucket.min, ms);
  bucket.max = Math.max(bucket.max, ms);
  timers[name] = bucket;
}

function snapshot() {
  const latency = {};
  for (const [k, v] of Object.entries(timers)) {
    latency[k] = {
      count: v.count,
      avg: v.count ? +(v.total / v.count).toFixed(2) : 0,
      min: v.min === Infinity ? 0 : +v.min.toFixed(2),
      max: +v.max.toFixed(2),
    };
  }
  return {
    counters: { ...counters },
    latency,
  };
}

module.exports = { inc, observe, snapshot };
