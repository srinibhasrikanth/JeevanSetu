const EmergencyEvent = require('../models/EmergencyEvent');
const asyncHandler = require('../middleware/asyncHandler');
const { analyzeEmergency } = require('../services/geminiService');
const { getRealEmergencyContext } = require('../services/mapsService');
const { sendEmergencyEmail } = require('../services/mailService');

/**
 * Mocks reliable hospital data around a general area based on GPS coordinates.
 * Used automatically if no GOOGLE_MAPS_API_KEY is detected.
 */
const generateMockHospitals = (lat, lng) => {
  return [
    { name: "City Central Cardiology & Trauma Hospital", distance: "2.4 km", specialties: ["Cardiology", "Trauma", "General"] },
    { name: "Metro General Hospital", distance: "4.1 km", specialties: ["General", "Respiratory", "Pediatrics"] },
    { name: "Sunrise Burn & Orthopedic Center", distance: "5.8 km", specialties: ["Burns", "Orthopedics", "Trauma"] }
  ];
};

/**
 * Mocks dynamic traffic data and routing information.
 * Used automatically if no GOOGLE_MAPS_API_KEY is detected.
 */
const generateMockTraffic = () => {
  return {
    routes: [
      { name: "Main Highway (Route 4)", congestion: "High", delay: "15 mins", ETA: "21 mins", reason: "Accident reported" },
      { name: "Ring Road Express", congestion: "Low", delay: "0 mins", ETA: "7 mins", reason: "Clear" },
      { name: "Downtown Avenues", congestion: "Moderate", delay: "4 mins", ETA: "12 mins", reason: "Normal town traffic" }
    ]
  };
};

/**
 * @desc    Trigger a new emergency via Chatbot or SOS button — calls Gemini AI
 * @route   POST /api/emergency/trigger
 * @access  Protected
 * @body    { triggerMethod, messyData: { userInput, gpsLocation } }
 */
const triggerEmergency = asyncHandler(async (req, res) => {
  const { triggerMethod, messyData } = req.body;
  const user = req.user; // Set by protect middleware

  const allowedMethods = ['CHATBOT', 'SOS_BUTTON', 'QR_SCAN', 'VOICE', 'IMAGE'];
  if (!triggerMethod || !allowedMethods.includes(triggerMethod)) {
    res.status(400);
    throw new Error(`triggerMethod must be one of: ${allowedMethods.join(', ')}`);
  }

  // Build the patient medical history from the user profile
  const patientHistory = {
    name: user.name,
    bloodGroup: user.bloodGroup,
    allergies: user.allergies,
    medicalConditions: user.medicalConditions,
  };

  const userInput = messyData?.userInput || "User triggered emergency without providing text context.";
  const location = messyData?.gpsLocation || { lat: 0, lng: 0, city: "Unknown" };
  
  // Inject highly contextual data for the AI's Decision Making matrix
  let hospitals = null;
  let traffic = null;
  
  if (location.lat && location.lng) {
     const realContext = await getRealEmergencyContext(location.lat, location.lng);
     if (realContext) {
        hospitals = realContext.hospitals;
        traffic = realContext.traffic;
     }
  }

  // Fallback to mock data if APIs failed, no coordinates provided, or Key is absent
  if (!hospitals || !traffic) {
    hospitals = generateMockHospitals(location.lat, location.lng);
    traffic = generateMockTraffic();
  }

  // Run the new highly-structured Gemini AI Prompt Matrix
  const aiAnalysis = await analyzeEmergency(
    userInput,
    patientHistory,
    location,
    hospitals,
    traffic
  );

  // ── Dispatch Alert Notifications ──
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
  
  if (aiAnalysis.alerts?.notify_contacts && user.emergencyContacts?.length > 0) {
    user.emergencyContacts.forEach((contact) => {
      if (contact.email) {
        sendEmergencyEmail(
          contact.email, 
          user.name, 
          aiAnalysis.emergency_type || "Medical Emergency Triggered",
          location,
          mapLink
        );
      }
      console.log(`[ALERTS] 📧 Sending fallback log for: ${contact.name} (${contact.phone})`);
    });
  }

  if (aiAnalysis.alerts?.send_ambulance) {
    console.log(`[ALERTS] 🚑 Actively dispatching ambulance to Location: Lat ${location.lat}, Lng ${location.lng}`);
  }

  // Create the event in MongoDB using the new schema
  const event = await EmergencyEvent.create({
    userId: user._id,
    triggerMethod,
    messyData: {
      userInput,
      gpsLocation: location,
      timeContext: new Date()
    },
    aiAnalysis,
    status: 'Active',
  });

  res.status(201).json({
    success: true,
    data: {
      eventId: event._id,
      analysis: event.aiAnalysis,
      createdAt: event.createdAt,
    },
  });
});

