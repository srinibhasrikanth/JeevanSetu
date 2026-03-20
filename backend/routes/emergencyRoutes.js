const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const {
  triggerEmergency,
  getEmergency,
  getUserEmergencies,
  resolveEmergency,
  triggerEmergencyByQR,
} = require('../controllers/emergencyController');

// POST /api/emergency/qr-trigger — triggered by bystander scanning QR Code
router.post('/qr-trigger', triggerEmergencyByQR);

// All emergency routes below require authentication
router.use(protect);

// POST /api/emergency/trigger
router.post('/trigger', triggerEmergency);

// GET  /api/emergency/mine — get all emergencies for the authenticated user
router.get('/mine', getUserEmergencies);

// GET  /api/emergency/:id
router.get('/:id', getEmergency);

// PATCH /api/emergency/:id/resolve
router.patch('/:id/resolve', resolveEmergency);

module.exports = router;
