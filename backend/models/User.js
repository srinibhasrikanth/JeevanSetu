const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    relation: { type: String, trim: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    // ── Google OAuth fields ─────────────────────────────────────────────────
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple docs with null googleId
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: { type: String, default: '' }, // Google profile picture URL

    // ── Medical profile ─────────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    bloodGroup: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
    },
    allergies: [{ type: String, trim: true }],
    medicalConditions: [{ type: String, trim: true }],
    emergencyContacts: [emergencyContactSchema],

    // ── Medical profile completion flag ─────────────────────────────────────
    // True once the user has filled in their blood group after Google sign-in
    profileComplete: { type: Boolean, default: false },

    // ── QR code for first-responder scanning ────────────────────────────────
    qrCodeId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
