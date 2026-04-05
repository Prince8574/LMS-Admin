const express  = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt   = require('jsonwebtoken');
const { findByEmail } = require('../models/Admin');

const router = express.Router();

passport.use('admin-google', new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
}, async (_accessToken, _refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value;
  const name  = profile.displayName || 'Unknown';
  const ts    = new Date().toISOString();

  console.log(`\n[${ts}] [AUTH] [GOOGLE] ──────────────────────────────`);
  console.log(`[${ts}] [AUTH] [GOOGLE] Provider  : Google OAuth 2.0`);
  console.log(`[${ts}] [AUTH] [GOOGLE] Profile   : ${name}`);
  console.log(`[${ts}] [AUTH] [GOOGLE] Email     : ${email || 'NOT PROVIDED'}`);

  try {
    if (!email) {
      console.warn(`[${ts}] [AUTH] [GOOGLE] ⚠  No email returned from Google profile`);
      return done(new Error('No email from Google'), null);
    }

    const admin = await findByEmail(email);

    if (!admin) {
      console.warn(`[${ts}] [AUTH] [GOOGLE] ✗  Access denied — email not registered as admin`);
      console.log(`[${ts}] [AUTH] [GOOGLE] ──────────────────────────────\n`);
      return done(null, false, { message: 'No admin account found for this Google account.' });
    }

    console.log(`[${ts}] [AUTH] [GOOGLE] ✓  Admin verified — role: ${admin.role || 'admin'}`);
    console.log(`[${ts}] [AUTH] [GOOGLE] ✓  Login successful for: ${admin.name}`);
    console.log(`[${ts}] [AUTH] [GOOGLE] ──────────────────────────────\n`);
    return done(null, admin);
  } catch (err) {
    console.error(`[${ts}] [AUTH] [GOOGLE] ✗  Internal error: ${err.message}`);
    console.log(`[${ts}] [AUTH] [GOOGLE] ──────────────────────────────\n`);
    return done(err, null);
  }
}));

// Redirect to Google
router.get('/', passport.authenticate('admin-google', {
  scope: ['profile', 'email'],
  session: false,
}));

// Google callback
router.get('/callback',
  passport.authenticate('admin-google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/auth?error=google_failed`,
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role || 'admin', name: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '7d' }
    );
    res.redirect(`${process.env.CLIENT_URL}/auth/google-callback?token=${token}`);
  }
);

module.exports = router;
