import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDirectory, '../../../../.env') });

let isConnected = false;
let isMockDb = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coopseva';
  
  try {
        mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout for local fallback
      autoIndex: false, // Demo DB carries legacy geo docs without coordinates; distances are
                        // computed in JS (haversine), so the 2dsphere index is not required and
                        // its auto-build would abort seeding on malformed legacy documents.
    });
    isConnected = true;
    isMockDb = false;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Real MongoDB connection failed (${error.message}). Activating In-Memory Fallback Store.`);
    isConnected = false;
    isMockDb = true;
    return null;
  }
};

export const getDbStatus = () => ({
  isConnected,
  isMockDb,
  mode: isMockDb ? 'in-memory-fallback' : 'mongodb-live'
});
