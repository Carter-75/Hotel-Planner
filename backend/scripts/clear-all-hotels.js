const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const Hotel = require('../models/hotel');
const Review = require('../models/review');
const User = require('../models/user');

async function clearAllHotels() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log('WARNING: This will delete hotels and reviews');
        
        console.log('Deleting all reviews...');
        await Review.deleteMany({});
        
        console.log('Clearing savedHotels arrays for users');
        await User.updateMany({}, { $set: { savedHotels: [] } });

        console.log('Deleting all hotels...');
        await Hotel.deleteMany({});

        console.log('DONE: Hotels and Reviews gon3');
        process.exit(0);

    } catch (err) {
        console.error('Operation failed:', err);
        process.exit(1);
    }
}

clearAllHotels();
