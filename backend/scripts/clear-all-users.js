const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envPath = path.join(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

const User = require('../models/user');
const Review = require('../models/review');

async function clearAllUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log('WARNING: This will delete the users and reviews');
        
        console.log('Deleting all reviews');
        await Review.deleteMany({});
        
        console.log('Deleting all users');
        await User.deleteMany({});

        console.log('DONE: Users and Reviews gone');
        process.exit(0);

    } catch (err) {
        console.error('Operation failed:', err);
        process.exit(1);
    }
}

clearAllUsers();
