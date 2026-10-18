import express from 'express';
import crypto from 'node:crypto';
import db from './db.js';
import { sendOtp, verifyOtp } from './minimoth.js';

if (!process.env.MINIMOTH_API_KEY) {
  console.error('MINIMOTH_API_KEY is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5050;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const PHONE_RE = /^\+[1-9]\d{7,14}$/;
const CODE_RE = /^\d{4,8}$/;

app.use(express.json());

function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const session = token && db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token);
  if (!session) return res.status(401).json({ error: 'Please log in' });
  req.userId = session.user_id;
  next();
}

function isValidUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const shortUrl = (code) => `${BASE_URL}/${code}`;

// 1. Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  const phone = String(req.body?.phone || '').trim();
  if (!PHONE_RE.test(phone)) {
    return res.status(400).json({ error: 'Enter phone in international format, e.g. +919876543210' });
  }
  await sendOtp(phone);
  res.json({ message: 'OTP sent' });
});

// 2. Verify OTP -> creates user if new, returns a session token
app.post('/api/auth/verify-otp', async (req, res) => {
  const phone = String(req.body?.phone || '').trim();
  const code = String(req.body?.code || '').trim();
  if (!PHONE_RE.test(phone) || !CODE_RE.test(code)) {
    return res.status(400).json({ error: 'Invalid phone or code' });
  }
  await verifyOtp(phone, code);

  db.prepare('INSERT OR IGNORE INTO users (phone) VALUES (?)').run(phone);
  const user = db.prepare('SELECT id, phone FROM users WHERE phone = ?').get(phone);
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, user.id);

  res.json({ token, user });
});

// 3. Create a short link
app.post('/api/links', requireAuth, (req, res) => {
  const url = String(req.body?.url || '').trim();
  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Enter a valid http(s) URL' });
  }
  const code = crypto.randomBytes(4).toString('base64url').slice(0, 6);
  const link = db
    .prepare('INSERT INTO links (code, url, user_id) VALUES (?, ?, ?) RETURNING *')
    .get(code, url, req.userId);
  res.status(201).json({ ...link, short_url: shortUrl(code) });
});

// 4. List my links
app.get('/api/links', requireAuth, (req, res) => {
  const links = db
    .prepare('SELECT * FROM links WHERE user_id = ? ORDER BY id DESC')
    .all(req.userId);
  res.json(links.map((l) => ({ ...l, short_url: shortUrl(l.code) })));
});

// 5. Redirect short code -> original URL
app.get('/:code', (req, res) => {
  const link = db.prepare('SELECT * FROM links WHERE code = ?').get(req.params.code);
  if (!link) return res.status(404).send('Short link not found');
  db.prepare('UPDATE links SET clicks = clicks + 1 WHERE id = ?').run(link.id);
  res.redirect(302, link.url);
});

// Error handler (Express 5 forwards async errors here)
app.use((err, req, res, next) => {
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong' });
});

app.listen(PORT, () => console.log(`API running on ${BASE_URL}`));
