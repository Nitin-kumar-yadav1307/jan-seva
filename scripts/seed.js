import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../apps/api/src/models/User.js';
import Worker from '../apps/api/src/models/Worker.js';
import Cooperative from '../apps/api/src/models/Cooperative.js';
import Service from '../apps/api/src/models/Service.js';
import Booking from '../apps/api/src/models/Booking.js';
import Rating from '../apps/api/src/models/Rating.js';
import AIActionLog from '../apps/api/src/models/AIActionLog.js';
import Payment from '../apps/api/src/models/Payment.js';
import WorkforceRecommendation from '../apps/api/src/models/WorkforceRecommendation.js';
import { store } from '../apps/api/src/services/store.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDirectory, '../.env') });

export const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required to reset MongoDB data.');

  console.log('[Seed] Connecting to MongoDB...');

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`[Seed] Connected to ${conn.connection.host}. Clearing application collections...`);

    await Promise.all([
      User.deleteMany({}),
      Worker.deleteMany({}),
      Cooperative.deleteMany({}),
      Service.deleteMany({}),
      Booking.deleteMany({}),
      Rating.deleteMany({}),
      Payment.deleteMany({}),
      WorkforceRecommendation.deleteMany({}),
      AIActionLog.deleteMany({})
    ]);

    console.log('[Seed] ✅ MongoDB application collections cleared. No demo data was inserted.');
    await mongoose.disconnect();
  } catch (err) {
    console.warn(`[Seed] MongoDB reset failed (${err.message}). Clearing in-memory store instead.`);
    store.resetToDemo();
    await mongoose.disconnect().catch(() => {});
  }
};

if (process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0));
}
