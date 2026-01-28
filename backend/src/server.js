const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

const isProd = process.env.NODE_ENV === 'production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (isProd ? null : 'changeme123');
const COOKIE_NAME = 'jobs_auth_token';
const COOKIE_SECRET = process.env.COOKIE_SECRET || (isProd ? null : 'change-this-secret-in-production');

if (isProd && (!ADMIN_PASSWORD || !COOKIE_SECRET)) {
  console.error('Production requires ADMIN_PASSWORD and COOKIE_SECRET. Exiting.');
  process.exit(1);
}

function generateToken() {
  const issuedAt = Date.now().toString();
  const hmac = crypto
    .createHmac('sha256', COOKIE_SECRET)
    .update(issuedAt)
    .digest('hex');
  return `${issuedAt}.${hmac}`;
}

function isValidToken(token) {
  if (!COOKIE_SECRET || !token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [issuedAt, signature] = parts;
  if (!issuedAt || !signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', COOKIE_SECRET)
    .update(issuedAt)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8'),
    );
  } catch {
    // timingSafeEqual throws if buffer lengths differ
    return false;
  }
}

const rateLimitMax = Math.max(1, parseInt(process.env.RATE_LIMIT_MAX || '10', 10));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: rateLimitMax,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

const allowedOrigin = process.env.ALLOWED_ORIGIN || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');
app.use(cors({
  origin: allowedOrigin || undefined,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/login', limiter, express.json(), (req, res) => {
  const { password } = req.body;
  
  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server configuration error: ADMIN_PASSWORD not set' });
  }
  
  if (password === ADMIN_PASSWORD) {
    const token = generateToken();
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ success: true });
});

function authenticate(req, res, next) {
  if (req.path === '/api/login' || req.path === '/api/logout') {
    return next();
  }
  
  const token = req.cookies[COOKIE_NAME];
  if (!isValidToken(token)) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return res.status(401).json({ error: 'Authentication required' });
  }

  next();
}

app.use('/api', limiter);
app.use('/api', authenticate);

app.use('/api/applications', require('./routes/applications'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/analytics', require('./routes/analytics'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
