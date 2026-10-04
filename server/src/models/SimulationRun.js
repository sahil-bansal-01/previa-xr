import mongoose from 'mongoose';
import { isConnectedToMongo, memoryStore } from '../config/db.js';

const SimulationRunSchema = new mongoose.Schema({
  scenarioId: { type: String, required: true },
  scenarioTitle: { type: String, default: 'Emergency Scenario' },
  actionPerformed: { type: String, required: true },
  initialState: { type: Object, default: {} },
  finalState: { type: Object, default: {} },
  blockedExits: { type: [String], default: [] },
  affectedPeople: { type: Number, default: 0 },
  congestionLevel: { type: String, default: 'Moderate' },
  estimatedDelay: { type: Number, default: 0 },
  recommendedExit: { type: String, default: 'Exit B' },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  environmentId: { type: String, default: null },
  simulationTimestamp: { type: Date, default: Date.now },
  userId: { type: String, default: 'demo_user' },
});

const MongooseSimulationRun = mongoose.model('SimulationRun', SimulationRunSchema);

export const SimulationRunModel = {
  async find(query = {}) {
    if (isConnectedToMongo) {
      return await MongooseSimulationRun.find(query).sort({ simulationTimestamp: -1 });
    }
    let runs = [...memoryStore.collections.simulations];
    if (query.scenarioId) {
      runs = runs.filter(r => r.scenarioId === query.scenarioId);
    }
    if (query.environmentId) {
      runs = runs.filter(r => r.environmentId === query.environmentId);
    }
    if (query.userId) {
      runs = runs.filter(r => r.userId === query.userId);
    }
    return runs.sort(
      (a, b) => new Date(b.simulationTimestamp).getTime() - new Date(a.simulationTimestamp).getTime()
    );
  },

  async findById(id) {
    if (isConnectedToMongo) {
      return await MongooseSimulationRun.findById(id);
    }
    return memoryStore.collections.simulations.find(r => r._id === id || r.id === id) || null;
  },

  async create(data) {
    if (isConnectedToMongo) {
      const run = new MongooseSimulationRun(data);
      return await run.save();
    }
    const newRun = {
      _id: memoryStore.generateId(),
      scenarioId: data.scenarioId,
      scenarioTitle: data.scenarioTitle || 'Emergency Campus Facility',
      actionPerformed: data.actionPerformed,
      initialState: data.initialState || {},
      finalState: data.finalState || {},
      blockedExits: data.blockedExits || [],
      affectedPeople: data.affectedPeople || 0,
      congestionLevel: data.congestionLevel || 'Moderate',
      estimatedDelay: data.estimatedDelay || 0,
      recommendedExit: data.recommendedExit || 'Exit B',
      riskLevel: data.riskLevel || 'Medium',
      environmentId: data.environmentId || null,
      simulationTimestamp: new Date(),
      userId: data.userId || 'demo_user',
    };
    newRun.id = newRun._id;
    memoryStore.collections.simulations.push(newRun);
    return newRun;
  },

  async count() {
    if (isConnectedToMongo) {
      return await MongooseSimulationRun.countDocuments();
    }
    return memoryStore.collections.simulations.length;
  }
};

export default MongooseSimulationRun;
