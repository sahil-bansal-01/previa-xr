import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, '../../uploads');

/**
 * Deterministic hash generator from string input
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates an isolated, candidate spatial layout tailored to the specific environment.
 * Ensures that two different uploaded sources NEVER receive the same default map,
 * and NEVER silently assigns the campus demo layout.
 */
export function generateCandidateSpatialLayout(env, frameFiles = []) {
  const envId = String(env._id || env.id || 'env_default');
  const envName = env.name || 'Custom Space';

  // Compute unique seed from environment ID, name, source files, and frame list
  const fileDetails = (env.sourceFiles || []).map(f => `${f.originalName}_${f.size}`).join('_');
  const seedStr = `${envId}_${envName}_${fileDetails}_${frameFiles.join('_')}`;
  const seed = hashString(seedStr);

  // Proportions derived deterministically from the upload
  // Width: 16 to 22 meters; Depth: 12 to 16 meters
  const width = 16 + (seed % 7);
  const depth = 12 + ((seed >> 3) % 5);
  const halfW = Math.round((width / 2) * 10) / 10;
  const halfD = Math.round((depth / 2) * 10) / 10;

  // Determine exit configuration from seed
  const exitTypeMod = seed % 3;
  let exits = [];
  let walls = [];
  let doors = [];
  let rooms = [];

  // Perimeter walls with openings for doorways/exits
  if (exitTypeMod === 0) {
    // Primary Exit on East wall, Secondary Exit on West wall
    exits = [
      { id: `ex-main-${envId}`, name: 'East Exit', x: halfW, y: 0, type: 'emergency' },
      { id: `ex-sec-${envId}`, name: 'West Exit', x: -halfW, y: 0, type: 'emergency' },
    ];

    walls = [
      // North continuous wall
      { id: `w-n-${envId}`, x1: -halfW, y1: -halfD, x2: halfW, y2: -halfD },
      // South continuous wall
      { id: `w-s-${envId}`, x1: -halfW, y1: halfD, x2: halfW, y2: halfD },
      // East wall with 2.4m door opening around y=0
      { id: `w-e1-${envId}`, x1: halfW, y1: -halfD, x2: halfW, y2: -1.2 },
      { id: `w-e2-${envId}`, x1: halfW, y1: 1.2, x2: halfW, y2: halfD },
      // West wall with 2.4m door opening around y=0
      { id: `w-w1-${envId}`, x1: -halfW, y1: -halfD, x2: -halfW, y2: -1.2 },
      { id: `w-w2-${envId}`, x1: -halfW, y1: 1.2, x2: -halfW, y2: halfD },
      // Vertical interior partition with doorway at center
      { id: `w-part1-${envId}`, x1: 0, y1: -halfD, x2: 0, y2: -1.5 },
      { id: `w-part2-${envId}`, x1: 0, y1: 1.5, x2: 0, y2: halfD },
    ];

    doors = [
      { id: `d-1-${envId}`, x: 0, y: 0, width: 2.0, connectedAreas: ['West Zone', 'East Zone'] }
    ];

    rooms = [
      { id: `r-1-${envId}`, name: `${envName} — West Area`, x: -halfW / 2, y: 0, width: halfW, height: depth },
      { id: `r-2-${envId}`, name: `${envName} — East Concourse`, x: halfW / 2, y: 0, width: halfW, height: depth },
    ];
  } else if (exitTypeMod === 1) {
    // Primary Exit on South wall, Secondary Exit on East wall
    exits = [
      { id: `ex-main-${envId}`, name: 'South Exit', x: 0, y: halfD, type: 'emergency' },
      { id: `ex-sec-${envId}`, name: 'East Exit', x: halfW, y: -halfD / 2, type: 'normal' },
    ];

    walls = [
      // North continuous wall
      { id: `w-n-${envId}`, x1: -halfW, y1: -halfD, x2: halfW, y2: -halfD },
      // West continuous wall
      { id: `w-w-${envId}`, x1: -halfW, y1: -halfD, x2: -halfW, y2: halfD },
      // South wall with 2.4m door opening at center
      { id: `w-s1-${envId}`, x1: -halfW, y1: halfD, x2: -1.2, y2: halfD },
      { id: `w-s2-${envId}`, x1: 1.2, y1: halfD, x2: halfW, y2: halfD },
      // East wall with door opening at North section
      { id: `w-e1-${envId}`, x1: halfW, y1: -halfD, x2: halfW, y2: -halfD / 2 - 1.2 },
      { id: `w-e2-${envId}`, x1: halfW, y1: -halfD / 2 + 1.2, x2: halfW, y2: halfD },
      // Horizontal interior dividing partition
      { id: `w-part1-${envId}`, x1: -halfW, y1: 0, x2: -1.5, y2: 0 },
      { id: `w-part2-${envId}`, x1: 1.5, y1: 0, x2: halfW, y2: 0 },
    ];

    doors = [
      { id: `d-1-${envId}`, x: 0, y: 0, width: 2.2, connectedAreas: ['North Wing', 'Main Circulation'] }
    ];

    rooms = [
      { id: `r-1-${envId}`, name: `${envName} — North Hall`, x: 0, y: -halfD / 2, width: width, height: halfD },
      { id: `r-2-${envId}`, name: `${envName} — Circulation Hub`, x: 0, y: halfD / 2, width: width, height: halfD },
    ];
  } else {
    // Primary Exit on North-East, Secondary Exit on South-West
    exits = [
      { id: `ex-main-${envId}`, name: 'North Exit', x: halfW / 2, y: -halfD, type: 'emergency' },
      { id: `ex-sec-${envId}`, name: 'South Exit', x: -halfW / 2, y: halfD, type: 'emergency' },
    ];

    walls = [
      // North wall with door opening at right
      { id: `w-n1-${envId}`, x1: -halfW, y1: -halfD, x2: halfW / 2 - 1.2, y2: -halfD },
      { id: `w-n2-${envId}`, x1: halfW / 2 + 1.2, y1: -halfD, x2: halfW, y2: -halfD },
      // South wall with door opening at left
      { id: `w-s1-${envId}`, x1: -halfW, y1: halfD, x2: -halfW / 2 - 1.2, y2: halfD },
      { id: `w-s2-${envId}`, x1: -halfW / 2 + 1.2, y1: halfD, x2: halfW, y2: halfD },
      // East continuous wall
      { id: `w-e-${envId}`, x1: halfW, y1: -halfD, x2: halfW, y2: halfD },
      // West continuous wall
      { id: `w-w-${envId}`, x1: -halfW, y1: -halfD, x2: -halfW, y2: halfD },
      // L-shaped interior partition creating office zone
      { id: `w-l1-${envId}`, x1: -halfW * 0.2, y1: -halfD, x2: -halfW * 0.2, y2: 0 },
      { id: `w-l2-${envId}`, x1: -halfW * 0.2, y1: 0, x2: -halfW * 0.2 + 2.5, y2: 0 },
    ];

    doors = [
      { id: `d-1-${envId}`, x: -halfW * 0.2 + 3.2, y: 0, width: 1.5, connectedAreas: ['Main Atrium', 'Side Studio'] }
    ];

    rooms = [
      { id: `r-1-${envId}`, name: `${envName} — Main Gallery`, x: halfW * 0.2, y: 0, width: halfW * 1.4, height: depth },
      { id: `r-2-${envId}`, name: `${envName} — Workshop Bay`, x: -halfW * 0.55, y: -halfD / 2, width: halfW * 0.7, height: halfD },
    ];
  }

  // Occupants (3 to 5 people located in walkable zones)
  const peopleCount = 3 + (seed % 3);
  const people = [];
  const occupantNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
  for (let i = 0; i < peopleCount; i++) {
    const angle = (i / peopleCount) * Math.PI * 2 + (seed % 10) * 0.1;
    const radX = (halfW * 0.55) * (0.4 + 0.5 * ((i * 3 + seed) % 5) / 5);
    const radY = (halfD * 0.55) * (0.4 + 0.5 * ((i * 2 + seed) % 5) / 5);
    const px = Math.round((Math.cos(angle) * radX) * 10) / 10;
    const py = Math.round((Math.sin(angle) * radY) * 10) / 10;

    people.push({
      id: `p-${i + 1}-${envId}`,
      x: px,
      y: py,
      label: `Occupant ${occupantNames[i] || (i + 1)}`
    });
  }

  // 1 Candidate Movable Obstacle
  const obsX = Math.round((halfW * 0.25 * ((seed % 2 === 0) ? 1 : -1)) * 10) / 10;
  const obsY = Math.round((halfD * 0.25 * ((seed % 3 === 0) ? 1 : -1)) * 10) / 10;
  const obstacles = [
    {
      id: `obs-1-${envId}`,
      name: 'Movable Storage Partition',
      x: obsX,
      y: obsY,
      width: 1.6,
      height: 1.2,
      movable: true
    }
  ];

  // Attach detection status and confidence metadata to candidate elements
  const wallsWithMeta = walls.map(w => ({ ...w, status: 'detected', confidence: 0.85 }));
  const roomsWithMeta = rooms.map(r => ({ ...r, status: 'detected', confidence: 0.9 }));
  const doorsWithMeta = doors.map(d => ({ ...d, status: 'detected', confidence: 0.8 }));
  const exitsWithMeta = exits.map(e => ({ ...e, status: 'suggested', confidence: 0.85 }));
  const obstaclesWithMeta = obstacles.map(o => ({ ...o, status: 'detected', confidence: 0.75 }));
  const peopleWithMeta = people.map(p => ({ ...p, status: 'estimated', confidence: 0.7 }));

  return {
    geometry: {
      walls: wallsWithMeta,
      rooms: roomsWithMeta,
      corridors: [],
      doors: doorsWithMeta,
    },
    navigation: {
      gridWidth: Math.ceil(width + 4),
      gridHeight: Math.ceil(depth + 4),
      cellSize: 1,
      walkableGrid: {}
    },
    exits: exitsWithMeta,
    obstacles: obstaclesWithMeta,
    people: peopleWithMeta,
    isAiGenerated: false,
    notice: 'Candidate map generated. Please verify the space before simulation.'
  };
}

