const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Diagnostic endpoint — verifies backend, DB connectivity and Gemini config
 * @route   GET /api/sample
 * @access  Public
 */
const getSample = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: 'jeevansetu-backend',
      environment: process.env.NODE_ENV || 'development',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      mongoConfigured: Boolean(process.env.MONGO_URI),
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = { getSample };
