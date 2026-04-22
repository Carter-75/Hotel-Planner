const mongoose = require('mongoose');
const path = require('path');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });


const User = require('../models/user');

const admins = [
  'cartermoyer75@gmail.com',
  'moyer6141@uwlax.edu'
];

async function promote() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found in .env.local');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);

    console.log('Promoting users to admin...');
    const result = await User.updateMany(
      { email: { $in: admins.map(e => e.toLowerCase()) } },
      { $set: { role: 'admin' } }
    );

    console.log(`Success! Updated ${result.modifiedCount} users to admin.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

promote();
