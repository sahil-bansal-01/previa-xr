import { SimulationRunModel } from '../models/SimulationRun.js';
import { ScenarioModel } from '../models/Scenario.js';

export async function createSimulation(req, res, next) {
  try {
    const {
      scenarioId,
      scenarioTitle,
      actionPerformed,
      initialState,
      finalState,
      blockedExits,
      affectedPeople,
      congestionLevel,
      estimatedDelay,
      recommendedExit,
      riskLevel,
    } = req.body;

    if (!scenarioId || !actionPerformed) {
      return res.status(400).json({
        error: true,
        message: 'scenarioId and actionPerformed are required.',
      });
    }

    const userId = req.user ? (req.user.id || req.user._id) : 'demo_user';

    const newRun = await SimulationRunModel.create({
      scenarioId,
      scenarioTitle: scenarioTitle || 'Campus Emergency Simulation',
      actionPerformed,
      initialState: initialState || {},
      finalState: finalState || {},
      blockedExits: blockedExits || [],
      affectedPeople: affectedPeople !== undefined ? affectedPeople : 0,
      congestionLevel: congestionLevel || 'Low',
      estimatedDelay: estimatedDelay !== undefined ? estimatedDelay : 0,
      recommendedExit: recommendedExit || 'Exit B',
      riskLevel: riskLevel || 'Medium',
      userId,
    });

    res.status(201).json({
      success: true,
      message: 'Simulation run persisted successfully.',
      data: newRun,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSimulations(req, res, next) {
  try {
    const runs = await SimulationRunModel.find();
    res.json({ success: true, count: runs.length, data: runs });
  } catch (err) {
    next(err);
  }
}

export async function getSimulationById(req, res, next) {
  try {
    const { id } = req.params;
    const run = await SimulationRunModel.findById(id);
    if (!run) {
      return res.status(404).json({ error: true, message: 'Simulation run not found.' });
    }
    res.json({ success: true, data: run });
  } catch (err) {
    next(err);
  }
}

export async function getScenarioSimulations(req, res, next) {
  try {
    const { id } = req.params;
    const runs = await SimulationRunModel.find({ scenarioId: id });
    res.json({ success: true, count: runs.length, data: runs });
  } catch (err) {
    next(err);
  }
}

// Compare 2 or more simulation runs
export async function compareSimulations(req, res, next) {
  try {
    const { ids } = req.query;
    if (!ids) {
      // Default: fetch the 2 most recent simulations
      const recent = await SimulationRunModel.find();
      const top2 = recent.slice(0, 2);
      return res.json({ success: true, data: top2 });
    }

    const idList = ids.split(',').map(s => s.trim());
    const runs = [];
    for (const id of idList) {
      const run = await SimulationRunModel.findById(id);
      if (run) runs.push(run);
    }

    res.json({ success: true, count: runs.length, data: runs });
  } catch (err) {
    next(err);
  }
}
