import { EnvironmentModel } from '../models/Environment.js';
import { analyzeSpatialEnvironment } from '../services/spatialAnalysisService.js';

// Upload files handler
export async function uploadFiles(req, res, next) {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: true, message: 'No files were uploaded.' });
    }

    const envId = String(req.environmentId || req.params?.id || req.headers['x-environment-id'] || req.query?.environmentId || 'default');
    const subfolder = req.query?.type === 'frame' ? 'frames' : 'original';
    const uploadedDetails = files.map(f => ({
      originalName: f.originalname,
      filename: f.filename,
      path: `/uploads/${envId}/${subfolder}/${f.filename}`,
      size: f.size,
      mimetype: f.mimetype,
      isImage: f.mimetype.startsWith('image/'),
      isVideo: f.mimetype.startsWith('video/')
    }));

    // If environment exists in DB, associate these files
    const env = await EnvironmentModel.findById(envId);
    if (env) {
      if (subfolder === 'original') {
        const existingFiles = env.sourceFiles || [];
        const newFiles = [...existingFiles, ...uploadedDetails];
        await EnvironmentModel.findByIdAndUpdate(envId, {
          sourceFiles: newFiles
        });
      } else if (subfolder === 'frames') {
        const existingFrames = env.metadata?.extractedFrames || [];
        const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
        const newFrames = [
          ...existingFrames,
          ...uploadedDetails.map((f, idx) => ({
            index: existingFrames.length + idx,
            filename: f.filename,
            path: f.path,
            url: `${baseUrl}${f.path}`
          }))
        ];
        await EnvironmentModel.findByIdAndUpdate(envId, {
          metadata: {
            ...env.metadata,
            extractedFrames: newFrames,
            frameCount: newFrames.length
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Files uploaded successfully.',
      environmentId: envId,
      subfolder,
      files: uploadedDetails
    });
  } catch (err) {
    next(err);
  }
}

// Create environment
export async function createEnvironment(req, res, next) {
  try {
    const {
      name,
      sourceType,
      sourceFiles,
      geometry,
      navigation,
      exits,
      obstacles,
      people,
      metadata
    } = req.body;

    const userId = req.user ? (req.user.id || req.user._id) : 'demo_user';
    const isDemo = sourceType === 'demo';

    // Critical Requirement 2 & 26:
    // DO NOT use the hard-coded campus geometry as the fallback for uploaded environments.
    // The hard-coded campus environment should ONLY be used for the built-in DEMO ENVIRONMENT.
    // For uploaded spaces:
    // geometry must come from the uploaded source analysis or from manual verification stage.
    let initialGeometry = geometry;
    let initialExits = exits;
    let initialObstacles = obstacles;
    let initialPeople = people;

    if (!initialGeometry) {
      if (isDemo) {
        // Built-in campus demo layout ONLY
        initialGeometry = {
          walls: [
            { id: 'w-1', x1: -10, y1: -7, x2: 10, y2: -7 },
            { id: 'w-2', x1: 10, y1: -7, x2: 10, y2: 7 },
            { id: 'w-3', x1: 10, y1: 7, x2: -10, y2: 7 },
            { id: 'w-4', x1: -10, y1: 7, x2: -10, y2: -7 },
            { id: 'w-5', x1: -2, y1: -7, x2: -2, y2: 1 },
            { id: 'w-6', x1: 2, y1: 1, x2: 2, y2: 7 }
          ],
          rooms: [
            { id: 'r-1', name: 'West Zone', x: -6, y: -3, width: 7, height: 6 },
            { id: 'r-2', name: 'East Wing', x: 6, y: 3, width: 7, height: 6 }
          ],
          corridors: [],
          doors: [
            { id: 'd-1', x: -2, y: 2, width: 1.5, connectedAreas: ['West Zone', 'Central Corridor'] }
          ]
        };
        initialExits = initialExits && initialExits.length > 0 ? initialExits : [
          { id: 'ex-1', name: 'Primary Exit', x: 9.5, y: -6, type: 'emergency' },
          { id: 'ex-2', name: 'Secondary Exit', x: -9.5, y: 6, type: 'normal' }
        ];
        initialObstacles = initialObstacles || [
          { id: 'obs-1', name: 'Storage Cabinet', x: 0, y: 0, width: 1.5, height: 1.2, movable: true }
        ];
        initialPeople = initialPeople && initialPeople.length > 0 ? initialPeople : [
          { id: 'p-1', x: -6, y: -4, label: 'Occupant 1' },
          { id: 'p-2', x: -5, y: -2, label: 'Occupant 2' },
          { id: 'p-3', x: 5, y: 4, label: 'Occupant 3' },
          { id: 'p-4', x: 7, y: 2, label: 'Occupant 4' },
          { id: 'p-5', x: 0, y: -2, label: 'Occupant 5' }
        ];
      } else {
        // Custom uploaded space: Clean empty structure awaiting analysis/manual verification
        initialGeometry = {
          walls: [],
          rooms: [],
          corridors: [],
          doors: []
        };
        initialExits = initialExits || [];
        initialObstacles = initialObstacles || [];
        initialPeople = initialPeople || [];
      }
    }

    const env = await EnvironmentModel.create({
      userId,
      name: name || 'Uploaded Space ' + new Date().toLocaleDateString(),
      sourceType: sourceType || (sourceFiles && sourceFiles.some(f => f.isVideo) ? 'video' : 'images'),
      sourceFiles: sourceFiles || [],
      analysisStatus: initialGeometry && initialGeometry.walls && initialGeometry.walls.length > 0 ? 'analyzed' : 'pending',
      geometry: initialGeometry,
      navigation: navigation || { gridWidth: 24, gridHeight: 16, cellSize: 1 },
      exits: initialExits || [],
      obstacles: initialObstacles || [],
      people: initialPeople || [],
      metadata: metadata || {}
    });

    res.status(201).json({
      success: true,
      message: 'Environment created successfully.',
      data: env
    });
  } catch (err) {
    next(err);
  }
}

// List user environments
export async function getEnvironments(req, res, next) {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'demo_user';
    const query = { userId };
    const envs = await EnvironmentModel.find(query);
    res.json({ success: true, count: envs.length, data: envs });
  } catch (err) {
    next(err);
  }
}

