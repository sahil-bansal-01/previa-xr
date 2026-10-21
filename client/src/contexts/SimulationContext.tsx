import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Agent,
  ExitZone,
  ObstacleState,
  WallSegment,
  RoomZone,
  ConsequenceResult,
  TimelinePhase,
  Scenario,
  Environment,
} from '../simulation/types/simulationTypes';
import { PathfindingEngine } from '../simulation/engine/PathfindingEngine';
import { ConsequenceAnalyzer } from '../simulation/engine/ConsequenceAnalyzer';
import { scenarioService } from '../services/scenarioService';
import { simulationService } from '../services/simulationService';
import { environmentService } from '../services/environmentService';
import { environmentToNavigationGraph } from '../simulation/engine/environmentAdapter';

interface SimulationContextType {
  scenario: Scenario | null;
  loading: boolean;
  walls: WallSegment[];
  rooms: RoomZone[];
  exits: ExitZone[];
  obstacle: ObstacleState;
  agents: Agent[];
  timelinePhase: TimelinePhase;
  isPlaying: boolean;
  playbackSpeed: number;
  simulationTime: number; // in seconds
  consequence: ConsequenceResult;
  isSimulating: boolean;
  cameraView: 'perspective' | 'topdown' | 'isometric';
  setCameraView: (view: 'perspective' | 'topdown' | 'isometric') => void;
  // Actions
  blockExitA: () => void;
  blockCorridor: () => void;
  clearObstacle: () => void;
  setObstaclePosition: (pos: [number, number, number]) => void;
  simulateFuture: () => Promise<void>;
  resetScenario: () => void;
  togglePlayPause: () => void;
  setPlaybackSpeed: (speed: number) => void;
  saveSimulationRun: () => Promise<{ success: boolean; id?: string }>;
  loadScenarioById: (id: string) => Promise<void>;
  // Environment Management (Upload Your Space)
  activeEnvironment: Environment | null;
  userEnvironments: Environment[];
  loadEnvironment: (envOrId: Environment | string) => Promise<void>;
  loadDemoEnvironment: () => void;
  refreshUserEnvironments: () => Promise<void>;
  blockExitById: (exitId: string) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// Initial baseline exits
const DEFAULT_EXITS: ExitZone[] = [
  {
    id: 'exit-main',
    name: 'East Exit',
    label: 'EAST EXIT',
    position: [10.0, 0, 0],
    walkableEntryCell: [8.8, 0, 0],
    color: '#16a34a',
    isBlocked: false,
    isPrimary: true,
    width: 2.4,
    capacity: 'High Flow',
    type: 'emergency',
  },
  {
    id: 'exit-secondary',
    name: 'West Exit',
    label: 'WEST EXIT',
    position: [-10.0, 0, 0],
    walkableEntryCell: [-8.8, 0, 0],
    color: '#2563eb',
    isBlocked: false,
    isPrimary: false,
    width: 2.4,
    capacity: 'Moderate Flow',
    type: 'emergency',
  },
  {
    id: 'exit-south',
    name: 'South Exit',
    label: 'SOUTH EXIT',
    position: [0, 0, 7.0],
    walkableEntryCell: [0, 0, 5.8],
    color: '#0d9488',
    isBlocked: false,
    isPrimary: false,
    width: 2.4,
    capacity: 'Secondary Exit',
    type: 'normal',
  },
];

// Initial baseline agents (Distributed across rooms and circulation corridors)
// Left-side occupants naturally choose WEST EXIT
// Right-side occupants naturally choose EAST EXIT
// Bottom corridor occupants naturally choose SOUTH EXIT
const DEFAULT_AGENTS: Agent[] = [
  { id: 'agent-1', name: 'Researcher Alpha (P1)', startPos: [-6.0, 0.4, -4.5], currentPos: [-6.0, 0.4, -4.5], targetExit: 'exit-secondary', originalExit: 'exit-secondary', baselineExit: 'exit-secondary', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.15, color: '#2563eb' },
  { id: 'agent-2', name: 'Student Beta (P2)', startPos: [-4.8, 0.4, -3.0], currentPos: [-4.8, 0.4, -3.0], targetExit: 'exit-secondary', originalExit: 'exit-secondary', baselineExit: 'exit-secondary', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.05, color: '#38bdf8' },
  { id: 'agent-3', name: 'Lab Tech Gamma (P3)', startPos: [6.0, 0.4, -4.5], currentPos: [6.0, 0.4, -4.5], targetExit: 'exit-main', originalExit: 'exit-main', baselineExit: 'exit-main', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.25, color: '#2563eb' },
  { id: 'agent-4', name: 'Staff Delta (P4)', startPos: [4.8, 0.4, -3.0], currentPos: [4.8, 0.4, -3.0], targetExit: 'exit-main', originalExit: 'exit-main', baselineExit: 'exit-main', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.0, color: '#38bdf8' },
  { id: 'agent-5', name: 'Professor Zeta (P5)', startPos: [7.5, 0.4, -4.0], currentPos: [7.5, 0.4, -4.0], targetExit: 'exit-main', originalExit: 'exit-main', baselineExit: 'exit-main', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 0.95, color: '#818cf8' },
  { id: 'agent-6', name: 'Student Epsilon (P6)', startPos: [6.5, 0.4, 0.0], currentPos: [6.5, 0.4, 0.0], targetExit: 'exit-main', originalExit: 'exit-main', baselineExit: 'exit-main', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.1, color: '#38bdf8' },
  { id: 'agent-7', name: 'Visitor Eta (P7)', startPos: [-6.0, 0.4, 4.5], currentPos: [-6.0, 0.4, 4.5], targetExit: 'exit-secondary', originalExit: 'exit-secondary', baselineExit: 'exit-secondary', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.1, color: '#818cf8' },
  { id: 'agent-8', name: 'Staff Theta (P8)', startPos: [-4.8, 0.4, 3.0], currentPos: [-4.8, 0.4, 3.0], targetExit: 'exit-secondary', originalExit: 'exit-secondary', baselineExit: 'exit-secondary', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.2, color: '#2563eb' },
  { id: 'agent-9', name: 'Student Iota (P9)', startPos: [6.0, 0.4, 4.5], currentPos: [6.0, 0.4, 4.5], targetExit: 'exit-main', originalExit: 'exit-main', baselineExit: 'exit-main', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.05, color: '#818cf8' },
  { id: 'agent-10', name: 'Research Fellow Kappa (P10)', startPos: [0.0, 0.4, 3.5], currentPos: [0.0, 0.4, 3.5], targetExit: 'exit-south', originalExit: 'exit-south', baselineExit: 'exit-south', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.15, color: '#2563eb' },
];

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [walls, setWalls] = useState<WallSegment[]>([]);
  const [rooms, setRooms] = useState<RoomZone[]>([]);
  const [exits, setExits] = useState<ExitZone[]>(DEFAULT_EXITS);
  const [cameraView, setCameraView] = useState<'perspective' | 'topdown' | 'isometric'>('perspective');

