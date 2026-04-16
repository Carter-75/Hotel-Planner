const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const crypto = require('crypto');

/**
 * @route   POST /api/auth/check-status
 * @desc    Check user status (exists/banned)
 * @access  Public
 */
// Check if an email has an account and if it's banned
router.post('/check-status', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.json({ exists: false, isBanned: false });
    }
    
    res.json({ exists: true, isBanned: user.isBanned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register user
 * @access  Public
 */
// Create a brand new account
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    // Automatically log in user after registration
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(user);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public (Local Strategy)
 */
// Sign in with email and password
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message });

    req.login(user, (err) => {
      if (err) return next(err);
      res.json(user);
    });
  })(req, res, next);
});

/**
 * @route   GET /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
// Log out and clear the session
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.json({ message: 'Logged out successfully' });
  });
});

/**
 * @route   GET /api/auth/user
 * @desc    Get current user
 * @access  Private
 */
// Ask the server if we're still logged in
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Forgot password
 * @access  Public
 */
// Request a password reset link to be sent to an email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ message: 'If an account with that email exists, an email has been sent.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    console.log(`[AUTH SERVICE] Reset Link: http://localhost:4200/reset-password?token=${token}`);

    res.json({ message: 'If an account with that email exists, an email has been sent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Public (with Token)
 */
// Set a new password using a secret token from an email
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
