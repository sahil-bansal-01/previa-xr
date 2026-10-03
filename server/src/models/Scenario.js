import mongoose from 'mongoose';
import { isConnectedToMongo, memoryStore } from '../config/db.js';

const ScenarioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  environmentType: { type: String, default: 'Indoor Emergency / Campus Facility' },
  environmentState: {
    gridWidth: { type: Number, default: 24 },
    gridHeight: { type: Number, default: 16 },
    cellSize: { type: Number, default: 1 },
    walls: { type: [Object], default: [] },
    exits: { type: [Object], default: [] },
    initialObstacles: { type: [Object], default: [] },
    initialAgents: { type: [Object], default: [] },
  },
  actions: { type: [Object], default: [] },
  createdBy: { type: String, default: 'system' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const MongooseScenario = mongoose.model('Scenario', ScenarioSchema);

export const ScenarioModel = {
  async find(query = {}) {
    if (isConnectedToMongo) {
      return await MongooseScenario.find(query).sort({ updatedAt: -1 });
    }
    return [...memoryStore.collections.scenarios].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async findById(id) {
    if (isConnectedToMongo) {
      return await MongooseScenario.findById(id);
    }
    return memoryStore.collections.scenarios.find(s => s._id === id || s.id === id) || null;
  },

  async create(data) {
    if (isConnectedToMongo) {
      const scenario = new MongooseScenario(data);
      return await scenario.save();
    }
    const newScenario = {
      _id: memoryStore.generateId(),
      title: data.title,
      description: data.description || '',
      environmentType: data.environmentType || 'Indoor Emergency / Campus Facility',
      environmentState: data.environmentState || {},
      actions: data.actions || [],
      createdBy: data.createdBy || 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    newScenario.id = newScenario._id;
    memoryStore.collections.scenarios.push(newScenario);
    return newScenario;
  },

  async findByIdAndUpdate(id, updates) {
    if (isConnectedToMongo) {
      return await MongooseScenario.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
    }
    const index = memoryStore.collections.scenarios.findIndex(s => s._id === id || s.id === id);
    if (index === -1) return null;
    memoryStore.collections.scenarios[index] = {
      ...memoryStore.collections.scenarios[index],
      ...updates,
      updatedAt: new Date(),
    };
    return memoryStore.collections.scenarios[index];
  },

  async findByIdAndDelete(id) {
    if (isConnectedToMongo) {
      return await MongooseScenario.findByIdAndDelete(id);
    }
    const index = memoryStore.collections.scenarios.findIndex(s => s._id === id || s.id === id);
    if (index === -1) return null;
    const deleted = memoryStore.collections.scenarios.splice(index, 1);
    return deleted[0];
  },

  async count() {
    if (isConnectedToMongo) {
      return await MongooseScenario.countDocuments();
    }
    return memoryStore.collections.scenarios.length;
  }
};

export default MongooseScenario;
