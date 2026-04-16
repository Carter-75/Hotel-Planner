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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a text index for search
hotelSchema.index({ name: 'text', address: 'text', description: 'text', amenities: 'text' });

module.exports = mongoose.model('Hotel', hotelSchema);
