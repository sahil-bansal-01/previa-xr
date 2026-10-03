import { Router } from 'express';
import {
  getScenarios,
  getScenarioById,
  createScenario,
  updateScenario,
  deleteScenario,
  duplicateScenario,
  resetScenario,
} from '../controllers/scenarioController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getScenarios);
router.get('/:id', getScenarioById);
router.post('/', optionalAuth, createScenario);
router.put('/:id', optionalAuth, updateScenario);
router.delete('/:id', optionalAuth, deleteScenario);
router.post('/:id/duplicate', optionalAuth, duplicateScenario);
router.post('/:id/reset', optionalAuth, resetScenario);

export default router;
