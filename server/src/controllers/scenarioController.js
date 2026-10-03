import { ScenarioModel } from '../models/Scenario.js';
import { defaultCampusScenario } from '../services/seedService.js';

export async function getScenarios(req, res, next) {
  try {
    const scenarios = await ScenarioModel.find();
    res.json({ success: true, count: scenarios.length, data: scenarios });
  } catch (err) {
    next(err);
  }
}

export async function getScenarioById(req, res, next) {
  try {
    const { id } = req.params;
    const scenario = await ScenarioModel.findById(id);
    if (!scenario) {
      return res.status(404).json({ error: true, message: 'Scenario not found.' });
    }
    res.json({ success: true, data: scenario });
  } catch (err) {
    next(err);
  }
}

export async function createScenario(req, res, next) {
  try {
    const { title, description, environmentType, environmentState, actions } = req.body;
    if (!title) {
      return res.status(400).json({ error: true, message: 'Scenario title is required.' });
    }

    const createdBy = req.user ? (req.user.id || req.user._id) : 'demo_user';
    const newScenario = await ScenarioModel.create({
      title,
      description: description || '',
      environmentType: environmentType || 'Indoor Emergency / Campus Facility',
      environmentState: environmentState || defaultCampusScenario.environmentState,
      actions: actions || [],
      createdBy,
    });

    res.status(201).json({
      success: true,
      message: 'Scenario created successfully.',
      data: newScenario,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateScenario(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await ScenarioModel.findByIdAndUpdate(id, updates);
    if (!updated) {
      return res.status(404).json({ error: true, message: 'Scenario not found.' });
    }

    res.json({
      success: true,
      message: 'Scenario updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteScenario(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await ScenarioModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: true, message: 'Scenario not found.' });
    }

    res.json({
      success: true,
      message: 'Scenario deleted successfully.',
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
}

export async function duplicateScenario(req, res, next) {
  try {
    const { id } = req.params;
    const original = await ScenarioModel.findById(id);
    if (!original) {
      return res.status(404).json({ error: true, message: 'Source scenario not found.' });
    }

    const duplicated = await ScenarioModel.create({
      title: `${original.title} (Copy)`,
      description: original.description,
      environmentType: original.environmentType,
      environmentState: original.environmentState,
      actions: original.actions,
      createdBy: req.user ? (req.user.id || req.user._id) : original.createdBy,
    });

    res.status(201).json({
      success: true,
      message: 'Scenario duplicated successfully.',
      data: duplicated,
    });
  } catch (err) {
    next(err);
  }
}

export async function resetScenario(req, res, next) {
  try {
    const { id } = req.params;
    const scenario = await ScenarioModel.findById(id);
    if (!scenario) {
      return res.status(404).json({ error: true, message: 'Scenario not found.' });
    }

    // Reset to default baseline state
    const resetData = {
      environmentState: defaultCampusScenario.environmentState,
      actions: defaultCampusScenario.actions,
    };

    const updated = await ScenarioModel.findByIdAndUpdate(id, resetData);
    res.json({
      success: true,
      message: 'Scenario environment reset to baseline.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}
