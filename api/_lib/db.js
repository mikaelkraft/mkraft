import pg from 'pg';

const { Pool } = pg;

// Single shared pool across all serverless invocations in this runtime
let pool;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('POSTGRES_URL is not set');
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: Number(process.env.PG_POOL_MAX || 5),
      idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT || 30000)
    });
  }
  return pool;
}

export async function query(text, params) {
  const client = await getPool().connect();
  try {
    const start = Date.now();
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    if (process.env.LOG_SQL === 'true') {
      console.log('executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } finally {
    client.release();
  }
}
