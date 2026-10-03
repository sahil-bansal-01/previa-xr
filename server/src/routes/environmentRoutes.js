import { Router } from 'express';
import {
  uploadFiles,
  createEnvironment,
  getEnvironments,
  getEnvironmentById,
  updateEnvironment,
  deleteEnvironment,
  analyzeEnvironment,
  confirmEnvironment
} from '../controllers/environmentController.js';
import { optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Upload files route
router.post('/upload', upload.array('files', 20), uploadFiles);

// Environment CRUD & Lifecycle
router.get('/', optionalAuth, getEnvironments);
router.post('/', optionalAuth, createEnvironment);
router.get('/:id', getEnvironmentById);
router.put('/:id', optionalAuth, updateEnvironment);
router.delete('/:id', optionalAuth, deleteEnvironment);

// Spatial Analysis & Confirmation
router.post('/:id/analyze', optionalAuth, analyzeEnvironment);
router.post('/:id/confirm', optionalAuth, confirmEnvironment);

export default router;
