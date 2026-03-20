const jwt = require('jsonwebtoken');

/**
 * Sign a JWT containing the user's MongoDB _id.
 * @param {string} userId - MongoDB ObjectId as string
 * @returns {string} Signed JWT
 */
const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {{ id: string, iat: number, exp: number }}
 */
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { signToken, verifyToken };
