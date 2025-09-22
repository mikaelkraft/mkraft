#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');
const crypto = require('crypto');

(async () => {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('POSTGRES_URL (or DATABASE_URL) env var is required');
    process.exit(1);
  }
  const ssl = process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false;
  const pool = new Pool({ connectionString, ssl });
  const client = await pool.connect();
  try {
    const email = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || 'admin@example.com';
    const userId = crypto.randomUUID();

    // Ensure schema exists
    await client.query('CREATE SCHEMA IF NOT EXISTS wisdomintech');

    // Upsert user profile (id must be provided per schema)
    await client.query(
      `INSERT INTO wisdomintech.user_profiles (id, email, full_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email`,
      [userId, email, 'Admin User']
    );

    // Insert a sample published blog post if none exists
    const { rows: existing } = await client.query('SELECT id FROM wisdomintech.blog_posts LIMIT 1');
    if (existing.length === 0) {
      const now = new Date();
      const { rows } = await client.query(
        `INSERT INTO wisdomintech.blog_posts
          (slug, title, excerpt, content, featured_image, tags, category, status, read_time, featured, author_id, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING id, slug, title`,
        [
          'hello-world',
          'Hello World',
          'First post seeded for smoke test',
          'This is a seeded blog post used for API smoke testing.',
          null,
          ['intro','welcome'],
          'general',
          'published',
          2,
          false,
          userId,
          now.toISOString()
        ]
      );
      console.log('Seeded blog post:', rows[0]);
    } else {
      console.log('Blog posts already present; skipping post seed.');
    }

    // Ensure at least one site settings row exists
    const settings = await client.query('SELECT id FROM wisdomintech.site_settings LIMIT 1');
    if (settings.rows.length === 0) {
      const { rows } = await client.query(
        `INSERT INTO wisdomintech.site_settings
          (site_title, site_tagline, site_description, admin_email, enable_video, default_theme)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id`,
        ['My Site', 'Just seeded', 'A seeded settings row', email, true, 'light']
      );
      console.log('Seeded site settings:', rows[0]);
    } else {
      console.log('Site settings already present; skipping settings seed.');
    }

    console.log('Seeding complete.');
  } catch (e) {
    console.error('Seed failed:', e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
