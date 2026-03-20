const express = require('express');
const passport = require('passport');
const { signToken } = require('../utils/jwt');
const protect = require('../middleware/protect');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Google OAuth flow ────────────────────────────────────────────────────────

/**
 * GET /auth/google
 * Redirects the browser to Google's OAuth consent screen.
 */
router.get(
  '/google',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        error: "Google OAuth is not configured. Please add your GOOGLE_CLIENT_ID to the backend/.env file."
      });
    }
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),
);

/**
 * GET /auth/google/callback
 * Google redirects here after the user consents.
 * We generate a JWT and redirect the frontend with it as a query param.
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${FRONTEND_URL}/?error=google_auth_failed`,
  }),
  (req, res) => {
    try {
      const token = signToken(req.user._id.toString());
      const profileComplete = req.user.profileComplete ? 'true' : 'false';

      // Redirect to front-end with token + profileComplete flag
      // Frontend will store the token in localStorage
      res.redirect(
        `${FRONTEND_URL}/auth/callback?token=${token}&profileComplete=${profileComplete}`,
      );
    } catch {
      res.redirect(`${FRONTEND_URL}/?error=token_generation_failed`);
    }
  },
);

// ─── Auth utilities ───────────────────────────────────────────────────────────

/**
 * GET /auth/me
 * Returns the currently authenticated user's profile.
 * Requires: Authorization: Bearer <token>
 */
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        bloodGroup: req.user.bloodGroup,
        allergies: req.user.allergies,
        medicalConditions: req.user.medicalConditions,
        emergencyContacts: req.user.emergencyContacts,
        qrCodeId: req.user.qrCodeId,
        profileComplete: req.user.profileComplete,
        createdAt: req.user.createdAt,
      },
    });
  }),
);

/**
 * POST /auth/logout
 * Client-side logout — just instruct the frontend to clear the token.
 * (JWTs are stateless; true revocation requires a token blocklist.)
 */
router.post('/logout', protect, (_req, res) => {
  res.status(200).json({ success: true, message: 'Logged out — please clear your token.' });
});

module.exports = router;