  // Obstacle state
  const [obstacle, setObstacle] = useState<ObstacleState>({
    id: 'obstacle-cart-1',
    name: 'Industrial Trolley / Hazard Debris',
    position: [0, 0.4, -6.0], // tucked in storage alcove by default
    scale: [1.6, 1.2, 1.2],
    isBlockingExitA: false,
    targetBlock: 'none',
  });

  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [timelinePhase, setTimelinePhase] = useState<TimelinePhase>('BEFORE');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [simulationTime, setSimulationTime] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // User-created environments state
  const [activeEnvironment, setActiveEnvironment] = useState<Environment | null>(null);
  const [userEnvironments, setUserEnvironments] = useState<Environment[]>([]);

  const [consequence, setConsequence] = useState<ConsequenceResult>({
    riskLevel: 'Low',
    blockedExits: [],
    affectedPeople: 0,
    reroutedPeople: 0,
    totalPeople: 10,
    congestionLevel: '—',
    congestionPercent: 0,
    estimatedDelay: 0,
    recommendedExit: '—',
    bottleneckLocation: 'None',
    evacuationRate: 100,
    whySentence: 'Run the simulation to see what changes.',
    timestamp: new Date().toLocaleTimeString(),
  });

  const pathfinderRef = useRef<PathfindingEngine>(new PathfindingEngine(24, 16, 2));

