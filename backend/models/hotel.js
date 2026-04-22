const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 3
  },
  apiReviewCount: {
    type: Number,
    default: 50 // Default weight of 50 reviews for API data
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: {
    type: [String],
    default: []
  },
  userRatingAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  userReviewCount: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for "Merged Rating"
// Performs a weighted average merging total API reviews and total App reviews
hotelSchema.virtual('mergedRating').get(function() {
  const totalApiStars = (this.stars || 0) * (this.apiReviewCount || 0);
  const totalAppStars = (this.userRatingAverage || 0) * (this.userReviewCount || 0);
  const totalReviews = (this.apiReviewCount || 0) + (this.userReviewCount || 0);

  if (totalReviews === 0) return this.stars || 0;
  
  return (totalApiStars + totalAppStars) / totalReviews;
});

// Add a text index for search
hotelSchema.index({ name: 'text', address: 'text', description: 'text', amenities: 'text' });

module.exports = mongoose.model('Hotel', hotelSchema);
