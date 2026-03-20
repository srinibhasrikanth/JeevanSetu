const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  allergies: [{ type: String }],
  medicalConditions: [{ type: String }],
  emergencyContacts: [{
    name: String,
    phone: String,
    relation: String
  }],
  qrCodeId: { type: String, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
