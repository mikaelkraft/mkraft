const { query } = require('./db.js');

async function ensureUserProfile(user) {
  if (!user?.id) return;
  const upsertSql = `
    INSERT INTO wisdomintech.user_profiles (id, email, full_name)
    VALUES ($1, $2, $3)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name)
  `;
  const fullName = user.user_metadata?.full_name || user.full_name || null;
  await query(upsertSql, [user.id, user.email || null, fullName]);
}

module.exports = { ensureUserProfile };
