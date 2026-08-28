import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import healthRoutes from './routes/health.js';
import authRoutes from './routes/authRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import cooperativeRoutes from './routes/cooperativeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_PROD = process.env.NODE_ENV === 'production';

// --- Security headers (dependency-free helmet equivalent) ---
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()');
  if (IS_PROD) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// --- CORS: supports comma-separated origins in CLIENT_URL ---
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin/no-origin (curl, mobile apps) and any configured origin
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false); // don't error, just omit CORS headers
  },
  credentials: true
}));

// --- Simple in-memory rate limiting (sliding window) ---
const rateLimitBuckets = new Map();
const makeRateLimit = ({ windowMs, max, name }) => (req, res, next) => {
  const key = `${name}:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
  const now = Date.now();
  let bucket = rateLimitBuckets.get(key);
  if (!bucket || now - bucket.start > windowMs) {
    bucket = { start: now, count: 0 };
    rateLimitBuckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > max) {
    return res.status(429).json({ error: 'Too many requests. Please slow down and try again shortly.' });
  }
  next();
};
// Periodic cleanup to avoid unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (now - bucket.start > 15 * 60 * 1000) rateLimitBuckets.delete(key);
  }
}, 5 * 60 * 1000).unref();

// Stricter limits for expensive/sensitive endpoints
const authLimiter = makeRateLimit({ windowMs: 15 * 60 * 1000, max: 50, name: 'auth' });
const aiLimiter = makeRateLimit({ windowMs: 60 * 1000, max: 20, name: 'ai' });
const globalLimiter = makeRateLimit({ windowMs: 60 * 1000, max: 300, name: 'global' });
app.use('/api', globalLimiter);

app.use(morgan(IS_PROD ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Mount API routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/cooperatives', cooperativeRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

// --- Serve the built web app in production (single-origin deployment) ---
const webDist = path.resolve(__dirname, '../../../apps/web/dist');
if (IS_PROD && fs.existsSync(webDist)) {
  app.use(express.static(webDist, { maxAge: '1d', index: false }));
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(webDist, 'index.html'));
  });
}

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Co-opSeva SIH API Server Running',
    documentation: '/api/health'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error Handler]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