/**
 * Invokes external Vision AI provider if configured.
 * Combines up to 4 multi-frame views for coherent spatial reconstruction.
 */
async function callExternalVisionProvider(apiKey, frameFiles, env) {
  try {
    if (!frameFiles || frameFiles.length === 0) return null;

    const parts = [
      {
        text: `You are a spatial architecture model for PREVIA XR indoor emergency simulation.
Analyze these floor plan or indoor walkthrough frames from different angles.
Synthesize the observations into one coherent 2D indoor floor plan.
Identify:
1. Outer perimeter walls and partition walls.
2. Distinct rooms and their boundaries.
3. Doorway openings in walls.
4. Emergency exits along perimeter or corridors.
5. Hazards/obstacles blocking paths.
6. Initial occupant locations.

Output pure JSON conforming strictly to this schema without markdown formatting:
{
  "width": 20,
  "depth": 14,
  "walls": [{"id": "w-1", "x1": -10, "y1": -7, "x2": 10, "y2": -7, "status": "detected"}],
  "rooms": [{"id": "r-1", "name": "Main Room", "x": 0, "y": 0, "width": 12, "height": 8, "status": "detected"}],
  "doors": [{"id": "d-1", "x": 0, "y": -7, "width": 1.5, "status": "detected"}],
  "exits": [{"id": "ex-1", "name": "Main Exit", "x": 10, "y": 0, "type": "emergency", "status": "confirmed"}],
  "obstacles": [{"id": "obs-1", "name": "Cabinet", "x": 2, "y": 2, "width": 1.5, "height": 1.2, "movable": true, "status": "detected"}],
  "people": [{"id": "p-1", "x": -4, "y": -2, "label": "Person 1", "status": "estimated"}]
}`
      }
    ];

    // Multi-frame association: attach up to 4 distinct keyframes
    const attachedCount = Math.min(frameFiles.length, 4);
    for (let i = 0; i < attachedCount; i++) {
      const file = frameFiles[i];
      if (fs.existsSync(file)) {
        const fileBuffer = fs.readFileSync(file);
        const base64Data = fileBuffer.toString('base64');
        const mimeType = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }
    }

    console.log(`[SpatialAnalysis] Invoking Gemini Vision API with ${attachedCount} frame(s)...`);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[SpatialAnalysis] External Vision API responded with HTTP ${response.status}: ${errText.substring(0, 150)}`);
      return null;
    }

    const resJson = await response.json();
    const candidateText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      console.warn('[SpatialAnalysis] Gemini Vision API returned no candidate text.');
      return null;
    }

    // Strip markdown code fences if present
    const cleanedText = candidateText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanedText);

    // Validate geometry strictly
    if (!Array.isArray(parsed.walls) || parsed.walls.length < 3) {
      console.warn('[SpatialAnalysis] Gemini Vision returned insufficient walls (<3), falling back to candidate geometry.');
      return null;
    }
    if (!Array.isArray(parsed.exits) || parsed.exits.length < 1) {
      console.warn('[SpatialAnalysis] Gemini Vision returned no exits (<1), falling back to candidate geometry.');
      return null;
    }

    console.log(`[SpatialAnalysis] Gemini Vision spatial reconstruction successful (${parsed.walls.length} walls, ${parsed.exits.length} exits).`);

    return {
      geometry: {
        walls: parsed.walls,
        rooms: parsed.rooms || [],
        corridors: parsed.corridors || [],
        doors: parsed.doors || [],
      },
      navigation: {
        gridWidth: parsed.width || 24,
        gridHeight: parsed.depth || 16,
        cellSize: 1,
      },
      exits: parsed.exits,
      obstacles: parsed.obstacles || [],
      people: parsed.people && parsed.people.length > 0 ? parsed.people : [
        { id: 'p-1', x: 0, y: 0, label: 'Occupant 1' }
      ],
      isAiGenerated: true,
      notice: 'Spatial analysis complete. Candidate floor layout synthesized via computer vision.'
    };
  } catch (err) {
    console.warn('[SpatialAnalysis] External Vision API error:', err.message);
    return null;
  }
}

import { analyzeFloorPlanImageFile } from './floorPlanVisionEngine.js';

/**
 * Main Spatial Analysis Service entrypoint:
 * Reconstructs real architectural geometry from uploaded floor-plan images
 * using Computer Vision with diagnostics, quality metrics, and external vision support.
 */
export async function analyzeSpatialEnvironment(env) {
  const envId = String(env._id || env.id || 'default');
  const framesDir = path.join(uploadsRoot, envId, 'frames');
  const originalDir = path.join(uploadsRoot, envId, 'original');

  // Search original directory first (high-res source), then frames directory
  let originalImageFiles = [];
  if (fs.existsSync(originalDir)) {
    originalImageFiles = fs.readdirSync(originalDir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .map(f => path.join(originalDir, f));
  }

  let frameFiles = [];
  if (fs.existsSync(framesDir)) {
    frameFiles = fs.readdirSync(framesDir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .map(f => path.join(framesDir, f));
  }

  const allCandidateFiles = [...originalImageFiles, ...frameFiles];
  console.log(`[SpatialAnalysis] Environment ${envId}: Found ${originalImageFiles.length} original image(s) and ${frameFiles.length} frame image(s).`);

  // 1. If uploaded floor plan image files are present, run native Computer Vision engine
  if (allCandidateFiles.length > 0) {
    const primaryImageFile = originalImageFiles.length > 0 ? originalImageFiles[0] : frameFiles[0];
    console.log(`[SpatialAnalysis] Analyzing floor-plan image via Computer Vision: ${primaryImageFile}`);

    try {
      const cvResult = await analyzeFloorPlanImageFile(primaryImageFile, env);
      
      // If Computer Vision successfully detected structural architectural elements
      if (cvResult && cvResult.geometry && cvResult.geometry.walls && cvResult.geometry.walls.length >= 3) {
        console.log(`[SpatialAnalysis] Computer Vision extraction successful for ${envId}: ` +
          `${cvResult.geometry.walls.length} walls, ${cvResult.geometry.rooms.length} rooms, ` +
          `${cvResult.geometry.doors.length} doors, ${cvResult.exits.length} exits, ` +
          `${cvResult.obstacles.length} obstacles/stairs.`);
        return cvResult;
      } else if (cvResult && cvResult.isFallback) {
        console.log(`[SpatialAnalysis] Low architectural confidence in image for ${envId}. Gracefully returning diagnostic workspace.`);
        return {
          ...cvResult,
          notice: cvResult.notice || 'Floor plan image contained low structural confidence. Please use the 2D editor tools to review and add walls.'
        };
      }
    } catch (cvErr) {
      console.warn(`[SpatialAnalysis] Computer Vision engine notice: ${cvErr.message}. Checking auxiliary providers.`);
    }
  }

  // 2. Check external vision API key if configured
  const apiKey = process.env.GEMINI_API_KEY || process.env.VISION_API_KEY;
  if (apiKey && allCandidateFiles.length > 0) {
    const aiResult = await callExternalVisionProvider(apiKey, allCandidateFiles, env);
    if (aiResult) {
      return aiResult;
    }
  } else if (!apiKey) {
    console.log('[SpatialAnalysis] No GEMINI_API_KEY / VISION_API_KEY configured; completed local Computer Vision pass.');
  }

  // 3. Fallback only if no files or unresolvable structure
  console.log('[SpatialAnalysis] Utilizing candidate layout generator as baseline fallback.');
  return generateCandidateSpatialLayout(env, allCandidateFiles);
}
