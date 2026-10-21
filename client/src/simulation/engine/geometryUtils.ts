import {
  MapWall,
  MapRoom,
  MapExit,
  MapObstacle,
  MapPerson,
  MapDoor,
} from '../types/simulationTypes';

export interface OpeningInterval {
  start: number; // distance along wall (meters)
  end: number;
  width: number;
  type: 'door' | 'exit';
  id?: string;
}

export interface ComputedDoorOrientation {
  wallAngle: number; // in radians
  jamb1: { x: number; y: number };
  jamb2: { x: number; y: number };
  hinge: { x: number; y: number };
  leafTip: { x: number; y: number };
  swingPathD: string;
  isOpen: boolean;
}

export interface GeometryValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Projects a point (px, py) onto a line segment (x1, y1) -> (x2, y2).
 * Returns projection distance t along segment (0 <= t <= 1), projected point,
 * and perpendicular distance from point to segment.
 */
export function projectPointToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { t: number; projX: number; projY: number; dist: number; wallLen: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  const wallLen = Math.sqrt(lenSq);

  if (lenSq === 0) {
    const dist = Math.hypot(px - x1, py - y1);
    return { t: 0, projX: x1, projY: y1, dist, wallLen: 0 };
  }

  const rawT = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  const t = Math.max(0, Math.min(1, rawT));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  const dist = Math.hypot(px - projX, py - projY);

  return { t, projX, projY, dist, wallLen };
}

/**
 * Slices a single wall segment into multiple solid subsegments by cutting out
 * any intersecting door or exit openings.
 */
export function segmentWallWithOpenings(
  wall: MapWall,
  openings: Array<{ x: number; y: number; width?: number; type?: 'door' | 'exit'; id?: string }>
): MapWall[] {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const wallLen = Math.sqrt(dx * dx + dy * dy);

  if (wallLen < 0.25) {
    return [];
  }

  const unitX = dx / wallLen;
  const unitY = dy / wallLen;

  // Identify all openings intersecting this wall within threshold distance
  const intervals: OpeningInterval[] = [];

  openings.forEach((op) => {
    const width = op.width || (op.type === 'exit' ? 2.0 : 1.5);
    const proj = projectPointToSegment(op.x, op.y, wall.x1, wall.y1, wall.x2, wall.y2);

    // If opening is close to this wall (within 0.85m)
    if (proj.dist < 0.85) {
      const centerDist = proj.t * wallLen;
      const start = Math.max(0, centerDist - width / 2);
      const end = Math.min(wallLen, centerDist + width / 2);

      if (end - start > 0.15) {
        intervals.push({
          start,
          end,
          width,
          type: op.type || 'door',
          id: op.id,
        });
      }
    }
  });

  if (intervals.length === 0) {
    return [wall];
  }

  // Sort intervals by start distance
  intervals.sort((a, b) => a.start - b.start);

  // Merge overlapping intervals
  const merged: OpeningInterval[] = [];
  let currInterval = { ...intervals[0] };

  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];
    if (next.start <= currInterval.end + 0.1) {
      currInterval.end = Math.max(currInterval.end, next.end);
      currInterval.width = currInterval.end - currInterval.start;
    } else {
      merged.push(currInterval);
      currInterval = { ...next };
    }
  }
  merged.push(currInterval);

  // Construct remaining solid wall segments between the opening intervals
  const segments: MapWall[] = [];
  let cursor = 0;
  const minSolidLen = 0.25; // minimum segment length to avoid micro-fragments

  merged.forEach((gap, idx) => {
    if (gap.start - cursor >= minSolidLen) {
      segments.push({
        id: `${wall.id}-seg-${idx}-a`,
        x1: Math.round((wall.x1 + unitX * cursor) * 100) / 100,
        y1: Math.round((wall.y1 + unitY * cursor) * 100) / 100,
        x2: Math.round((wall.x1 + unitX * gap.start) * 100) / 100,
        y2: Math.round((wall.y1 + unitY * gap.start) * 100) / 100,
      });
    }
    cursor = Math.max(cursor, gap.end);
  });

  // Final trailing solid segment after last opening
  if (wallLen - cursor >= minSolidLen) {
    segments.push({
      id: `${wall.id}-seg-last`,
      x1: Math.round((wall.x1 + unitX * cursor) * 100) / 100,
      y1: Math.round((wall.y1 + unitY * cursor) * 100) / 100,
      x2: wall.x2,
      y2: wall.y2,
    });
  }

  return segments;
}

/**
 * Segments all walls across an environment using all doors and exits as physical openings.
 * Eliminates duplicate walls and zero-length segments.
 */
