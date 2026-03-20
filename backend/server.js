const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');

// Load env vars before any other module reads process.env
dotenv.config();

const connectDB = require('./config/db');
const configurePassport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB Atlas
connectDB();

// Configure Google OAuth strategy
configurePassport();

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passport (required for Google OAuth redirect flow; no persistent sessions)
app.use(passport.initialize());

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check — Cloud Run liveness probe
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'jeevansetu-backend',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Auth (Google SSO + JWT utilities) — PUBLIC
app.use('/auth', authRoutes);

// Protected API routes
app.use('/api/emergency', emergencyRoutes);
app.use('/api/users', userRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Global error handler ────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT, 10) || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[Server] JeevanSetu running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`,
  );
});
