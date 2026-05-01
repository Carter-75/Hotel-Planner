const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env
const envPath = path.join(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

const User = require('../models/user');
const Review = require('../models/review');
const Hotel = require('../models/hotel');

const SEED_COUNT = 5000;

async function seedUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log('Fetching hotels for references...');
        const hotels = await Hotel.find().select('_id name').lean();
        if (hotels.length === 0) {
            console.error('No hotels found. Please seed hotels first.');
            process.exit(1);
        }
        console.log(`Found ${hotels.length} hotels.`);

        console.log(`Preparing to seed ${SEED_COUNT} users...`);
        
        // Hashing password once to save time
        const hashedPassword = await bcrypt.hash('example123', 10);

        const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
        const comments = [
            "Amazing stay! The staff was very helpful.",
            "Great location, but the room was a bit small.",
            "Lovely breakfast and comfortable beds.",
            "The view from my room was breathtaking.",
            "Value for money. Would recommend to anyone.",
            "A bit noisy at night, but otherwise fine.",
            "Clean and modern. Will come back again.",
            "The pool area is fantastic!",
            "Had a wonderful time with my family.",
            "Excellent service and high standards."
        ];

        const usersData = [];
        const reviewsData = [];

        for (let i = 0; i < SEED_COUNT; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const email = `${(i + 1).toString().padStart(4, '0')}@example.com`;
            
            // Randomly select 1-3 saved hotels
            const numSaved = Math.floor(Math.random() * 3) + 1;
            const savedHotels = [];
            for (let j = 0; j < numSaved; j++) {
                savedHotels.push(hotels[Math.floor(Math.random() * hotels.length)]._id);
            }

            const userId = new mongoose.Types.ObjectId();
            usersData.push({
                _id: userId,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                savedHotels: [...new Set(savedHotels)], // Unique IDs
                role: 'user',
                createdAt: new Date()
            });

            // Randomly add 0-2 reviews
            const numReviews = Math.floor(Math.random() * 3);
            for (let j = 0; j < numReviews; j++) {
                const hotel = hotels[Math.floor(Math.random() * hotels.length)];
                
                // NEW: Ensure reviewed hotel is also in the saved list
                savedHotels.push(hotel._id);

                const hasComment = Math.random() > 0.3;
                reviewsData.push({
                    hotelId: hotel._id,
                    userId: userId,
                    rating: Math.floor(Math.random() * 5) + 1,
                    comment: hasComment ? comments[Math.floor(Math.random() * comments.length)] : '',
                    createdAt: new Date()
                });
            }

            if (i % 500 === 0 && i > 0) {
                console.log(`Generated ${i} user objects...`);
            }
        }

        console.log('Inserting users...');
        await User.insertMany(usersData, { ordered: false });
        console.log('Users inserted successfully.');

        console.log('Inserting reviews...');
        await Review.insertMany(reviewsData, { ordered: false });
        console.log('Reviews inserted successfully.');

        console.log('Recalculating hotel ratings...');
        const uniqueHotelIds = [...new Set(reviewsData.map(r => r.hotelId.toString()))];
        for (let i = 0; i < uniqueHotelIds.length; i++) {
            await Review.calculateAverageRating(new mongoose.Types.ObjectId(uniqueHotelIds[i]));
            if (i % 10 === 0) console.log(`Updated ${i}/${uniqueHotelIds.length} hotels...`);
        }

        console.log('DONE: Seeding complete.');
        process.exit(0);

    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seedUsers();
