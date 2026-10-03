import {
  Environment,
  WallSegment,
  ExitZone,
  ObstacleState,
  Agent,
  RoomZone,
} from '../types/simulationTypes';
import { PathfindingEngine } from './PathfindingEngine';

export interface ConvertedSimulationEnvironment {
  gridWidth: number;
  gridHeight: number;
  walls: WallSegment[];
  rooms: RoomZone[];
  exits: ExitZone[];
  obstacles: ObstacleState[];
  agents: Agent[];
  pathfinder: PathfindingEngine;
}

/**
 * Adapter that converts user-created 2D Environment geometry into
 * the exact spatial structures consumed by the existing A* PathfindingEngine
 * and 3D React Three Fiber scene.
 */
export function environmentToNavigationGraph(
  environment: Environment,
  resolution = 2
): ConvertedSimulationEnvironment {
  const gridWidth = environment.navigation?.gridWidth || 24;
  const gridHeight = environment.navigation?.gridHeight || 16;

  // 1. Convert 2D line walls into WallSegments for 3D and A* grid
  const walls: WallSegment[] = [];
  const rawWalls = environment.geometry?.walls || [];

  rawWalls.forEach((w, index) => {
    const dx = w.x2 - w.x1;
    const dz = w.y2 - w.y1;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.2) return;

    const midX = (w.x1 + w.x2) / 2;
    const midZ = (w.y1 + w.y2) / 2;

    // Check if nearly horizontal or vertical
    const isHorizontal = Math.abs(dz) < 0.35;
    const isVertical = Math.abs(dx) < 0.35;

    if (isHorizontal) {
      walls.push({
        x: midX,
        z: midZ,
        width: Math.max(0.6, Math.abs(dx)),
        depth: 0.4,
        label: `Wall H-${index + 1}`,
      });
    } else if (isVertical) {
      walls.push({
        x: midX,
        z: midZ,
        width: 0.4,
        depth: Math.max(0.6, Math.abs(dz)),
        label: `Wall V-${index + 1}`,
      });
    } else {
      // Diagonal wall: decompose into overlapping discrete segments
      const steps = Math.ceil(len * 2);
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        walls.push({
          x: w.x1 + dx * t,
          z: w.y1 + dz * t,
          width: 0.55,
          depth: 0.55,
          label: `Wall D-${index + 1}-${s}`,
        });
      }
    }
  });

  // 2. Convert Rooms
  const rooms: RoomZone[] = (environment.geometry?.rooms || []).map((r, i) => ({
    id: r.id || `room-${i}`,
    name: r.name || `Room ${i + 1}`,
    x: r.x,
    z: r.y,
    width: r.width,
    depth: r.height,
    color: '#1e293b',
  }));

  // 3. Convert Exits (Supports ANY custom name: Main Exit, North Fire Exit, etc.)
  const exits: ExitZone[] = (environment.exits || []).map((ex, i) => {
    const isPrimary = i === 0 || ex.type === 'emergency';
    const color = ex.type === 'emergency' ? '#10b981' : i === 1 ? '#38bdf8' : '#a855f7';
    return {
      id: ex.id || `exit-${i + 1}`,
      name: ex.name || `Exit ${i + 1}`,
      label: ex.name.toUpperCase(),
      position: [ex.x, 0, ex.y],
      color,
      isBlocked: false,
      isPrimary,
      capacity: ex.type === 'emergency' ? 'High Flow' : 'Standard Flow',
      type: ex.type || 'emergency',
    };
  });

  // 4. Convert Obstacles
  const obstacles: ObstacleState[] = (environment.obstacles || []).map((obs, i) => ({
    id: obs.id || `obs-${i + 1}`,
    name: obs.name || 'Hazard Obstacle',
    position: [obs.x, 0.4, obs.y],
    scale: [obs.width || 1.6, 1.2, obs.height || 1.2],
    isBlockingExitA: false,
    targetBlock: 'none',
    movable: obs.movable !== false,
  }));

  // 5. Initialize PathfindingEngine
  const pathfinder = new PathfindingEngine(gridWidth, gridHeight, resolution);
  pathfinder.bakeWalls(walls);
  pathfinder.updateObstacles(obstacles);

  // 6. Convert People & Calculate Initial A* Paths
  const agents: Agent[] = (environment.people || []).map((p, i) => {
    // Find closest exit
    let closestExit = exits[0];
    let minDist = Infinity;
    exits.forEach(ex => {
      const dist = Math.sqrt(Math.pow(ex.position[0] - p.x, 2) + Math.pow(ex.position[2] - p.y, 2));
      if (dist < minDist) {
        minDist = dist;
        closestExit = ex;
      }
    });

    const targetExitId = closestExit ? closestExit.id : 'exit-1';
    const exitPos = closestExit ? closestExit.position : [0, 0, 0];

    const initialPath = pathfinder.findPath(p.x, p.y, exitPos[0], exitPos[2]);

    const colors = ['#00f0ff', '#38bdf8', '#818cf8', '#a855f7', '#c084fc'];
    const agentColor = colors[i % colors.length];

    return {
      id: p.id || `agent-${i + 1}`,
      name: p.label || `Person ${i + 1}`,
      startPos: [p.x, 0.4, p.y],
      currentPos: [p.x, 0.4, p.y],
      targetExit: targetExitId,
      originalExit: targetExitId,
      path: initialPath,
      originalPath: initialPath,
      status: 'Moving',
      progress: 0,
      speed: 1.05 + (i % 3) * 0.1,
      color: agentColor,
    };
  });

  return {
    gridWidth,
    gridHeight,
    walls,
    rooms,
    exits,
    obstacles,
    agents,
    pathfinder,
  };
}
