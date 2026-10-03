import mongoose from 'mongoose';
import { isConnectedToMongo, memoryStore } from '../config/db.js';

const EnvironmentSchema = new mongoose.Schema({
  userId: { type: String, default: 'demo_user' },
  name: { type: String, required: true },
  sourceType: { type: String, enum: ['video', 'images', 'demo'], default: 'images' },
  sourceFiles: { type: [Object], default: [] },
  analysisStatus: {
    type: String,
    enum: ['pending', 'processing', 'analyzed', 'confirmed'],
    default: 'pending'
  },
  geometry: {
    walls: { type: [Object], default: [] },
    rooms: { type: [Object], default: [] },
    corridors: { type: [Object], default: [] },
    doors: { type: [Object], default: [] }
  },
  navigation: {
    gridWidth: { type: Number, default: 24 },
    gridHeight: { type: Number, default: 16 },
    cellSize: { type: Number, default: 1 },
    walkableGrid: { type: Object, default: {} }
  },
  exits: { type: [Object], default: [] },
  obstacles: { type: [Object], default: [] },
  people: { type: [Object], default: [] },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongooseEnvironment = mongoose.model('Environment', EnvironmentSchema);

export const EnvironmentModel = {
  async find(query = {}) {
    if (isConnectedToMongo) {
      return await MongooseEnvironment.find(query).sort({ updatedAt: -1 });
    }
    let envs = [...memoryStore.collections.environments];
    if (query.userId) {
      envs = envs.filter(e => e.userId === query.userId);
    }
    return envs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async findById(id) {
    if (isConnectedToMongo) {
      return await MongooseEnvironment.findById(id);
    }
    return memoryStore.collections.environments.find(e => e._id === id || e.id === id) || null;
  },

  async create(data) {
    if (isConnectedToMongo) {
      const env = new MongooseEnvironment(data);
      return await env.save();
    }
    const newEnv = {
      _id: memoryStore.generateId(),
      userId: data.userId || 'demo_user',
      name: data.name || 'Untitled Environment',
      sourceType: data.sourceType || 'images',
      sourceFiles: data.sourceFiles || [],
      analysisStatus: data.analysisStatus || 'pending',
      geometry: {
        walls: data.geometry?.walls || [],
        rooms: data.geometry?.rooms || [],
        corridors: data.geometry?.corridors || [],
        doors: data.geometry?.doors || []
      },
      navigation: {
        gridWidth: data.navigation?.gridWidth || 24,
        gridHeight: data.navigation?.gridHeight || 16,
        cellSize: data.navigation?.cellSize || 1,
        walkableGrid: data.navigation?.walkableGrid || {}
      },
      exits: data.exits || [],
      obstacles: data.obstacles || [],
      people: data.people || [],
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    newEnv.id = newEnv._id;
    memoryStore.collections.environments.push(newEnv);
    return newEnv;
  },

  async findByIdAndUpdate(id, updates) {
    if (isConnectedToMongo) {
      return await MongooseEnvironment.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
    }
    const index = memoryStore.collections.environments.findIndex(e => e._id === id || e.id === id);
    if (index === -1) return null;
    memoryStore.collections.environments[index] = {
      ...memoryStore.collections.environments[index],
      ...updates,
      updatedAt: new Date()
    };
    return memoryStore.collections.environments[index];
  },

  async findByIdAndDelete(id) {
    if (isConnectedToMongo) {
      return await MongooseEnvironment.findByIdAndDelete(id);
    }
    const index = memoryStore.collections.environments.findIndex(e => e._id === id || e.id === id);
    if (index === -1) return null;
    const deleted = memoryStore.collections.environments.splice(index, 1);
    return deleted[0];
  },

  async count() {
    if (isConnectedToMongo) {
      return await MongooseEnvironment.countDocuments();
    }
    return memoryStore.collections.environments.length;
  }
};

export default MongooseEnvironment;
