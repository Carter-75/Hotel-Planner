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
    const { location, minPrice, maxPrice, rating, page = 1, limit = 20 } = req.query;
    let query = {};
    let sort = { createdAt: -1 };
    let projection = {};

    // Filter by city or address
    if (location) {
      // Split by commas and wrap each part in quotes to force an 'AND' phrase search.
      // E.g. "La Crosse, WI" -> "\"La Crosse\" \"WI\""
      // This prevents "La" matching "LA" (Louisiana) unless "Crosse" is also present.
      const phraseQuery = location.split(',')
        .map(p => `"${p.trim()}"`)
        .join(' ');

      query.$text = { $search: phraseQuery };
      
      // During a text search, we MUST sort by relevance score
      // otherwise generic 'USA' matches will clutter the results.
      projection = { score: { $meta: "textScore" } };
      sort = { score: { $meta: "textScore" } };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      const min = Number(minPrice);
      const max = Number(maxPrice);
      if (!isNaN(min) && minPrice !== null && minPrice !== undefined) query.price.$gte = min;
      if (!isNaN(max) && maxPrice !== null && maxPrice !== undefined) query.price.$lte = max;
      if (Object.keys(query.price).length === 0) delete query.price;
    }
    
    // Filter by minimum stars
    if (rating) {
      const r = Number(rating);
      if (!isNaN(r)) query.stars = { $gte: r };
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const total = await Hotel.countDocuments(query);
    
    const hotels = await Hotel.find(query, projection)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      hotels,
      total,
      limit: Number(limit),
      page: Number(page)
    });
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