export function segmentAllWalls(
  walls: MapWall[],
  doors: Array<{ x: number; y: number; width?: number; id?: string }> = [],
  exits: Array<{ x: number; y: number; width?: number; id?: string }> = []
): MapWall[] {
  const openings: Array<{ x: number; y: number; width?: number; type: 'door' | 'exit'; id?: string }> = [
    ...doors.map((d) => ({ x: d.x, y: d.y, width: d.width || 1.5, type: 'door' as const, id: d.id })),
    ...exits.map((e) => ({ x: e.x, y: e.y, width: e.width || 2.0, type: 'exit' as const, id: e.id })),
  ];

  const segmentedWalls: MapWall[] = [];

  walls.forEach((wall) => {
    const subsegs = segmentWallWithOpenings(wall, openings);
    subsegs.forEach((seg) => {
      // Check for duplicates
      const isDuplicate = segmentedWalls.some(
        (existing) =>
          (Math.hypot(existing.x1 - seg.x1, existing.y1 - seg.y1) < 0.1 &&
            Math.hypot(existing.x2 - seg.x2, existing.y2 - seg.y2) < 0.1) ||
          (Math.hypot(existing.x1 - seg.x2, existing.y1 - seg.y2) < 0.1 &&
            Math.hypot(existing.x2 - seg.x1, existing.y2 - seg.y1) < 0.1)
      );

      if (!isDuplicate) {
        segmentedWalls.push(seg);
      }
    });
  });

  return segmentedWalls;
}

/**
 * Computes door orientation, jambs, hinge position, door leaf, and swing arc
 * based on the angle and normal of the closest host wall.
 */
export function computeDoorGeometry(
  door: { x: number; y: number; width?: number },
  walls: MapWall[]
): ComputedDoorOrientation {
  const doorWidth = door.width || 1.5;

  let bestWall: MapWall | null = null;
  let minDistance = Infinity;
  let bestProj = { projX: door.x, projY: door.y, t: 0.5 };

  walls.forEach((w) => {
    const proj = projectPointToSegment(door.x, door.y, w.x1, w.y1, w.x2, w.y2);
    if (proj.dist < minDistance) {
      minDistance = proj.dist;
      bestWall = w;
      bestProj = proj;
    }
  });

  // Default horizontal if no wall nearby
  let wallAngle = 0;
  let dirX = 1;
  let dirY = 0;

  if (bestWall) {
    const dx = (bestWall as MapWall).x2 - (bestWall as MapWall).x1;
    const dy = (bestWall as MapWall).y2 - (bestWall as MapWall).y1;
    const len = Math.hypot(dx, dy);
    if (len > 0.01) {
      dirX = dx / len;
      dirY = dy / len;
      wallAngle = Math.atan2(dy, dx);
    }
  }

  // Normal vector perpendicular to wall
  const normX = -dirY;
  const normY = dirX;

  // Door center clamped to wall projection
  const cx = bestProj.projX;
  const cy = bestProj.projY;

  // Jamb endpoints along the wall
  const halfW = doorWidth / 2;
  const jamb1 = { x: cx - dirX * halfW, y: cy - dirY * halfW };
  const jamb2 = { x: cx + dirX * halfW, y: cy + dirY * halfW };

  // Hinge is at jamb1, swinging inward along normal
  const hinge = jamb1;

  // 60-degree swing arc leaf tip
  const swingAngle = Math.PI / 3; // 60 degrees open
  const leafDirX = dirX * Math.cos(swingAngle) + normX * Math.sin(swingAngle);
  const leafDirY = dirY * Math.cos(swingAngle) + normY * Math.sin(swingAngle);
  const leafTip = {
    x: hinge.x + leafDirX * doorWidth,
    y: hinge.y + leafDirY * doorWidth,
  };

  // SVG Arc from closed position (jamb2) to open position (leafTip)
  const sweepFlag = 1;
  const swingPathD = `M ${jamb2.x} ${jamb2.y} A ${doorWidth} ${doorWidth} 0 0 ${sweepFlag} ${leafTip.x} ${leafTip.y}`;

  return {
    wallAngle,
    jamb1,
    jamb2,
    hinge,
    leafTip,
    swingPathD,
    isOpen: true,
  };
}

/**
 * Computes collision-aware offsets for occupant labels to prevent labels
 * from colliding with room names, walls, or neighboring occupants.
 */
export function computeCollisionAwareLabelOffsets(
  people: MapPerson[],
  rooms: MapRoom[],
  walls: MapWall[]
): Map<string, { xOffset: number; yOffset: number; textAnchor: 'start' | 'middle' | 'end' }> {
  const result = new Map<string, { xOffset: number; yOffset: number; textAnchor: 'start' | 'middle' | 'end' }>();

  const candidates: Array<{ dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }> = [
    { dx: 0, dy: 14, anchor: 'middle' }, // bottom
    { dx: 0, dy: -12, anchor: 'middle' }, // top
    { dx: 14, dy: 4, anchor: 'start' }, // right
    { dx: -14, dy: 4, anchor: 'end' }, // left
    { dx: 10, dy: 12, anchor: 'start' }, // bottom-right
    { dx: -10, dy: 12, anchor: 'end' }, // bottom-left
  ];

  people.forEach((person, idx) => {
    let bestCandidate = candidates[0];
    let bestScore = -Infinity;

    candidates.forEach((cand) => {
      let score = 100;
      const testX = person.x + cand.dx / 30; // 30 px/meter scale
      const testY = person.y + cand.dy / 30;

      // 1. Distance to other occupants
      people.forEach((other, otherIdx) => {
        if (idx !== otherIdx) {
          const d = Math.hypot(testX - other.x, testY - other.y);
          if (d < 1.0) score -= (1.0 - d) * 120;
        }
      });

      // 2. Distance to room center names
      rooms.forEach((r) => {
        const d = Math.hypot(testX - r.x, testY - r.y);
        if (d < 1.5) score -= (1.5 - d) * 80;
      });

      // 3. Distance to nearby walls
      walls.forEach((w) => {
        const proj = projectPointToSegment(testX, testY, w.x1, w.y1, w.x2, w.y2);
        if (proj.dist < 0.45) score -= (0.45 - proj.dist) * 150;
      });

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = cand;
      }
    });

    result.set(person.id, {
      xOffset: bestCandidate.dx,
      yOffset: bestCandidate.dy,
      textAnchor: bestCandidate.anchor,
    });
  });

  return result;
}

