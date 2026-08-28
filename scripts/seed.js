import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../apps/api/src/models/User.js';
import Worker from '../apps/api/src/models/Worker.js';
import Cooperative from '../apps/api/src/models/Cooperative.js';
import Service from '../apps/api/src/models/Service.js';
import Booking from '../apps/api/src/models/Booking.js';
import Rating from '../apps/api/src/models/Rating.js';
import AIActionLog from '../apps/api/src/models/AIActionLog.js';
import {
  INITIAL_COOPERATIVES,
  INITIAL_SERVICES,
  INITIAL_USERS,
  INITIAL_WORKERS,
  INITIAL_BOOKINGS,
  INITIAL_RATINGS,
  INITIAL_AI_LOGS,
  store
} from '../apps/api/src/services/store.js';

dotenv.config();

export const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coopseva';
  console.log('[Seed] Connecting to MongoDB...');

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`[Seed] Connected to ${conn.connection.host}. Clearing existing collections...`);

    await Promise.all([
      User.deleteMany({}),
      Worker.deleteMany({}),
      Cooperative.deleteMany({}),
      Service.deleteMany({}),
      Booking.deleteMany({}),
      Rating.deleteMany({}),
      AIActionLog.deleteMany({})
    ]);

    console.log('[Seed] Inserting Cooperatives & Services...');
    await Cooperative.insertMany(INITIAL_COOPERATIVES);
    await Service.insertMany(INITIAL_SERVICES);

    console.log('[Seed] Inserting Users & Workers...');
    await User.insertMany(INITIAL_USERS);
    await Worker.insertMany(INITIAL_WORKERS);

    console.log('[Seed] Inserting Bookings, Ratings, and AI Action Logs...');
    await Booking.insertMany(INITIAL_BOOKINGS);
    await Rating.insertMany(INITIAL_RATINGS);
    await AIActionLog.insertMany(INITIAL_AI_LOGS);

    console.log('[Seed] ✅ MongoDB Database successfully seeded with full realistic demo dataset!');
    await mongoose.disconnect();
  } catch (err) {
    console.warn(`[Seed] Live MongoDB unavailable (${err.message}). Pre-populated In-Memory Store is ready for demo!`);
    store.resetToDemo();
  }
};

if (process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0));
}
