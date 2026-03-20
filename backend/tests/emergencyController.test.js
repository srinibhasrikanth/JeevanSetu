const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const db = require('./db');
const User = require('../models/User');
const EmergencyEvent = require('../models/EmergencyEvent');

// Setup Mocks before anything else
const mockAnalyzeEmergency = jest.fn();
const mockMapsContext = jest.fn();
const mockSendEmail = jest.fn();

jest.mock('../services/geminiService', () => ({
  analyzeEmergency: (...args) => mockAnalyzeEmergency(...args)
}));
jest.mock('../services/mapsService', () => ({
  getRealEmergencyContext: (...args) => mockMapsContext(...args)
}));
jest.mock('../services/mailService', () => ({
  sendEmergencyEmail: (...args) => mockSendEmail(...args)
}));

const emergencyController = require('../controllers/emergencyController');

const mockUserId = new mongoose.Types.ObjectId();
const mockUser = {
  _id: mockUserId,
  name: 'Victim User',
  email: 'victim@example.com',
  emergencyContacts: [
    { name: 'Family member', phone: '1234567890', email: 'family@example.com', relation: 'Father' }
  ],
};

const app = express();
app.use(express.json());

// Routes
app.post('/api/emergency/trigger', (req, res, next) => { req.user = mockUser; next(); }, emergencyController.triggerEmergency);
app.post('/api/emergency/qr-trigger', emergencyController.triggerEmergencyByQR);

// Error middleware for testing
app.use((err, req, res, next) => {
    const status = res.statusCode === 200 ? 500 : res.statusCode; 
    res.status(status).json({ success: false, error: err.message });
});

beforeAll(async () => await db.connect());
afterEach(async () => {
    await db.clear();
    jest.clearAllMocks();
});
afterAll(async () => await db.close());

describe('Emergency Controller Tests', () => {
    beforeEach(async () => {
        await User.create(mockUser);
        mockAnalyzeEmergency.mockResolvedValue({
            emergency_type: 'CARDIAC',
            severity: 'CRITICAL',
            alerts: { notify_contacts: true, send_ambulance: true }
        });
        mockMapsContext.mockResolvedValue({
            hospitals: [{ name: 'Test Hospital', distance: '1km' }],
            traffic: {}
        });
    });

    describe('POST /api/emergency/trigger (In-App SOS)', () => {
        it('should successfully trigger emergency and create event record', async () => {
            const res = await request(app)
                .post('/api/emergency/trigger')
                .send({
                    triggerMethod: 'CHATBOT',
                    messyData: { userInput: 'Chest pain', gpsLocation: { lat: 10, lng: 20 } }
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.analysis.emergency_type).toBe('CARDIAC');

            const event = await EmergencyEvent.findOne({ userId: mockUserId });
            expect(event).toBeDefined();
        });
    });

    describe('POST /api/emergency/qr-trigger (Public Scan)', () => {
        it('should trigger emergency for a user by their qrCodeId', async () => {
            const qrId = 'QR-123';
            await User.findByIdAndUpdate(mockUserId, { qrCodeId: qrId });

            const res = await request(app)
                .post('/api/emergency/qr-trigger')
                .send({
                    qrCodeId: qrId,
                    messyData: { userInput: 'Help!', gpsLocation: { lat: 10, lng: 20 } }
                });

            expect(res.status).toBe(201);
            expect(mockAnalyzeEmergency).toHaveBeenCalled();
            expect(res.body.data.analysis.severity).toBe('CRITICAL');
        });

        it('should return 404 for invalid qrCodeId', async () => {
            const res = await request(app)
                .post('/api/emergency/qr-trigger')
                .send({ qrCodeId: 'not-real' });

            expect(res.status).toBe(404);
            expect(res.body.error).toContain('User not found');
        });
    });
});
