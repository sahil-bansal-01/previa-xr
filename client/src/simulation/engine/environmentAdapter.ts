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
    const color = ex.type === 'emergency' ? '#16a34a' : '#2563eb';
    // Compute walkable interior entry threshold: 1.2m inward towards room center
    const dirX = ex.x !== 0 ? -Math.sign(ex.x) : 0;
    const dirY = ex.y !== 0 ? -Math.sign(ex.y) : 0;
    const entryX = ex.x + dirX * 1.2;
    const entryY = ex.y + dirY * 1.2;

    return {
      id: ex.id || `exit-${i + 1}`,
      name: ex.name || `Exit ${i + 1}`,
      label: ex.name ? ex.name.toUpperCase() : `EXIT ${i + 1}`,
      position: [ex.x, 0, ex.y],
      walkableEntryCell: [entryX, 0, entryY],
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

  // 6. Convert People & Calculate Initial A* Paths (Independent per-agent evaluation)
  const agents: Agent[] = (environment.people || []).map((p, i) => {
    const candidatePaths: Array<{ exit: ExitZone; path: [number, number, number][]; cost: number }> = [];

    exits.forEach(ex => {
      const res = pathfinder.findPathToExit(p.x, p.y, ex);
      if (res.reachable && res.path.length > 0) {
        candidatePaths.push({ exit: ex, path: res.path, cost: res.cost });
      }
    });

    let chosenExit = exits[0];
    let chosenPath: [number, number, number][] = [];
    let chosenCost = 0;

    if (candidatePaths.length > 0) {
      candidatePaths.sort((a, b) => a.cost - b.cost);
      chosenExit = candidatePaths[0].exit;
      chosenPath = candidatePaths[0].path;
      chosenCost = candidatePaths[0].cost;
    } else if (exits.length > 0) {
      chosenExit = exits[0];
      chosenPath = pathfinder.findPath(p.x, p.y, chosenExit.position[0], chosenExit.position[2]);
      chosenCost = PathfindingEngine.calculatePathLength(chosenPath);
    }

    const colors = ['#00f0ff', '#38bdf8', '#818cf8', '#a855f7', '#c084fc'];
    const agentColor = colors[i % colors.length];

    return {
      id: p.id || `agent-${i + 1}`,
      name: p.label || `Person ${i + 1}`,
      startPos: [p.x, 0.4, p.y],
      currentPos: [p.x, 0.4, p.y],
      targetExit: chosenExit ? chosenExit.id : 'exit-1',
      originalExit: chosenExit ? chosenExit.id : 'exit-1',
      baselineExit: chosenExit ? chosenExit.id : 'exit-1',
      path: chosenPath,
      originalPath: chosenPath,
      baselinePath: chosenPath,
      baselineCost: chosenCost,
      status: 'Moving',
      progress: 0,
      speed: 1.05 + (i % 3) * 0.1,
      color: agentColor,
      isRerouted: false,
      isUnreachable: false,
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
