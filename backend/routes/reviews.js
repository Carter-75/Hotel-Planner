const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const User = require('../models/user');
const { isAuthenticated, isAdmin } = require('../middleware/auth');


/**
 * @route   POST /api/reviews
 * @desc    Create a review
 * @access  Private
 */
//Let a logged-in user post a new review
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
 * @route   GET /api/reviews/:id
 * @desc    Get a single review
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @access  Private (Owner Only)
 */
//Let the original author edit their review
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) return res.status(404).json({ error: 'Review not found' });

    // Security check: Only the author can edit
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You cannot edit this review' });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save(); // .save() triggers the calculateAverageRating post-hook
    res.json(review);
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
