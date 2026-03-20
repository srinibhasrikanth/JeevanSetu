const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const db = require('./db');
const User = require('../models/User');
const userController = require('../controllers/userController');
const protect = require('../middleware/protect');

const app = express();
app.use(express.json());

// Mock protection middleware
const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test Patient',
  email: 'patient@example.com',
  googleId: 'google123',
};

// Test routes setup
app.put('/api/users/me/profile', (req, res, next) => { req.user = mockUser; next(); }, userController.completeProfile);
app.get('/api/users/qr/:qrCodeId', userController.getUserByQR);

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('User Controller Tests', () => {
  beforeEach(async () => {
    await User.create(mockUser);
  });

  describe('PUT /api/users/me/profile', () => {
    it('should complete profile and generate a QR Code ID', async () => {
      const payload = {
        bloodGroup: 'O+',
        allergies: ['Peanuts'],
        medicalConditions: ['Asthma'],
        emergencyContacts: [
          { name: 'Family', phone: '9876543210', email: 'family@example.com', relation: 'Brother' }
        ],
      };

      const res = await request(app)
        .put('/api/users/me/profile')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profileComplete).toBe(true);
      expect(res.body.data.qrCodeId).toBeDefined();
      expect(res.body.data.bloodGroup).toBe('O+');
    });

    it('should fail if blood group is missing', async () => {
      const res = await request(app)
        .put('/api/users/me/profile')
        .send({}); // Missing bloodGroup

      expect(res.status).toBe(400); // asyncHandler will pass err to next, needing Error Middleware but Supertest/Express default handles it
    });
  });

  describe('GET /api/users/qr/:qrCodeId', () => {
    it('should fetch user public data by QR Code', async () => {
      // 1. Manually set a QR Code for the mock user
      const qrId = 'qr-12345';
      await User.findByIdAndUpdate(mockUser._id, { qrCodeId: qrId, profileComplete: true });

      const res = await request(app).get(`/api/users/qr/${qrId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Test Patient');
      expect(res.body.data.qrCodeId).toBeUndefined(); // Should be excluded via select() if coded that way
    });

    it('should return 404 for unknown QR code', async () => {
      const res = await request(app).get('/api/users/qr/fake-qr');
      expect(res.status).toBe(404);
    });
  });
});
