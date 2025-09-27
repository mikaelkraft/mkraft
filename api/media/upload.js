const { getUser } = require('../_lib/auth');
const { jsonResponse } = require('../_lib/responseWrap');
const { getClient } = require('../_lib/db');
const { randomUUID } = require('crypto');
const formidable = require('formidable');
const sharp = require('sharp');

// Accepted mime types (extend as needed)
const ACCEPTED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { error: 'method_not_allowed' });
  }

  const user = await getUser(req);
  if (!user || !user.is_admin) {
    return jsonResponse(res, 403, { error: 'forbidden' });
  }

  const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 }); // 5MB

  try {
    const { files, fields } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ files, fields });
      });
    });

    const file = files?.file;
    if (!file) {
      return jsonResponse(res, 400, { error: 'no_file' });
    }

    const mime = file.mimetype || file.type;
    if (!ACCEPTED.has(mime)) {
      return jsonResponse(res, 415, { error: 'unsupported_media_type' });
    }

    // Extract dimensions with sharp
    let width = null, height = null;
    try {
      const meta = await sharp(file.filepath).metadata();
      width = meta.width || null;
      height = meta.height || null;
    } catch (e) {
      // Ignore dimension extraction errors
    }

    // TODO: integrate with actual storage (e.g. Supabase storage or S3)
    // For now we simulate a stored path relative to /public/assets/images
    const id = randomUUID();
    const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : mime === 'image/gif' ? 'gif' : 'jpg';
    const filename = `${id}.${ext}`;
    const fs = require('fs');
    const path = require('path');
    const destDir = path.join(process.cwd(), 'public', 'assets', 'images');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, filename);
    await fs.promises.copyFile(file.filepath, destPath);

    const url = `/assets/images/${filename}`;
    const tagsRaw = fields.tags || '';
    const tags = String(tagsRaw)
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const db = await getClient();
    const insert = `
      INSERT INTO wisdomintech.media_assets
        (id, url, mime_type, width, height, tags, alt_text, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, url, mime_type, width, height, tags, alt_text, created_at;`;
    const alt = fields.alt || null;
    const result = await db.query(insert, [id, url, mime, width, height, tags, alt, user.id]);

    return jsonResponse(res, 201, { asset: result.rows[0] });
  } catch (err) {
    return jsonResponse(res, 500, { error: 'upload_failed', detail: err.message });
  }
};