  // Architectural fallback campus scenario with real doorways and circulation
  const fallbackWalls: WallSegment[] = [
    // Outer perimeter walls with true doorway gaps for exits
    { x: 0, z: -7.0, width: 20.4, depth: 0.4, label: 'North Perimeter Wall' },
    { x: -5.85, z: 7.0, width: 8.7, depth: 0.4, label: 'South Perimeter West' },
    { x: 5.85, z: 7.0, width: 8.7, depth: 0.4, label: 'South Perimeter East' },
    // West perimeter with gap for West Exit [-1.5 to 1.5]
    { x: -10.0, z: -4.25, width: 0.4, depth: 5.5, label: 'West Perimeter North' },
    { x: -10.0, z: 4.25, width: 0.4, depth: 5.5, label: 'West Perimeter South' },
    // East perimeter with gap for East Exit [-1.5 to 1.5]
    { x: 10.0, z: -4.25, width: 0.4, depth: 5.5, label: 'East Perimeter North' },
    { x: 10.0, z: 4.25, width: 0.4, depth: 5.5, label: 'East Perimeter South' },

    // North dividing partition between Room A & Room B
    { x: 0, z: -4.3, width: 0.4, depth: 5.4, label: 'North Dividing Wall' },

    // Room A (North-West) South Wall with 2.4m door opening [-6.0 to -3.6]
    { x: -8.0, z: -1.6, width: 4.0, depth: 0.4, label: 'Room A South Wall West' },
    { x: -1.8, z: -1.6, width: 3.6, depth: 0.4, label: 'Room A South Wall East' },

    // Room B (North-East) South Wall with 2.4m door opening [3.6 to 6.0]
    { x: 1.8, z: -1.6, width: 3.6, depth: 0.4, label: 'Room B South Wall West' },
    { x: 8.0, z: -1.6, width: 4.0, depth: 0.4, label: 'Room B South Wall East' },

    // South Corridor dividing walls
    { x: -1.5, z: 4.3, width: 0.4, depth: 5.4, label: 'South Corridor West Wall' },
    { x: 1.5, z: 4.3, width: 0.4, depth: 5.4, label: 'South Corridor East Wall' },

    // Room C (South-West) North Wall with 2.4m door opening [-6.0 to -3.6]
    { x: -8.0, z: 1.6, width: 4.0, depth: 0.4, label: 'Room C North Wall West' },
    { x: -2.55, z: 1.6, width: 2.1, depth: 0.4, label: 'Room C North Wall East' },

    // Room D (South-East) North Wall with 2.4m door opening [3.6 to 6.0]
    { x: 2.55, z: 1.6, width: 2.1, depth: 0.4, label: 'Room D North Wall West' },
    { x: 8.0, z: 1.6, width: 4.0, depth: 0.4, label: 'Room D North Wall East' },
  ];

  const fallbackRooms: RoomZone[] = [
    { id: 'room-1', name: 'Lecture Hall (Room A)', x: -5.0, z: -4.3, width: 9.6, depth: 5.0, color: '#FFFFFF' },
    { id: 'room-2', name: 'Research Lab (Room B)', x: 5.0, z: -4.3, width: 9.6, depth: 5.0, color: '#FFFFFF' },
    { id: 'room-3', name: 'Faculty Commons (Room C)', x: -5.75, z: 4.3, width: 8.1, depth: 5.0, color: '#FFFFFF' },
    { id: 'room-4', name: 'Seminar Hall (Room D)', x: 5.75, z: 4.3, width: 8.1, depth: 5.0, color: '#FFFFFF' },
  ];

