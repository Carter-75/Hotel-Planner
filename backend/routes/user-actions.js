const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { isAuthenticated } = require('../middleware/auth');

/**
 * @route   POST /api/user/save-hotel/:id
 * @desc    Toggle saving a hotel to the user's list
 * @access  Private
 */
router.post('/save-hotel/:id', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hotelId = req.params.id;
    const index = user.savedHotels.indexOf(hotelId);

    if (index > -1) {
      // Remove if already saved
      user.savedHotels.splice(index, 1);
    } else {
      // Save if not present
      user.savedHotels.push(hotelId);
    }

    await user.save();
    res.json(user.savedHotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/user/saved-hotels
 * @desc    Get all hotels saved by the current user
 * @access  Private
 */
router.get('/saved-hotels', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedHotels');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.savedHotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