// Get environment by ID
export async function getEnvironmentById(req, res, next) {
  try {
    const { id } = req.params;
    const env = await EnvironmentModel.findById(id);
    if (!env) {
      return res.status(404).json({ error: true, message: 'Environment not found.' });
    }
    res.json({ success: true, data: env });
  } catch (err) {
    next(err);
  }
}

// Update environment
export async function updateEnvironment(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await EnvironmentModel.findByIdAndUpdate(id, updates);
    if (!updated) {
      return res.status(404).json({ error: true, message: 'Environment not found.' });
    }

    res.json({
      success: true,
      message: 'Environment updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

// Delete environment
export async function deleteEnvironment(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await EnvironmentModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: true, message: 'Environment not found.' });
    }

    res.json({
      success: true,
      message: 'Environment deleted successfully.',
      data: deleted
    });
  } catch (err) {
    next(err);
  }
}

// Spatial Analysis Endpoint (Real Analysis Provider Abstraction)
export async function analyzeEnvironment(req, res, next) {
  try {
    const { id } = req.params;
    const env = await EnvironmentModel.findById(id);
    if (!env) {
      return res.status(404).json({ error: true, message: 'Environment not found.' });
    }

    // Call real spatial analysis service abstraction
    const analysisResult = await analyzeSpatialEnvironment(env);

    // Save generated candidate geometry, exits, obstacles, and people to THAT environment
    const updated = await EnvironmentModel.findByIdAndUpdate(id, {
      geometry: analysisResult.geometry,
      exits: analysisResult.exits,
      obstacles: analysisResult.obstacles,
      people: analysisResult.people,
      navigation: analysisResult.navigation || env.navigation || { gridWidth: 24, gridHeight: 16, cellSize: 1 },
      analysisStatus: 'analyzed',
      metadata: {
        ...env.metadata,
        analysisNotice: analysisResult.notice,
        hasExternalVision: analysisResult.isAiGenerated,
        isCandidate: true,
        analyzedAt: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      message: analysisResult.notice,
      isManualFallback: !analysisResult.isAiGenerated,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

// Confirm Environment Endpoint (Phase 8 Validation)
export async function confirmEnvironment(req, res, next) {
  try {
    const { id } = req.params;
    const env = await EnvironmentModel.findById(id);
    if (!env) {
      return res.status(404).json({ error: true, message: 'Environment not found.' });
    }

    const exits = env.exits || [];
    const geometry = env.geometry || { walls: [] };

    // Validation 1: At least one exit
    if (!exits || exits.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed: Add at least one exit before continuing.'
      });
    }

    // Validation 2: Geometry walls must exist
    if (!geometry.walls || geometry.walls.length < 3) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed: Space must have at least enclosing perimeter walls.'
      });
    }

    const confirmed = await EnvironmentModel.findByIdAndUpdate(id, {
      analysisStatus: 'confirmed'
    });

    res.json({
      success: true,
      message: 'Your space is ready for simulation.',
      data: confirmed
    });
  } catch (err) {
    next(err);
  }
}
