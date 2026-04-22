const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to calculate average rating and update Hotel
reviewSchema.statics.calculateAverageRating = async function(hotelId) {
  const stats = await this.aggregate([
    { $match: { hotelId: hotelId } },
    {
      $group: {
        _id: '$hotelId',
        avgRating: { $avg: '$rating' },
        nReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Hotel').findByIdAndUpdate(hotelId, {
      userRatingAverage: Math.round(stats[0].avgRating * 10) / 10,
      userReviewCount: stats[0].nReviews
    });
  } else {
    await mongoose.model('Hotel').findByIdAndUpdate(hotelId, {
      userRatingAverage: 0,
      userReviewCount: 0
    });
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.hotelId);
});

// Call calculateAverageRating after remove/delete
reviewSchema.post('deleteOne', { document: true, query: false }, function() {
  this.constructor.calculateAverageRating(this.hotelId);
});

module.exports = mongoose.model('Review', reviewSchema);
