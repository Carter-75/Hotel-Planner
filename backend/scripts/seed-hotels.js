/**
 * HOTEL PLANNER - BACKEND SEEDING SCRIPT
 * ------------------------------------
 * Relative to project root: node backend/scripts/seed-hotels.js
 */

const mongoose = require('mongoose');
const path = require('path');
const dns = require('node:dns');

// Set servers to public DNS for reliable Atlas resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const Hotel = require('../models/hotel');

(async () => {
  const SEED_COUNT = 5000;
  const DATA_URL = "https://raw.githubusercontent.com/Azure-Samples/azure-search-sample-data/main/hotels/HotelsData_toAzureBlobs.json";
  const CHUNK_SIZE = 100;

  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) throw new Error('MONGODB_URI not found in .env.local');

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected.");

    console.log("Fetching data from Azure...");
    const https = require('https');
    const sourceHotels = await new Promise((resolve, reject) => {
      https.get(DATA_URL, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
        res.on('error', reject);
      }).on('error', reject);
    });
    
    console.log('Loaded ' + sourceHotels.length + ' source hotels.');


    // Clear existing hotels first
    console.log("Clearing existing hotels...");
    await Hotel.deleteMany({});

    let savedCount = 0;
    let index = 0;
    let batch = [];

    while (savedCount < SEED_COUNT) {
      const template = sourceHotels[index % sourceHotels.length];
      index++;

      // Validation
      const hasName = !!template.HotelName;
      const hasAddress = template.Address && template.Address.StreetAddress && template.Address.City && template.Address.Country;
      const hasPrice = template.Rooms && template.Rooms.length > 0 && typeof template.Rooms[0].BaseRate === 'number';

      if (!hasName || !hasAddress || !hasPrice) continue;

      // Map to Model
      batch.push({
        name: savedCount < sourceHotels.length ? template.HotelName : `${template.HotelName} (${savedCount})`,
        address: `${template.Address.StreetAddress}, ${template.Address.City}, ${template.Address.StateProvince}, ${template.Address.Country}`,
        stars: template.Rating || 3,
        apiReviewCount: 100,
        price: template.Rooms[0].BaseRate,
        amenities: template.Tags || [],
        description: template.Description || "No description available.",
        userRatingAverage: 0,
        userReviewCount: 0
      });

      savedCount++;

      // If batch is full or we reached the target, save it
      if (batch.length === CHUNK_SIZE || savedCount === SEED_COUNT) {
        console.log('Saving batch: ' + (savedCount - batch.length + 1) + ' to ' + savedCount + '...');
        await Hotel.insertMany(batch);
        console.log('Batch Saved. Total: ' + savedCount + '/' + SEED_COUNT);
        batch = [];
      }
    }

    console.log("SUCCESS: Seeding Complete!");
    process.exit(0);

  } catch (error) {
    console.error("Seeding Failed:", error.message);
    process.exit(1);
  }
})();
