const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI from MONGO_URI env var.
 *
 * Common errors:
 *   ECONNREFUSED 127.0.0.1:27017  — local MongoDB not running.
 *     Fix: Use MongoDB Atlas (see .env comments) or start mongod locally.
 *
 *   Authentication failed            — wrong Atlas user/password in URI.
 *   ENOTFOUND cluster.mongodb.net   — wrong cluster hostname.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[DB] ❌  MONGO_URI is not configured.');
    process.exit(1);
  }

  // Suppress the Node.js deprecation warning for deprecated options
  mongoose.set('strictQuery', false);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000, // fail fast instead of hanging 30 s
      socketTimeoutMS: 45000,
    });
    console.log(`[DB] ✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('[DB] ❌  MongoDB connection failed:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error(
        '[DB]     Hint: Local MongoDB is not running.\n' +
        '         Use MongoDB Atlas — see MONGO_URI in backend/.env for setup steps.',
      );
    }
    process.exit(1);
  }
};

module.exports = connectDB;
