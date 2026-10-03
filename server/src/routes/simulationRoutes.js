import { Router } from 'express';
import {
  createSimulation,
  getSimulations,
  getSimulationById,
  getScenarioSimulations,
  compareSimulations,
} from '../controllers/simulationController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', optionalAuth, createSimulation);
router.get('/', getSimulations);
router.get('/compare', compareSimulations);
router.get('/:id', getSimulationById);
router.get('/scenario/:id', getScenarioSimulations);

export default router;
