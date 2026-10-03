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
  targetBlock: 'exit-a' | 'corridor' | 'none';
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
