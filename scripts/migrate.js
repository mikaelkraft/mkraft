#!/usr/bin/env node
/* Simple migration runner for db/wisdomintech_schema.sql */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function main() {
  const sqlPath = path.join(__dirname, '..', 'db', 'wisdomintech_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('Schema file not found at', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('POSTGRES_URL (or DATABASE_URL) env var is required');
    process.exit(1);
  }
  const ssl = process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false;
  const pool = new Pool({ connectionString, ssl });
  const client = await pool.connect();
  try {
    console.log('Applying schema to database...');
    await client.query(sql);
    console.log('Migration completed successfully.');
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
