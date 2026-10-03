import { WallSegment, ObstacleState } from '../types/simulationTypes';

export interface GridNode {
  x: number;
  z: number;
  walkable: boolean;
  g: number;
  h: number;
  f: number;
  parent: GridNode | null;
}

export class PathfindingEngine {
  private width: number;
  private depth: number;
  private resolution: number; // cells per unit (e.g. 2 = 0.5 unit per cell)
  private originX: number;
  private originZ: number;
  private cols: number;
  private rows: number;
  private staticGrid: boolean[][]; // true = walkable
  private currentGrid: boolean[][];

  constructor(width = 24, depth = 16, resolution = 2) {
    this.width = width;
    this.depth = depth;
    this.resolution = resolution;
    this.originX = -width / 2;
    this.originZ = -depth / 2;
    this.cols = Math.round(width * resolution);
    this.rows = Math.round(depth * resolution);

    this.staticGrid = [];
    this.currentGrid = [];
    this.initGrid();
  }

  private initGrid() {
    this.staticGrid = Array.from({ length: this.cols }, () =>
      Array.from({ length: this.rows }, () => true)
    );
    this.currentGrid = Array.from({ length: this.cols }, () =>
      Array.from({ length: this.rows }, () => true)
    );
  }

  // Convert 3D world coord to grid indices
  public worldToGrid(worldX: number, worldZ: number): { col: number; row: number } {
    const col = Math.round((worldX - this.originX) * this.resolution);
    const row = Math.round((worldZ - this.originZ) * this.resolution);
    return {
      col: Math.max(0, Math.min(this.cols - 1, col)),
      row: Math.max(0, Math.min(this.rows - 1, row)),
    };
  }

  // Convert grid indices to 3D world coord
  public gridToWorld(col: number, row: number): { x: number; z: number } {
    return {
      x: this.originX + col / this.resolution,
      z: this.originZ + row / this.resolution,
    };
  }

