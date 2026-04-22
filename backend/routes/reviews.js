const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const User = require('../models/user');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/reviews/hotel/:hotelId
 * @desc    Get all reviews for a hotel
 * @access  Public
 */
// Get all reviews for a specific hotel and show the author's name
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const reviews = await Review.find({ hotelId: req.params.hotelId })
      .populate('userId', 'firstName lastName image')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/reviews
 * @desc    Create a review
 * @access  Private
 */
// Let a logged-in user post a new review
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { hotelId, title, rating, comment } = req.body;
    const newReview = new Review({
      hotelId,
      userId: req.user.id,
      title,
      rating,
      comment
    });
    const review = await newReview.save();

    // Auto-save the hotel if not already saved (idempotent)
    await User.findByIdAndUpdate(req.user.id, { 
      $addToSet: { savedHotels: hotelId } 
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private (Admin or Owner)
 */
// Remove a review - must be the person who wrote it OR an admin
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    // Security check: Only the author or an admin can delete
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You cannot delete this review' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
