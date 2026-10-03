import mongoose from 'mongoose';

// In-memory fallback database store in case standalone MongoDB daemon is not running
class MemoryStore {
  constructor() {
    this.collections = {
      users: [],
      scenarios: [],
      simulations: [],
    };
    this.isMemory = true;
    console.log('[DB] Initialized in-memory resilient document database.');
  }

  generateId() {
    return 'mem_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }
}

export const memoryStore = new MemoryStore();
export let isConnectedToMongo = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/previa-xr';
  
  try {
    mongoose.set('strictQuery', false);
    // Attempt connection with 2.5s timeout so startup is fast even if local Mongo is absent
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });
    isConnectedToMongo = true;
    console.log(`[DB] Connected successfully to MongoDB at: ${uri}`);
  } catch (err) {
    isConnectedToMongo = false;
    console.warn(`[DB] Standalone MongoDB not reachable (${err.message}).`);
    console.log('[DB] Activating high-performance in-memory persistence layer for PREVIA XR.');
  }
}
