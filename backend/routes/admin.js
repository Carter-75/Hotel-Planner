const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Review = require('../models/review');
const { isAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/admin/users
 * @desc    Get moderation feed (Reviews + Users)
 * @access  Private (Admin Only)
 */
router.get('/users', isAdmin, async (req, res) => {
  try {
    // We return reviews populated with user info as the "Moderation Feed"
    const feed = await Review.find({})
      .populate('userId', 'firstName lastName email role isBanned')
      .sort({ createdAt: -1 });
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Toggle user role (admin/user)
 * @access  Private (Admin Only)
 */
router.patch('/users/:id/role', isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot change your own role.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PATCH /api/admin/users/:id/ban
 * @desc    Toggle user ban status
 * @access  Private (Admin Only)
 */
router.patch('/users/:id/ban', isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot ban yourself.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isBanned = !user.isBanned;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user account
 * @access  Private (Admin Only)
 */
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
