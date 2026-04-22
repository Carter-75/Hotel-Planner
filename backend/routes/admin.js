const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Review = require('../models/review');
const Hotel = require('../models/hotel');
const { isAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/admin/users
 * @desc    Get moderation feed (Reviews + Users)
 * @access  Private (Admin Only)
 */
router.get('/users', isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', rating = null } = req.query;
    
    // 1. Fetch all users
    const users = await User.find({})
      .select('firstName lastName email role isBanned createdAt')
      .lean();

    // 2. Fetch all reviews
    const allReviews = await Review.find({})
      .sort({ createdAt: -1 })
      .lean();

    // 3. Group reviews by User ID
    const reviewMap = new Map();
    allReviews.forEach(r => {
      const uid = r.userId?.toString();
      if (!uid) return;
      if (!reviewMap.has(uid)) reviewMap.set(uid, []);
      reviewMap.get(uid).push(r);
    });

    // 4. Map users to their reviews and calculate 'latest activity'
    let combined = users.map(u => {
      const userReviews = reviewMap.get(u._id.toString()) || [];
      const latestReviewDate = userReviews.length > 0 ? userReviews[0].createdAt : null;
      const latestActivity = latestReviewDate || u.createdAt;

      return {
        _id: u._id,
        userId: u,
        reviews: userReviews,
        latestActivity,
        // For compatibility with search filters
        rating: userReviews.length > 0 ? userReviews[0].rating : null
      };
    });

    // 5. Apply server-side filters
    if (search) {
      const s = search.toLowerCase();
      combined = combined.filter(item => {
        const u = item.userId;
        return `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) || 
               u.email?.toLowerCase().includes(s);
      });
    }

    if (rating) {
      // Filter for users who have at least one review with this specific rating
      combined = combined.filter(item => 
        item.reviews.some(r => r.rating === Number(rating))
      );
    }

    // 6. Sort by newest activity first
    combined.sort((a, b) => {
      return new Date(b.latestActivity).getTime() - new Date(a.latestActivity).getTime();
    });

    // 7. Paginate
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedItems = combined.slice(startIndex, startIndex + Number(limit));

    res.json({
      items: paginatedItems,
      total: combined.length,
      page: Number(page),
      limit: Number(limit)
    });
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

    // 1. Find all reviews by this user to identify impacted hotels
    const userReviews = await Review.find({ userId: req.params.id });
    const hotelIdsToUpdate = [...new Set(userReviews.map(r => r.hotelId.toString()))];

    // 2. Delete all reviews by this user
    await Review.deleteMany({ userId: req.params.id });

    // 3. Recalculate ratings for all impacted hotels
    for (const hotelId of hotelIdsToUpdate) {
      await Review.calculateAverageRating(new mongoose.Types.ObjectId(hotelId));
    }

    // 4. Finally, delete the user account
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ message: 'User and all their activity deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/admin/seed-bulk
 * @desc    Bulk seed hotels (Admin Only)
 * @access  Private (Admin Only)
 */
router.post('/seed-bulk', isAdmin, async (req, res) => {
  try {
    const { hotels, clearExisting } = req.body;

    if (!Array.isArray(hotels)) {
      return res.status(400).json({ error: 'Data must be an array of hotels' });
    }

    if (clearExisting) {
      console.log('Admin: Clearing all hotels before bulk seed...');
      await Hotel.deleteMany({});
    }

    const result = await Hotel.insertMany(hotels);
    res.json({ 
      message: `Successfully seeded ${result.length} hotels.`,
      count: result.length 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
