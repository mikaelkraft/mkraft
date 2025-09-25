const { json, error, getUrl } = require('../_lib/respond.js');
const { query } = require('../_lib/db.js');
const { getJsonBody } = require('../_lib/body.js');
const { rateLimit } = require('../_lib/rateLimit.js');

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate email parameter from query string
function validateEmailParam(email, res) {
  if (!email) {
    error(res, 'Email parameter is required', 400);
    return null;
  }
  
  const emailTrimmed = email.toLowerCase().trim();
  
  if (!isValidEmail(emailTrimmed)) {
    error(res, 'Invalid email format', 400);
    return null;
  }
  
  return emailTrimmed;
}

// Apply rate limiting per IP (subscribe/unsubscribe heavy operations)
const limiter = rateLimit({ windowMs: 60_000, max: 10 });

module.exports = async function handler(req, res) {
  let proceed = false;
  await new Promise((resolve) => limiter(req, res, () => { proceed = true; resolve(); }));
  if (!proceed) return; // rate limited
  try {
    const url = getUrl(req);
    
    if (req.method === 'POST') {
      return await handleSubscribe(req, res);
    }
    
    if (req.method === 'DELETE') {
      return await handleUnsubscribe(req, res, url);
    }
    
    if (req.method === 'GET') {
      return await handleCheckSubscription(req, res, url);
    }
    
    return error(res, 'Method not allowed', 405);
  } catch (err) {
    console.error('Newsletter API error:', err);
    return error(res, 'Internal server error', 500);
  }
};

async function handleSubscribe(req, res) {
  const body = await getJsonBody(req);
  
  if (!body.email) {
    return error(res, 'Email is required', 400);
  }
  
  const email = body.email.toLowerCase().trim();
  const name = (body.name || '').trim();
  
  if (!isValidEmail(email)) {
    return error(res, 'Invalid email format', 400);
  }
  
  try {
    // Check if already subscribed
    const existingQuery = `SELECT email, is_active FROM wisdomintech.newsletter_subscribers WHERE email = $1`;
    const { rows: existing } = await query(existingQuery, [email]);
    
    if (existing.length > 0) {
      if (existing[0].is_active) {
        return error(res, 'Email is already subscribed', 409);
      } else {
        // Reactivate subscription
        const reactivateQuery = `
          UPDATE wisdomintech.newsletter_subscribers 
          SET is_active = true, name = COALESCE($2, name), reactivated_at = now(), updated_at = now() 
          WHERE email = $1 
          RETURNING *
        `;
        const { rows } = await query(reactivateQuery, [email, name || null]);
        return json(res, { message: 'Newsletter subscription reactivated', data: rows[0] }, 200);
      }
    }
    
    // Create new subscription
    const insertQuery = `
      INSERT INTO wisdomintech.newsletter_subscribers (email, name, is_active, subscribed_at, created_at, updated_at)
      VALUES ($1, $2, true, now(), now(), now())
      RETURNING *
    `;
    const { rows } = await query(insertQuery, [email, name || null]);
    
    return json(res, { message: 'Successfully subscribed to newsletter', data: rows[0] }, 201);
  } catch (err) {
    console.error('Subscribe error:', err);
    if (err.code === '23505') { // Unique constraint violation
      return error(res, 'Email is already subscribed', 409);
    }
    return error(res, 'Failed to subscribe', 500);
  }
}

async function handleUnsubscribe(req, res, url) {
  const email = url.searchParams.get('email');
  const emailTrimmed = validateEmailParam(email, res);
  if (!emailTrimmed) return; // Error already sent
  
  try {
    const updateQuery = `
      UPDATE wisdomintech.newsletter_subscribers 
      SET is_active = false, unsubscribed_at = now(), updated_at = now() 
      WHERE email = $1 AND is_active = true
      RETURNING *
    `;
    const { rows } = await query(updateQuery, [emailTrimmed]);
    
    if (rows.length === 0) {
      return error(res, 'Email not found or already unsubscribed', 404);
    }
    
    return json(res, { message: 'Successfully unsubscribed from newsletter', data: rows[0] });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return error(res, 'Failed to unsubscribe', 500);
  }
}

async function handleCheckSubscription(req, res, url) {
  const email = url.searchParams.get('email');
  const emailTrimmed = validateEmailParam(email, res);
  if (!emailTrimmed) return; // Error already sent
  
  try {
    const checkQuery = `SELECT email, is_active FROM wisdomintech.newsletter_subscribers WHERE email = $1`;
    const { rows } = await query(checkQuery, [emailTrimmed]);
    
    if (rows.length === 0 || !rows[0].is_active) {
      return json(res, { subscribed: false });
    }
    
    return json(res, { subscribed: true, email: rows[0].email });
  } catch (err) {
    console.error('Check subscription error:', err);
    return error(res, 'Failed to check subscription', 500);
  }
}