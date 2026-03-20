const nodemailer = require('nodemailer');

/**
 * Service to handle sending emails via SMTP (Nodemailer)
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an emergency alert email to a contact
 * @param {string} to - Recipient email
 * @param {string} patientName - Name of the victim
 * @param {string} emergencyType - Type of emergency identified by AI
 * @param {Object} location - GPS coordinates {lat, lng}
 * @param {string} mapLink - Google Maps link to the location
 */
const sendEmergencyEmail = async (to, patientName, emergencyType, location, mapLink) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mail] ⚠️ SMTP credentials not configured. Skipping email.');
    return;
  }

  const mailOptions = {
    from: `"JeevanSetu Alerts" <${process.env.SMTP_USER}>`,
    to,
    subject: `🚨 EMERGENCY ALERT: ${patientName} needs help!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #ef4444; border-radius: 12px;">
        <h1 style="color: #ef4444; margin-top: 0;">JeevanSetu Emergency Alert</h1>
        <p style="font-size: 16px; color: #374151;">
          This is an automated emergency alert for <strong>${patientName}</strong>.
        </p>
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b; font-weight: bold;">
            Situation: ${emergencyType || 'Medical Emergency Triggered'}
          </p>
          <p style="margin: 10px 0 0 0; color: #7f1d1d;">
            Location: Lat ${location?.lat}, Lng ${location?.lng}
          </p>
        </div>
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 25px;">
          An emergency response was triggered. AI assessment and local authorities have been notified.
        </p>
        <a href="${mapLink}" style="display: block; width: 100%; text-align: center; background-color: #2563eb; color: white; padding: 14px 0; text-decoration: none; border-radius: 8px; font-weight: bold;">
          VIEW LIVE LOCATION ON MAPS
        </a>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center;">
          This email was sent via JeevanSetu Advanced Emergency Response System.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail] ✅ Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error(`[Mail] ❌ Failed to send email to ${to}:`, error.message);
  }
};

module.exports = {
  sendEmergencyEmail,
};
