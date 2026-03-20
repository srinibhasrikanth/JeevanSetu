const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

/**
 * Protect middleware — verifies the Bearer JWT in the Authorization header.
 * On success, attaches the full User document to req.user.
 * On failure, responds with 401 Unauthorized.
 *
 * Usage:
 *   router.get('/protected', protect, myHandler)
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorised — no token provided');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    res.status(401);
    throw new Error(
      err.name === 'TokenExpiredError'
        ? 'Token expired — please sign in again'
        : 'Not authorised — invalid token',
    );
  }

  const user = await User.findById(decoded.id).select('-__v');
  if (!user) {
    res.status(401);
    throw new Error('Not authorised — user no longer exists');
  }

  req.user = user;
  next();
});

module.exports = protect;
