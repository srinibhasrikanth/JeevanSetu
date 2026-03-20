// Mock nodemailer BEFORE requiring mailService
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-123' })
  })
}));

const mailService = require('../services/mailService');

describe('Mail Service Tests', () => {
    const mockTo = 'recipient@example.com';
    const mockVictim = 'Victim Name';
    const mockEmergency = 'Cardiac Arrest';
    const mockLocation = { lat: 12.9, lng: 77.5 };
    const mockLink = 'https://maps.google.com/?test';

    it('should complete mailing without throwing errors', async () => {
        // Must define env vars for skip check
        process.env.SMTP_USER = 'test@example.com';
        process.env.SMTP_PASS = 'pass123';

        await expect(mailService.sendEmergencyEmail(
            mockTo, mockVictim, mockEmergency, mockLocation, mockLink
        )).resolves.not.toThrow();
    });

    it('should skip mailing if SMTP env is missing', async () => {
        delete process.env.SMTP_USER;
        delete process.env.SMTP_PASS;

        const spy = jest.spyOn(console, 'warn');
        await mailService.sendEmergencyEmail(mockTo, mockVictim, mockEmergency, mockLocation, mockLink);
        
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('SMTP credentials not configured'));
        spy.mockRestore();
    });
});