  // Initialize and load default scenario from backend
  const initScenario = useCallback(async () => {
    try {
      setLoading(true);
      const res = await scenarioService.getScenarios();
      if (res.data && res.data.length > 0) {
        const defaultScen = res.data[0];
        setScenario(defaultScen);
        applyScenarioState(defaultScen);
      } else {
        applyFallbackState();
      }
    } catch (err) {
      console.warn('[Simulation] Using fallback local campus scenario:', err);
      applyFallbackState();
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFallbackState = () => {
    setWalls(fallbackWalls);
    setRooms(fallbackRooms);
    setExits(DEFAULT_EXITS);
    pathfinderRef.current.bakeWalls(fallbackWalls);
    calculateInitialPaths(DEFAULT_AGENTS, DEFAULT_EXITS);
  };

  const applyScenarioState = (scen: Scenario) => {
    const env = scen.environmentState;
    const currentWalls = env.walls && env.walls.length > 0 ? env.walls : fallbackWalls;
    const currentRooms = env.rooms && env.rooms.length > 0 ? env.rooms : fallbackRooms;
    const currentExits = env.exits && env.exits.length > 0 ? env.exits : DEFAULT_EXITS;

    setWalls(currentWalls);
    setRooms(currentRooms);
    setExits(currentExits);
    pathfinderRef.current.bakeWalls(currentWalls);

    calculateInitialPaths(DEFAULT_AGENTS, currentExits);
  };

  // Independent per-agent initial A* route evaluation
  // Step 1: Calculate and store the BASELINE route/exit for every occupant while all exits are operational
  const calculateInitialPaths = (agentList: Agent[], exitList: ExitZone[]) => {
    const updated = agentList.map(agent => {
      let bestPath: [number, number, number][] = [];
      let bestExitId: string = agent.baselineExit || agent.originalExit || agent.targetExit || 'exit-main';
      let bestCost: number = Infinity;

      // If agent already has an assigned baselineExit, check route to that operational exit first
      const targetBase = exitList.find(e => e.id === bestExitId && !e.isBlocked);
      if (targetBase) {
        const res = pathfinderRef.current.findPathToExit(agent.startPos[0], agent.startPos[2], targetBase);
        if (res.reachable && res.path.length > 0) {
          bestPath = res.path;
          bestCost = res.cost;
        }
      }

      // If no valid path to targetBase yet, evaluate across all operational exits and choose lowest cost
      if (bestPath.length === 0) {
        const candidatePaths: Array<{ exit: ExitZone; path: [number, number, number][]; cost: number }> = [];
        for (const ex of exitList) {
          if (ex.isBlocked) continue;
          const res = pathfinderRef.current.findPathToExit(
            agent.startPos[0],
            agent.startPos[2],
            ex
          );
          if (res.reachable && res.path.length > 0) {
            candidatePaths.push({ exit: ex, path: res.path, cost: res.cost });
          }
        }

        if (candidatePaths.length > 0) {
          candidatePaths.sort((a, b) => a.cost - b.cost);
          const best = candidatePaths[0];
          bestPath = best.path;
          bestExitId = best.exit.id;
          bestCost = best.cost;
        } else {
          const fallbackExit = exitList[0];
          bestPath = pathfinderRef.current.findPath(
            agent.startPos[0],
            agent.startPos[2],
            fallbackExit?.position[0] || 0,
            fallbackExit?.position[2] || 0
          );
          bestExitId = fallbackExit?.id || 'exit-main';
          bestCost = PathfindingEngine.calculatePathLength(bestPath);
        }
      }

      return {
        ...agent,
        targetExit: bestExitId,
        originalExit: bestExitId,
        baselineExit: bestExitId,
        path: bestPath,
        originalPath: bestPath,
        baselinePath: bestPath,
        baselineCost: bestCost,
        futureExit: bestExitId,
        futurePath: bestPath,
        futureCost: bestCost,
        currentPos: agent.startPos,
        status: 'Moving' as const,
        progress: 0,
        isRerouted: false,
        isUnreachable: false,
        rerouteDistanceDelta: 0,
      };
    });

    setAgents(updated);
    if (typeof window !== 'undefined' && (window.location.search.includes('debug=nav') || (window as any).__PREVIA_DEBUG__)) {
      pathfinderRef.current.logAgentReachability(updated, exitList);
    }
  };

  const loadEnvironment = useCallback(async (envOrId: Environment | string) => {
    try {
      setLoading(true);
      let env: Environment;
      if (typeof envOrId === 'string') {
        env = await environmentService.getEnvironmentById(envOrId);
      } else {
        env = envOrId;
      }
      setActiveEnvironment(env);
      const envKey = env._id || env.id || 'custom';
      try {
        localStorage.setItem('previa_active_env_id', envKey);
      } catch (e) {}

      // Preserve all user environments independently in the list
      setUserEnvironments(prev => {
        const idx = prev.findIndex(e => (e._id === envKey || e.id === envKey));
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = env;
          return updated;
        }
        return [...prev, env];
      });

      const navData = environmentToNavigationGraph(env);

      setWalls(navData.walls);
      setRooms(navData.rooms);
      setExits(navData.exits);

      // Cleanly update or reset obstacle to prevent cross-environment state leaks
      if (navData.obstacles && navData.obstacles.length > 0) {
        setObstacle(navData.obstacles[0]);
      } else {
        setObstacle({
          id: `obstacle-cart-${envKey}`,
          name: 'Hazard Obstacle (Neutral Storage)',
          position: [0, 0.4, -6.0],
          scale: [1.6, 1.2, 1.2],
          isBlockingExitA: false,
          targetBlock: 'none',
        });
      }

      // Re-initialize A* pathfinder with custom space dimensions and walls
      pathfinderRef.current = new PathfindingEngine(navData.gridWidth, navData.gridHeight, 2);
      pathfinderRef.current.bakeWalls(navData.walls);

      // Calculate initial routes strictly for this environment's occupants
      calculateInitialPaths(navData.agents, navData.exits);
      setTimelinePhase('BEFORE');
      setIsPlaying(false);
      setSimulationTime(0);
      setConsequence({
        riskLevel: 'Low',
        blockedExits: [],
        affectedPeople: 0,
        reroutedPeople: 0,
        totalPeople: navData.agents.length,
        congestionLevel: '—',
        congestionPercent: 0,
        estimatedDelay: 0,
        recommendedExit: '—',
        bottleneckLocation: 'None',
        evacuationRate: 100,
        whySentence: 'Run the simulation to see what changes.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      console.error('[SimulationContext] Failed to load environment:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUserEnvironments = useCallback(async () => {
    try {
      const res = await environmentService.getEnvironments();
      setUserEnvironments(res);

      // Restore previous active environment if valid; otherwise demo complex
      const savedEnvId = localStorage.getItem('previa_active_env_id');
      if (savedEnvId && savedEnvId !== 'demo') {
        const found = res.find((e: Environment) => (e._id === savedEnvId || e.id === savedEnvId));
        if (found) {
          await loadEnvironment(found);
          return;
        }
      }
      initScenario();
    } catch (err) {
      console.warn('[SimulationContext] Failed to load user environments:', err);
      initScenario();
    }
  }, [initScenario, loadEnvironment]);

  const loadDemoEnvironment = useCallback(() => {
    try {
      localStorage.setItem('previa_active_env_id', 'demo');
    } catch (e) {}
    setActiveEnvironment(null);
    clearObstacle();
    setTimelinePhase('BEFORE');
    setIsPlaying(false);
    setSimulationTime(0);
    setConsequence({
      riskLevel: 'Low',
      blockedExits: [],
      affectedPeople: 0,
      reroutedPeople: 0,
      totalPeople: 10,
      congestionLevel: '—',
      congestionPercent: 0,
      estimatedDelay: 0,
      recommendedExit: '—',
      bottleneckLocation: 'None',
      evacuationRate: 100,
      whySentence: 'Run the simulation to see what changes.',
      timestamp: new Date().toLocaleTimeString(),
    });
    initScenario();
  }, [initScenario]);

  useEffect(() => {
    refreshUserEnvironments();
  }, [refreshUserEnvironments]);

  // Action: Block any Exit dynamically by ID
  const blockExitById = useCallback((exitId: string) => {
    const targetExit = exits.find(e => e.id === exitId);
    if (!targetExit) return;

    // Position obstacle close to the chosen exit portal threshold
    const pos: [number, number, number] = [
      targetExit.position[0] > 0 ? targetExit.position[0] - 1.8 : targetExit.position[0] < 0 ? targetExit.position[0] + 1.8 : 0,
      0.4,
      targetExit.position[2] > 0 ? targetExit.position[2] - 1.8 : targetExit.position[2] < 0 ? targetExit.position[2] + 1.8 : 0,
    ];

    setObstacle({
      id: `obstacle-block-${exitId}`,
      name: `Hazard Obstacle Blocking ${targetExit.name}`,
      position: pos,
      scale: [1.8, 1.2, 1.2],
      isBlockingExitA: exitId === 'exit-main' || exitId === 'exit-a',
      targetBlock: exitId,
    });

    setExits(prev =>
      prev.map(e => ({ ...e, isBlocked: e.id === exitId }))
    );

    setTimelinePhase('ACTION');
  }, [exits]);

  // Action: Block Main Exit
  const blockExitA = () => {
    const newPos: [number, number, number] = [8.4, 0.4, 0];
    setObstacle({
      id: 'obstacle-cart-1',
      name: 'Heavy Industrial Trolley / Partition Debris',
      position: newPos,
      scale: [1.8, 1.2, 1.4],
      isBlockingExitA: true,
      targetBlock: 'exit-main',
    });

    setExits(prev =>
      prev.map(e => ({ ...e, isBlocked: e.id === 'exit-main' || e.id === 'exit-a' }))
    );

    setTimelinePhase('ACTION');
  };

  // Action: Block Corridor (Blocks West circulation artery, keeping East corridor open)
  const blockCorridor = () => {
    const newPos: [number, number, number] = [-4.0, 0.4, 0];
    setObstacle({
      id: 'obstacle-cart-1',
      name: 'Hazard Barrier / West Corridor Block',
      position: newPos,
      scale: [1.8, 1.2, 1.4],
      isBlockingExitA: false,
      targetBlock: 'corridor',
    });

    setExits(prev => prev.map(e => ({ ...e, isBlocked: false })));

    setTimelinePhase('ACTION');
  };

  // Action: Clear Obstacle / Move to Neutral Storage Alcove
  const clearObstacle = () => {
    const newPos: [number, number, number] = [0, 0.4, -6.0]; // tucked away in alcove
    setObstacle({
      id: 'obstacle-cart-1',
      name: 'Trolley (Neutral Storage)',
      position: newPos,
      scale: [1.6, 1.2, 1.2],
      isBlockingExitA: false,
      targetBlock: 'none',
    });

    setExits(prev => prev.map(e => ({ ...e, isBlocked: false })));
    setTimelinePhase('BEFORE');
  };

  const setObstaclePosition = (pos: [number, number, number]) => {
    const nearMainExit = Math.hypot(pos[0] - 10.0, pos[2] - 0) < 2.8;
    const nearWestExit = Math.hypot(pos[0] - (-10.0), pos[2] - 0) < 2.8;
    const nearSouthExit = Math.hypot(pos[0] - 0, pos[2] - 7.0) < 2.8;

    let targetBlock = 'none';
    if (nearMainExit) targetBlock = 'exit-main';
    else if (nearWestExit) targetBlock = 'exit-secondary';
    else if (nearSouthExit) targetBlock = 'exit-south';

    setObstacle(prev => ({
      ...prev,
      position: pos,
      isBlockingExitA: nearMainExit,
      targetBlock,
    }));

    setExits(prev =>
      prev.map(e => {
        if (targetBlock === 'none') return { ...e, isBlocked: false };
        return { ...e, isBlocked: e.id === targetBlock || (targetBlock === 'exit-main' && e.id === 'exit-a') };
      })
    );

    setTimelinePhase('ACTION');
  };

  // Main Core Engine Interaction: SIMULATE FUTURE
  // PER-AGENT INDEPENDENT BASELINE-VS-FUTURE EVALUATION
  const simulateFuture = async () => {
    setIsSimulating(true);

    // 1. Update obstacle collisions in pathfinder
    pathfinderRef.current.updateObstacles([obstacle]);

    // 2. Determine affected exits
    const updatedExits = exits.map(e => {
      const isDirectlyBlocked =
        ((e.id === 'exit-main' || e.id === 'exit-a') && obstacle.isBlockingExitA) ||
        (obstacle.targetBlock === e.id) ||
        (obstacle.targetBlock !== 'none' && obstacle.targetBlock !== 'corridor' && Math.hypot(obstacle.position[0] - e.position[0], obstacle.position[2] - e.position[2]) < 2.5);
      return { ...e, isBlocked: isDirectlyBlocked };
    });
    setExits(updatedExits);

    const availableExits = updatedExits.filter(e => !e.isBlocked);

    // 3. For each occupant:
    //    - If their baseline exit remains operational AND their baseline route remains valid, keep their original route.
    //    - Only if their baseline route becomes invalid because of the blocked exit/corridor/obstacle, calculate alternative routes using the existing PathfindingEngine.
    // 4. For affected occupants, evaluate ALL currently operational exits.
    // 5. Choose the lowest-cost valid alternative.
    // 6. Mark an occupant as rerouted ONLY if their selected future route differs from their baseline route.
    // 7. Mark UNREACHABLE only if no operational exit has a valid A* path.
    const reroutedAgents = agents.map(agent => {
      const baseExitId = agent.baselineExit || agent.originalExit || agent.targetExit;
      const targetBaseExit = updatedExits.find(e => e.id === baseExitId);
      const isBaseExitOperational = targetBaseExit ? !targetBaseExit.isBlocked : false;

      // Check if baseline route is blocked by active obstacle / corridor blockage
      let isBaselineRouteBlocked = !isBaseExitOperational;
      if (!isBaselineRouteBlocked && agent.baselinePath && agent.baselinePath.length > 0) {
        if (obstacle && obstacle.position && obstacle.targetBlock !== 'none') {
          const [ox, , oz] = obstacle.position;
          const [sw, , sd] = obstacle.scale || [1.6, 1.2, 1.2];
          const halfW = sw / 2 + 0.35;
          const halfD = sd / 2 + 0.35;
          for (const wp of agent.baselinePath) {
            if (Math.abs(wp[0] - ox) < halfW && Math.abs(wp[2] - oz) < halfD) {
              isBaselineRouteBlocked = true;
              break;
            }
          }
        }
      }

      const baseCost = agent.baselineCost ?? PathfindingEngine.calculatePathLength(agent.baselinePath || agent.originalPath || []);

      // If their baseline exit remains operational AND their baseline route remains valid, keep their original route
      if (!isBaselineRouteBlocked && isBaseExitOperational) {
        return {
          ...agent,
          targetExit: baseExitId,
          futureExit: baseExitId,
          path: agent.baselinePath,
          futurePath: agent.baselinePath,
          futureCost: baseCost,
          currentPos: agent.startPos,
          progress: 0,
          status: 'Moving' as const,
          isRerouted: false,
          isUnreachable: false,
          rerouteDistanceDelta: 0,
          color: agent.color,
        };
      }

      // Only if their baseline route becomes invalid, evaluate ALL currently operational exits
      const candidatePaths: Array<{ exit: ExitZone; path: [number, number, number][]; cost: number }> = [];

      for (const ex of availableExits) {
        const res = pathfinderRef.current.findPathToExit(
          agent.startPos[0],
          agent.startPos[2],
          ex
        );
        if (res.reachable && res.path.length > 0) {
          candidatePaths.push({ exit: ex, path: res.path, cost: res.cost });
        }
      }

      if (candidatePaths.length > 0) {
        // Choose the lowest-cost valid alternative
        candidatePaths.sort((a, b) => a.cost - b.cost);
        const best = candidatePaths[0];

        const exitChanged = best.exit.id !== baseExitId;
        const detourDelta = Math.max(0, best.cost - baseCost);
        // Mark an occupant as rerouted ONLY if their selected future route differs from their baseline route
        const isRerouted = exitChanged || detourDelta > 0.5;

        return {
          ...agent,
          targetExit: best.exit.id,
          futureExit: best.exit.id,
          path: best.path,
          futurePath: best.path,
          futureCost: best.cost,
          currentPos: agent.startPos,
          progress: 0,
          status: isRerouted ? ('Rerouting' as const) : ('Moving' as const),
          isRerouted,
          isUnreachable: false,
          rerouteDistanceDelta: detourDelta,
          color: isRerouted ? '#f59e0b' : agent.color,
        };
      } else {
        // Mark UNREACHABLE only if no operational exit has a valid A* path
        return {
          ...agent,
          targetExit: baseExitId,
          futureExit: 'NONE',
          path: [],
          futurePath: [],
          futureCost: Infinity,
          currentPos: agent.startPos,
          progress: 0,
          status: 'Unreachable' as const,
          isRerouted: true,
          isUnreachable: true,
          rerouteDistanceDelta: 0,
          color: '#dc2626',
        };
      }
    });

    setAgents(reroutedAgents);

    // 8. Consequence metrics must be derived from this per-agent baseline-vs-future comparison
    const analysis = ConsequenceAnalyzer.analyze(
      reroutedAgents,
      updatedExits,
      [obstacle],
      pathfinderRef.current
    );
    setConsequence(analysis);

    // 5. Set timeline to AFTER and start playback
    setTimelinePhase('AFTER');
    setIsPlaying(true);
    setIsSimulating(false);
  };

  // Reset scenario back to original baseline (Section 9: Reset must only reset the current simulation)
  const resetScenario = () => {
    setIsPlaying(false);
    setSimulationTime(0);
    clearObstacle();
    if (activeEnvironment) {
      const navData = environmentToNavigationGraph(activeEnvironment);
      pathfinderRef.current.bakeWalls(navData.walls);
      calculateInitialPaths(navData.agents, navData.exits);
    } else {
      calculateInitialPaths(DEFAULT_AGENTS, DEFAULT_EXITS);
    }
    setTimelinePhase('BEFORE');
    setConsequence({
      riskLevel: 'Low',
      blockedExits: [],
      affectedPeople: 0,
      reroutedPeople: 0,
      totalPeople: activeEnvironment ? (activeEnvironment.people?.length || 10) : 10,
      congestionLevel: '—',
      congestionPercent: 0,
      estimatedDelay: 0,
      recommendedExit: '—',
      bottleneckLocation: 'None',
      evacuationRate: 100,
      whySentence: 'Run the simulation to see what changes.',
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const saveSimulationRun = async () => {
    try {
      const envId = activeEnvironment?._id || 'demo_campus';
      const runData = {
        scenarioId: envId,
        scenarioTitle: activeEnvironment
          ? `Uploaded Space: ${activeEnvironment.name}`
          : 'Demo Campus Complex',
        environmentId: envId,
        actionPerformed: obstacle.targetBlock !== 'none'
          ? `Hypothetical Action: Block ${obstacle.name}`
          : 'Hypothetical Action: Modify Spatial Obstacles',
        initialState: {
          blockedExits: [],
          occupants: agents.length,
        },
        finalState: {
          blockedExits: consequence.blockedExits,
          reroutedAgents: agents.filter(a => a.status === 'Rerouting').map(a => a.name),
        },
        blockedExits: consequence.blockedExits,
        affectedPeople: consequence.affectedPeople,
        congestionLevel: consequence.congestionLevel,
        estimatedDelay: consequence.estimatedDelay,
        recommendedExit: consequence.recommendedExit,
        riskLevel: consequence.riskLevel,
      };

      const res = await simulationService.saveSimulation(runData);
      return { success: true, id: res.data?._id || res.data?.id };
    } catch (err: any) {
      console.error('[SimulationContext] Failed to save run:', err);
      return { success: false };
    }
  };

  const loadScenarioById = async (id: string) => {
    try {
      setLoading(true);
      const res = await scenarioService.getScenarioById(id);
      if (res.data) {
        setScenario(res.data);
        applyScenarioState(res.data);
      }
    } catch (err) {
      console.error('[SimulationContext] Failed to load scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  // Continuous animation loop for agent progression along path
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSimulationTime(t => t + 0.1 * playbackSpeed);

      setAgents(prevAgents => {
        return prevAgents.map(agent => {
          if (agent.status === 'Unreachable' || agent.isUnreachable) {
            return agent;
          }

          if (agent.path.length < 2) {
            return { ...agent, status: 'Reached Exit' as const, color: '#10b981' };
          }

          const speed = agent.speed * 0.04 * playbackSpeed;
          let newProgress = agent.progress + speed;

          if (newProgress >= 1) {
            return {
              ...agent,
              progress: 1,
              status: 'Reached Exit' as const,
              currentPos: agent.path[agent.path.length - 1],
              color: '#10b981', // green for evacuated
            };
          }

          // Interpolate along waypoints
          const totalSegments = agent.path.length - 1;
          const currentSegmentIndex = Math.min(
            totalSegments - 1,
            Math.floor(newProgress * totalSegments)
          );
          const segmentT = (newProgress * totalSegments) - currentSegmentIndex;

          const p1 = agent.path[currentSegmentIndex];
          const p2 = agent.path[currentSegmentIndex + 1];

          if (!p1 || !p2) return agent;

          const currX = p1[0] + (p2[0] - p1[0]) * segmentT;
          const currZ = p1[2] + (p2[2] - p1[2]) * segmentT;
          const heading = Math.atan2(p2[0] - p1[0], p2[2] - p1[2]);

          // Status adjustment based on reroute and progress
          let currentStatus = agent.status;
          if (agent.status === 'Rerouting' && newProgress > 0.3) {
            currentStatus = 'Moving';
          }

          return {
            ...agent,
            progress: newProgress,
            currentPos: [currX, 0.4, currZ],
            status: currentStatus,
            heading,
          };
        });
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  return (
    <SimulationContext.Provider
      value={{
        scenario,
        loading,
        walls,
        rooms,
        exits,
        obstacle,
        agents,
        timelinePhase,
        isPlaying,
        playbackSpeed,
        simulationTime,
        consequence,
        isSimulating,
        cameraView,
        setCameraView,
        blockExitA,
        blockCorridor,
        clearObstacle,
        setObstaclePosition,
        simulateFuture,
        resetScenario,
        togglePlayPause,
        setPlaybackSpeed,
        saveSimulationRun,
        loadScenarioById,
        activeEnvironment,
        userEnvironments,
        loadEnvironment,
        loadDemoEnvironment,
        refreshUserEnvironments,
        blockExitById,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