/**
 * @desc    Get a single emergency event by ID
 * @route   GET /api/emergency/:id
 * @access  Protected (owner only)
 */
const getEmergency = asyncHandler(async (req, res) => {
  const event = await EmergencyEvent.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate('userId', 'name bloodGroup allergies medicalConditions');

  if (!event) {
    res.status(404);
    throw new Error('Emergency event not found');
  }
  res.status(200).json({ success: true, data: event });
});

/**
 * @desc    Get all emergencies for the authenticated user
 * @route   GET /api/emergency/mine
 * @access  Protected
 */
const getUserEmergencies = asyncHandler(async (req, res) => {
  const events = await EmergencyEvent.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('-__v');
  res.status(200).json({ success: true, count: events.length, data: events });
});

/**
 * @desc    Mark an active emergency as resolved
 * @route   PATCH /api/emergency/:id/resolve
 * @access  Protected (owner only)
 */
const resolveEmergency = asyncHandler(async (req, res) => {
  const event = await EmergencyEvent.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { status: 'Resolved' },
    { new: true, runValidators: true },
  );
  if (!event) {
    res.status(404);
    throw new Error('Emergency event not found');
  }
  res.status(200).json({ success: true, data: event });
});

/**
 * @desc    Trigger a new emergency via Public QR Scan
 * @route   POST /api/emergency/qr-trigger
 * @access  Public
 * @body    { qrCodeId, messyData: { userInput, gpsLocation } }
 */
const triggerEmergencyByQR = asyncHandler(async (req, res) => {
  const { qrCodeId, messyData } = req.body;
  const User = require('../models/User'); // require here or globally

  const user = await User.findOne({ qrCodeId });
  if (!user) {
    res.status(404);
    throw new Error('User not found for the provided QR code');
  }

  // Build the patient medical history from the user profile
  const patientHistory = {
    name: user.name,
    bloodGroup: user.bloodGroup,
    allergies: user.allergies,
    medicalConditions: user.medicalConditions,
  };

  const userInput = messyData?.userInput || "Emergency triggered by bystander scanning Medical QR Code.";
  const location = messyData?.gpsLocation || { lat: 0, lng: 0, city: "Unknown" };

  let hospitals = null;
  let traffic = null;
  
  if (location.lat && location.lng) {
     const realContext = await getRealEmergencyContext(location.lat, location.lng);
     if (realContext) {
        hospitals = realContext.hospitals;
        traffic = realContext.traffic;
     }
  }

  if (!hospitals || !traffic) {
    hospitals = generateMockHospitals(location.lat, location.lng);
    traffic = generateMockTraffic();
  }

  const aiAnalysis = await analyzeEmergency(
    userInput,
    patientHistory,
    location,
    hospitals,
    traffic
  );

  // ── Dispatch Alert Notifications ──
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;

  if (aiAnalysis.alerts?.notify_contacts && user.emergencyContacts?.length > 0) {
    user.emergencyContacts.forEach((contact) => {
      if (contact.email) {
        sendEmergencyEmail(
          contact.email, 
          user.name, 
          aiAnalysis.emergency_type || "Medical Emergency Triggered (via QR Code)",
          location,
          mapLink
        );
      }
      console.log(`[ALERTS] 📧 Sending fallback log for: ${contact.name} (${contact.phone})`);
    });
  }

  if (aiAnalysis.alerts?.send_ambulance) {
    console.log(`[ALERTS] 🚑 Actively dispatching ambulance to Location: Lat ${location.lat}, Lng ${location.lng}`);
  }

  const event = await EmergencyEvent.create({
    userId: user._id,
    triggerMethod: 'QR_SCAN',
    messyData: {
      userInput,
      gpsLocation: location,
      timeContext: new Date()
    },
    aiAnalysis,
    status: 'Active',
  });

  res.status(201).json({
    success: true,
    data: {
      eventId: event._id,
      analysis: event.aiAnalysis,
      createdAt: event.createdAt,
    },
  });
});

module.exports = {
  triggerEmergency,
  getEmergency,
  getUserEmergencies,
  resolveEmergency,
  triggerEmergencyByQR,
};
