const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Load environment variables from root .env.local
const envPath = path.join(__dirname, '../../.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const Hotel = require('../models/hotel');

const SEED_COUNT = 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const DATA_URL = "https://raw.githubusercontent.com/Azure-Samples/azure-search-sample-data/main/hotels/HotelsData_toAzureBlobs.json";

async function seedDatabase() {
  try {
    if (!MONGODB_URI) throw new Error('MONGODB_URI not found in environment');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    console.log('Clearing existing database...');
    await Hotel.deleteMany({});

    console.log('Fetching data from Azure...');
    const response = await axios.get(DATA_URL);
    const sourceHotels = response.data;

    console.log(`Seeding until ${SEED_COUNT} VALID entries are saved...`);
    
    let savedCount = 0;
    let index = 0;

    while (savedCount < SEED_COUNT) {
        const template = sourceHotels[index % sourceHotels.length];
        index++;

        // VALIDATION CHECK: Skip if any critical piece of data is missing
        const hasName = !!template.HotelName;
        const hasAddress = template.Address && template.Address.StreetAddress && template.Address.City && template.Address.Country;
        const hasDescription = !!template.Description;
        const hasRating = typeof template.Rating === 'number';
        const hasPrice = template.Rooms && template.Rooms.length > 0 && typeof template.Rooms[0].BaseRate === 'number';
        const hasTags = template.Tags && Array.isArray(template.Tags) && template.Tags.length > 0;

        if (!hasName || !hasAddress || !hasDescription || !hasRating || !hasPrice || !hasTags) {
            // Log skip only for the first few to avoid log spam
            if (index <= sourceHotels.length) {
                console.log(`Skipping invalid entry: ${template.HotelName || 'Unknown Name'} (Missing data fields)`);
            }
            continue;
        }

        // Map Azure Data -> Our Model
        const hotel = new Hotel({
            name: savedCount < sourceHotels.length ? template.HotelName : `${template.HotelName} (${savedCount})`,
            address: `${template.Address.StreetAddress}, ${template.Address.City}, ${template.Address.StateProvince}, ${template.Address.Country}`,
            stars: template.Rating,
            apiReviewCount: 100, // Specified weight of 100
            price: template.Rooms[0].BaseRate,
            amenities: template.Tags,
            description: template.Description,
            userRatingAverage: 0,
            userReviewCount: 0
        });

        await hotel.save();
        savedCount++;

        if (savedCount % 100 === 0) {
            console.log(`Progress: ${savedCount}/${SEED_COUNT}`);
        }
    }

    console.log(`SUCCESS: Seeding complete. Saved ${savedCount} entries.`);
    process.exit(0);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
