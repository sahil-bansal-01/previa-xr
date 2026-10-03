export type AgentStatus = 'Moving' | 'Rerouting' | 'Delayed' | 'Reached Exit';

export interface Agent {
  id: string;
  name: string;
  startPos: [number, number, number];
  currentPos: [number, number, number];
  targetExit: string;
  originalExit: string;
  path: [number, number, number][];
  originalPath: [number, number, number][];
  status: AgentStatus;
  progress: number;
  speed: number;
  color: string;
  rerouteDistanceDelta?: number;
}

export interface ExitZone {
  id: string;
  name: string;
  label: string;
  position: [number, number, number];
  color: string;
  isBlocked: boolean;
  isPrimary: boolean;
  width?: number;
  capacity: string;
  type?: 'emergency' | 'normal';
}

export interface WallSegment {
  x: number;
  z: number;
  width: number;
  depth: number;
  label?: string;
}

export interface RoomZone {
  id: string;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  color: string;
}

export interface ObstacleState {
  id: string;
  name: string;
  position: [number, number, number];
  scale: [number, number, number];
  isBlockingExitA: boolean;
  targetBlock: string;
  movable?: boolean;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ConsequenceResult {
  riskLevel: RiskLevel;
  blockedExits: string[];
  affectedPeople: number;
  totalPeople: number;
  congestionLevel: string;
  congestionPercent: number;
  estimatedDelay: number; // in seconds
  recommendedExit: string;
  bottleneckLocation: string;
  evacuationRate: number; // percentage completed
  timestamp: string;
  scenarioTitle?: string;
  actionSummary?: string;
}

export type TimelinePhase = 'BEFORE' | 'ACTION' | 'AFTER';

export interface Scenario {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  environmentType: string;
  environmentState: {
    gridWidth: number;
    gridHeight: number;
    cellSize: number;
    rooms?: RoomZone[];
    walls: WallSegment[];
    exits: ExitZone[];
    initialObstacles: ObstacleState[];
    initialAgents: any[];
  };
  actions: any[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SimulationRun {
  _id?: string;
  id?: string;
  scenarioId: string;
  environmentId?: string | null;
  scenarioTitle: string;
  actionPerformed: string;
  initialState: any;
  finalState: any;
  blockedExits: string[];
  affectedPeople: number;
  congestionLevel: string;
  estimatedDelay: number;
  recommendedExit: string;
  riskLevel: RiskLevel;
  simulationTimestamp: string;
  userId?: string;
}

// User Space Environment Data Models (Phase 3)
export interface MapWall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface MapRoom {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MapCorridor {
  id: string;
  points: Array<[number, number]>;
}

export interface MapDoor {
  id: string;
  x: number;
  y: number;
  width: number;
  connectedAreas?: string[];
}

export interface MapExit {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'emergency' | 'normal';
}

export interface MapObstacle {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  movable: boolean;
}

export interface MapPerson {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface Environment {
  _id?: string;
  id?: string;
  userId?: string;
  name: string;
  sourceType: 'video' | 'images' | 'demo';
  sourceFiles: Array<{
    originalName: string;
    filename: string;
    path: string;
    size: number;
    mimetype: string;
    isImage?: boolean;
    isVideo?: boolean;
  }>;
  analysisStatus: 'pending' | 'processing' | 'analyzed' | 'confirmed';
  geometry: {
    walls: MapWall[];
    rooms: MapRoom[];
    corridors: MapCorridor[];
    doors: MapDoor[];
  };
  navigation: {
    gridWidth: number;
    gridHeight: number;
    cellSize: number;
    walkableGrid?: any;
  };
  exits: MapExit[];
  obstacles: MapObstacle[];
  people: MapPerson[];
  metadata?: {
    frameCount?: number;
    duration?: number;
    description?: string;
    analysisNotice?: string;
    hasExternalVision?: boolean;
    analyzedAt?: string;
    extractedFrames?: Array<{
      index: number;
      timestamp: number;
      imageData: string;
    }>;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
}
