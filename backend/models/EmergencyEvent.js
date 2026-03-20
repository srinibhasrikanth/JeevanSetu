const mongoose = require('mongoose');

const emergencyEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  triggerMethod: { type: String, enum: ['CHATBOT', 'SOS_BUTTON', 'QR_SCAN', 'VOICE', 'IMAGE'] },
  messyData: {
    userInput: String,
    gpsLocation: { lat: Number, lng: Number },
    timeContext: Date
  },
  aiAnalysis: {
    emergency_type: String,
    severity: String,
    confidence: String,
    reasoning: String,
    recommended_hospital: {
      name: String,
      reason: String,
      distance: String,
      specialty_match: String
    },
    route: {
      best_route: String,
      eta: String,
      avoid_routes: String,
      traffic_reason: String
    },
    actions: [String],
    alerts: {
      send_ambulance: Boolean,
      notify_contacts: Boolean,
      sos_trigger: Boolean
    }
  },
  status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyEvent', emergencyEventSchema);
