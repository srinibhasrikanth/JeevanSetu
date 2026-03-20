const mongoose = require('mongoose');

const emergencyEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  triggerMethod: { type: String, enum: ['SOS_BUTTON', 'QR_SCAN', 'VOICE', 'IMAGE'] },
  messyData: {
    voiceTranscript: String,
    imageUrl: String,
    gpsLocation: { lat: Number, lng: Number },
    timeContext: Date
  },
  aiAnalysis: {
    emergencyType: String,
    severityLevel: { type: String, enum: ['Low', 'Medium', 'Critical'] },
    explanation: String,
    immediateActions: [String]
  },
  status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyEvent', emergencyEventSchema);
