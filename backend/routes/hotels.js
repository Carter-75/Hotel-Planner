const express = require('express');
const router = express.Router();
const Hotel = require('../models/hotel');
const { isAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/hotels
 * @desc    Get all hotels with optional filtering
 * @access  Public
 */
// Search for hotels based on location, price, and star rating
router.get('/', async (req, res) => {
  try {
    const { location, minPrice, maxPrice, rating } = req.query;
    let query = {};

    // Filter by city or address
    if (location) {
      query.$text = { $search: location };
    }
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    // Filter by minimum stars
    if (rating) {
      query.stars = { $gte: Number(rating) };
    }

    const hotels = await Hotel.find(query).sort({ createdAt: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/hotels/:id
 * @desc    Get hotel by ID
 * @access  Public
 */
// Get all the details for just one hotel
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/hotels
 * @desc    Create a new hotel
 * @access  Private (Admin)
 */
// Admin ONLY: Add a brand new hotel to the database
router.post('/', isAdmin, async (req, res) => {
  try {
    const newHotel = new Hotel(req.body);
    const hotel = await newHotel.save();
    res.status(201).json(hotel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/hotels/:id
 * @desc    Update a hotel
 * @access  Private (Admin)
 */
// Admin ONLY: Edit an existing hotel's information
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    res.json(hotel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   DELETE /api/hotels/:id
 * @desc    Delete a hotel
 * @access  Private (Admin)
 */
// Admin ONLY: Remove a hotel from the list permanently
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    res.json({ message: 'Hotel deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