  // Bake static walls into the grid
  public bakeWalls(walls: WallSegment[]) {
    // Reset static grid to walkable
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        this.staticGrid[c][r] = true;
      }
    }

    const padding = 0.25; // buffer for agent radius

    for (const wall of walls) {
      const minX = wall.x - wall.width / 2 - padding;
      const maxX = wall.x + wall.width / 2 + padding;
      const minZ = wall.z - wall.depth / 2 - padding;
      const maxZ = wall.z + wall.depth / 2 + padding;

      const minCell = this.worldToGrid(minX, minZ);
      const maxCell = this.worldToGrid(maxX, maxZ);

      for (let c = minCell.col; c <= maxCell.col; c++) {
        for (let r = minCell.row; r <= maxCell.row; r++) {
          if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
            this.staticGrid[c][r] = false;
          }
        }
      }
    }

    this.syncCurrentGrid();
  }

  // Update dynamic obstacles (e.g. trolley blocking Exit A or corridor)
  public updateObstacles(obstacles: ObstacleState[]) {
    this.syncCurrentGrid();

    for (const obs of obstacles) {
      if (!obs.position) continue;
      const [ox, , oz] = obs.position;
      const [sw, , sd] = obs.scale || [1.6, 1.2, 1.2];
      const padding = 0.2;

      const minX = ox - sw / 2 - padding;
      const maxX = ox + sw / 2 + padding;
      const minZ = oz - sd / 2 - padding;
      const maxZ = oz + sd / 2 + padding;

      const minCell = this.worldToGrid(minX, minZ);
      const maxCell = this.worldToGrid(maxX, maxZ);

      for (let c = minCell.col; c <= maxCell.col; c++) {
        for (let r = minCell.row; r <= maxCell.row; r++) {
          if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
            this.currentGrid[c][r] = false;
          }
        }
      }
    }
  }

  private syncCurrentGrid() {
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        this.currentGrid[c][r] = this.staticGrid[c][r];
      }
    }
  }

  // A* pathfinding algorithm
  public findPath(
    startX: number,
    startZ: number,
    targetX: number,
    targetZ: number
  ): [number, number, number][] {
    const start = this.worldToGrid(startX, startZ);
    const target = this.worldToGrid(targetX, targetZ);

    // If start is blocked, find closest free cell
    let startCol = start.col;
    let startRow = start.row;
    if (!this.currentGrid[startCol][startRow]) {
      const free = this.findNearestWalkable(startCol, startRow);
      if (free) {
        startCol = free.col;
        startRow = free.row;
      }
    }

    // If target is blocked (e.g. exit blocked), target closest free cell
    let targetCol = target.col;
    let targetRow = target.row;
    if (!this.currentGrid[targetCol][targetRow]) {
      const free = this.findNearestWalkable(targetCol, targetRow);
      if (free) {
        targetCol = free.col;
        targetRow = free.row;
      }
    }

    const openList: GridNode[] = [];
    const closedSet = new Set<string>();
    const nodeMap = new Map<string, GridNode>();

    const startNode: GridNode = {
      x: startCol,
      z: startRow,
      walkable: true,
      g: 0,
      h: this.heuristic(startCol, startRow, targetCol, targetRow),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;

    openList.push(startNode);
    nodeMap.set(`${startCol},${startRow}`, startNode);

    // 8-directional neighbors (orthogonal + diagonals)
    const dirs = [
      { dc: 1, dr: 0, cost: 1.0 },
      { dc: -1, dr: 0, cost: 1.0 },
      { dc: 0, dr: 1, cost: 1.0 },
      { dc: 0, dr: -1, cost: 1.0 },
      { dc: 1, dr: 1, cost: 1.414 },
      { dc: -1, dr: 1, cost: 1.414 },
      { dc: 1, dr: -1, cost: 1.414 },
      { dc: -1, dr: -1, cost: 1.414 },
    ];

    let maxSteps = 1500;
    let closestNode = startNode;

    while (openList.length > 0 && maxSteps-- > 0) {
      // Pick node with lowest f
      let lowestIdx = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[lowestIdx].f) {
          lowestIdx = i;
        }
      }
      const current = openList.splice(lowestIdx, 1)[0];
      const currentKey = `${current.x},${current.z}`;
      closedSet.add(currentKey);

      if (current.h < closestNode.h) {
        closestNode = current;
      }

      // Check if reached destination
      if (current.x === targetCol && current.z === targetRow) {
        return this.reconstructPath(current, startX, startZ, targetX, targetZ);
      }

      for (const dir of dirs) {
        const nextC = current.x + dir.dc;
        const nextR = current.z + dir.dr;
        const key = `${nextC},${nextR}`;

        if (nextC < 0 || nextC >= this.cols || nextR < 0 || nextR >= this.rows) continue;
        if (!this.currentGrid[nextC][nextR] || closedSet.has(key)) continue;

        // Diagonal corner cutting check
        if (dir.dc !== 0 && dir.dr !== 0) {
          if (!this.currentGrid[current.x + dir.dc][current.z] || !this.currentGrid[current.x][current.z + dir.dr]) {
            continue;
          }
        }

        const tentativeG = current.g + dir.cost;
        let neighbor = nodeMap.get(key);

        if (!neighbor) {
          const h = this.heuristic(nextC, nextR, targetCol, targetRow);
          neighbor = {
            x: nextC,
            z: nextR,
            walkable: true,
            g: tentativeG,
            h,
            f: tentativeG + h,
            parent: current,
          };
          nodeMap.set(key, neighbor);
          openList.push(neighbor);
        } else if (tentativeG < neighbor.g) {
          neighbor.g = tentativeG;
          neighbor.f = tentativeG + neighbor.h;
          neighbor.parent = current;
        }
      }
    }

    // If exact target unreachable, return path to closest reachable node
    return this.reconstructPath(closestNode, startX, startZ, targetX, targetZ);
  }

  private heuristic(c1: number, r1: number, c2: number, r2: number): number {
    const dx = Math.abs(c1 - c2);
    const dz = Math.abs(r1 - r2);
    return Math.sqrt(dx * dx + dz * dz);
  }

  private findNearestWalkable(col: number, row: number): { col: number; row: number } | null {
    for (let radius = 1; radius < 10; radius++) {
      for (let dc = -radius; dc <= radius; dc++) {
        for (let dr = -radius; dr <= radius; dr++) {
          const c = col + dc;
          const r = row + dr;
          if (c >= 0 && c < this.cols && r >= 0 && r < this.rows && this.currentGrid[c][r]) {
            return { col: c, row: r };
          }
        }
      }
    }
    return null;
  }

  private reconstructPath(
    endNode: GridNode,
    startX: number,
    startZ: number,
    targetX: number,
    targetZ: number
  ): [number, number, number][] {
    const rawWaypoints: [number, number, number][] = [];
    let curr: GridNode | null = endNode;

    while (curr) {
      const world = this.gridToWorld(curr.x, curr.z);
      rawWaypoints.push([world.x, 0.4, world.z]);
      curr = curr.parent;
    }

    rawWaypoints.reverse();

    // Ensure start and target are clamped nicely
    if (rawWaypoints.length > 0) {
      rawWaypoints[0] = [startX, 0.4, startZ];
      rawWaypoints[rawWaypoints.length - 1] = [targetX, 0.4, targetZ];
    }

    // Path smoothing to remove redundant zigzag steps
    return this.smoothWaypoints(rawWaypoints);
  }

  private smoothWaypoints(points: [number, number, number][]): [number, number, number][] {
    if (points.length <= 2) return points;
    const smoothed: [number, number, number][] = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
      const prev = smoothed[smoothed.length - 1];
      const next = points[i + 1];

      // Check if direct line between prev and next is clear of obstacles
      if (this.isLineWalkable(prev[0], prev[2], next[0], next[2])) {
        continue; // Skip middle point
      }
      smoothed.push(points[i]);
    }

    smoothed.push(points[points.length - 1]);
    return smoothed;
  }

  public isLineWalkable(x1: number, z1: number, x2: number, z2: number): boolean {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const steps = Math.ceil(dist * this.resolution * 2);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + dx * t;
      const z = z1 + dz * t;
      const cell = this.worldToGrid(x, z);
      if (!this.currentGrid[cell.col][cell.row]) {
        return false;
      }
    }
    return true;
  }

  // Calculate length of 3D path
  public static calculatePathLength(path: [number, number, number][]): number {
    let length = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];
      const dx = p2[0] - p1[0];
      const dz = p2[2] - p1[2];
      length += Math.sqrt(dx * dx + dz * dz);
    }
    return length;
  }
}
