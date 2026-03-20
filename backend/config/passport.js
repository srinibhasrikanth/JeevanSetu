const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');

/**
 * Configure passport with the Google OAuth 2.0 strategy.
 * Called once at server startup (from server.js).
 */
const configurePassport = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.warn('[Auth] ⚠️  GOOGLE_CLIENT_ID not configured — Google SSO will be unavailable.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:8080'}/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      /**
       * Verify callback — called after Google authenticates the user.
       * Find-or-create the user in our MongoDB collection.
       */
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.[0]?.value?.toLowerCase() || `${profile.id}@google.com`;

          // Try to find by googleId first, then fall back to email
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.findOne({ email });
          }

          if (user) {
            // Update Google ID and avatar if missing
            if (!user.googleId) user.googleId = profile.id;
            if (profile.photos?.[0]?.value) user.avatar = profile.photos[0].value;
            await user.save();
          } else {
            // First sign-in — create minimal user profile
            user = await User.create({
              googleId: profile.id,
              email,
              name: profile.displayName || 'JeevanSetu User',
              avatar: profile.photos?.[0]?.value || '',
              profileComplete: false,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );

  // We use stateless JWT — no need for session serialization
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

module.exports = configurePassport;
