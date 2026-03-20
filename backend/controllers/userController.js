const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { v4: uuidv4 } = require('uuid');
const { getPersonalisedHealthTip } = require('../services/geminiService');

/**
 * @desc    Complete the medical profile after Google sign-in
 * @route   PUT /api/users/me/profile
 * @access  Protected (JWT required)
 * @body    { bloodGroup, allergies?, medicalConditions?, emergencyContacts? }
 */
const completeProfile = asyncHandler(async (req, res) => {
  const { bloodGroup, allergies, medicalConditions, emergencyContacts } = req.body;

  if (!bloodGroup || typeof bloodGroup !== 'string') {
    res.status(400);
    throw new Error('bloodGroup is required to complete your profile');
  }

  const allowedBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const normalised = bloodGroup.trim().toUpperCase();
  if (!allowedBloodGroups.includes(normalised)) {
    res.status(400);
    throw new Error(`bloodGroup must be one of: ${allowedBloodGroups.join(', ')}`);
  }

  // Generate QR Code ID only if it doesn't exist (one-time activity)
  let qrCodeId = req.user.qrCodeId;
  if (!qrCodeId) {
    qrCodeId = uuidv4();
  }

  const update = {
    bloodGroup: normalised,
    allergies: Array.isArray(allergies) ? allergies.map((a) => a.trim()) : [],
    medicalConditions: Array.isArray(medicalConditions)
      ? medicalConditions.map((c) => c.trim())
      : [],
    emergencyContacts: Array.isArray(emergencyContacts) ? emergencyContacts : [],
    profileComplete: true,
    qrCodeId,
  };

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  }).select('-__v');

  res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Get the authenticated user's own profile
 * @route   GET /api/users/me
 * @access  Protected
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-__v');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Update the authenticated user's profile
 * @route   PUT /api/users/me
 * @access  Protected
 */
const updateMe = asyncHandler(async (req, res) => {
  // Prevent tampering with immutable / auth fields
  const forbidden = ['_id', 'googleId', 'email', 'qrCodeId'];
  forbidden.forEach((f) => delete req.body[f]);

  if (req.body.bloodGroup) {
    req.body.bloodGroup = req.body.bloodGroup.trim().toUpperCase();
  }

  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  }).select('-__v');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Get a user profile by QR Code ID (for first-responder scanning — public)
 * @route   GET /api/users/qr/:qrCodeId
 * @access  Public
 */
const getUserByQR = asyncHandler(async (req, res) => {
  const user = await User.findOne({ qrCodeId: req.params.qrCodeId }).select(
    'name bloodGroup allergies medicalConditions emergencyContacts',
  );
  if (!user) {
    res.status(404);
    throw new Error('No user found for this QR code');
  }
  res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Get Gemini AI personalised health tip for the authenticated user
 * @route   GET /api/users/me/health-tip
 * @access  Protected
 */
const getMyHealthTip = asyncHandler(async (req, res) => {
  const tip = await getPersonalisedHealthTip({
    name: req.user.name,
    bloodGroup: req.user.bloodGroup,
    allergies: req.user.allergies,
    medicalConditions: req.user.medicalConditions,
  });
  res.status(200).json({ success: true, data: { tip } });
});

module.exports = {
  completeProfile,
  getMe,
  updateMe,
  getUserByQR,
  getMyHealthTip,
};