/**
 * Validates floor plan geometry quality, connectivity, and simulation readiness.
 */
export function validateFloorPlanGeometry(
  walls: MapWall[],
  rooms: MapRoom[],
  doors: any[] = [],
  exits: MapExit[] = [],
  obstacles: MapObstacle[] = [],
  people: MapPerson[] = []
): GeometryValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // 1. Exit checks
  if (exits.length === 0) {
    errors.push('No exits defined. Add at least one emergency exit before confirming.');
  } else {
    exits.forEach((ex, i) => {
      // Check if exit is excessively far from all walls
      let minWallDist = Infinity;
      walls.forEach((w) => {
        const proj = projectPointToSegment(ex.x, ex.y, w.x1, w.y1, w.x2, w.y2);
        if (proj.dist < minWallDist) minWallDist = proj.dist;
      });

      if (walls.length > 0 && minWallDist > 3.0) {
        warnings.push(`Exit "${ex.name || `Exit ${i + 1}`}" is located far from building perimeter walls.`);
      }
    });
  }

  // 2. Boundary presence
  if (walls.length === 0 && rooms.length === 0) {
    errors.push('No walls or rooms defined. Draw walls or add rooms to define the space boundary.');
  }

  // 3. Occupant checks
  if (people.length === 0) {
    errors.push('No occupants added. Place at least one person to run the evacuation simulation.');
  } else {
    people.forEach((p, i) => {
      const label = p.label || `Person ${i + 1}`;
      // Check if occupant is inside a wall
      walls.forEach((w) => {
        const proj = projectPointToSegment(p.x, p.y, w.x1, w.y1, w.x2, w.y2);
        if (proj.dist < 0.35) {
          warnings.push(`Occupant "${label}" is positioned too close to or inside a wall.`);
        }
      });

      // Check if occupant is inside an obstacle
      obstacles.forEach((obs) => {
        const halfW = (obs.width || 1.6) / 2;
        const halfH = (obs.height || 1.2) / 2;
        if (
          p.x >= obs.x - halfW &&
          p.x <= obs.x + halfW &&
          p.y >= obs.y - halfH &&
          p.y <= obs.y + halfH
        ) {
          warnings.push(`Occupant "${label}" is positioned directly inside obstacle "${obs.name}".`);
        }
      });
    });
  }

  // 4. Door checks
  doors.forEach((d, i) => {
    let minWallDist = Infinity;
    walls.forEach((w) => {
      const proj = projectPointToSegment(d.x, d.y, w.x1, w.y1, w.x2, w.y2);
      if (proj.dist < minWallDist) minWallDist = proj.dist;
    });

    if (walls.length > 0 && minWallDist > 1.5) {
      warnings.push(`Door #${i + 1} is not on a wall. Doors should be placed on a wall to create an opening.`);
    }
  });

  // 5. Room checks
  rooms.forEach((r, i) => {
    if (r.width < 1.0 || r.height < 1.0) {
      warnings.push(`Room "${r.name || `Room ${i + 1}`}" has very small dimensions (${r.width}m x ${r.height}m).`);
    }
  });

  // 6. Duplicate walls check
  for (let i = 0; i < walls.length; i++) {
    for (let j = i + 1; j < walls.length; j++) {
      const w1 = walls[i];
      const w2 = walls[j];
      const match1 = Math.hypot(w1.x1 - w2.x1, w1.y1 - w2.y1) < 0.1 && Math.hypot(w1.x2 - w2.x2, w1.y2 - w2.y2) < 0.1;
      const match2 = Math.hypot(w1.x1 - w2.x2, w1.y1 - w2.y2) < 0.1 && Math.hypot(w1.x2 - w2.x1, w1.y2 - w2.y1) < 0.1;
      if (match1 || match2) {
        suggestions.push(`Duplicate wall detected between (${w1.x1}, ${w1.y1}) and (${w1.x2}, ${w1.y2}).`);
      }
    }
  }

  if (warnings.length === 0 && errors.length === 0) {
    suggestions.push('Floor plan structure is clean. Perimeter and openings are aligned for simulation.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}
