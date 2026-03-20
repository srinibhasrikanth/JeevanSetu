const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const {
  completeProfile,
  getMe,
  updateMe,
  getUserByQR,
  getMyHealthTip,
} = require('../controllers/userController');

// ── Public routes ────────────────────────────────────────────────────────────

// GET /api/users/qr/:qrCodeId — first-responder QR scan (no auth needed)
router.get('/qr/:qrCodeId', getUserByQR);

// ── Protected routes (JWT required) ─────────────────────────────────────────

router.use(protect); // All routes below this line require a valid token

// GET  /api/users/me            — get the current user's profile
router.get('/me', getMe);

// PUT  /api/users/me            — update current user's profile
router.put('/me', updateMe);

// PUT  /api/users/me/profile    — complete medical profile after first sign-in
router.put('/me/profile', completeProfile);

// GET  /api/users/me/health-tip — Gemini AI personalised health tip
router.get('/me/health-tip', getMyHealthTip);

module.exports = router;
