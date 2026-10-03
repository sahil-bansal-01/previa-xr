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
} from '../simulation/types/simulationTypes';
import { PathfindingEngine } from '../simulation/engine/PathfindingEngine';
import { ConsequenceAnalyzer } from '../simulation/engine/ConsequenceAnalyzer';
import { scenarioService } from '../services/scenarioService';
import { simulationService } from '../services/simulationService';

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
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// Initial baseline exits
const DEFAULT_EXITS: ExitZone[] = [
  {
    id: 'exit-a',
    name: 'Emergency Exit A',
    label: 'EXIT A (North Wing)',
    position: [11.2, 0, -5.5],
    color: '#10b981',
    isBlocked: false,
    isPrimary: true,
    capacity: 'High Flow',
  },
  {
    id: 'exit-b',
    name: 'Emergency Exit B',
    label: 'EXIT B (West Concourse)',
    position: [-11.2, 0, 5.5],
    color: '#38bdf8',
    isBlocked: false,
    isPrimary: false,
    capacity: 'Moderate Flow',
  },
  {
    id: 'exit-c',
    name: 'Emergency Exit C',
    label: 'EXIT C (South Corridor)',
    position: [0, 0, 7.5],
    color: '#a855f7',
    isBlocked: false,
    isPrimary: false,
    capacity: 'Secondary Exit',
  },
];

// Initial baseline agents
const DEFAULT_AGENTS: Agent[] = [
  { id: 'agent-1', name: 'Researcher Alpha', startPos: [-8, 0.4, -5], currentPos: [-8, 0.4, -5], targetExit: 'exit-a', originalExit: 'exit-a', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.15, color: '#00f0ff' },
  { id: 'agent-2', name: 'Student Beta', startPos: [-9, 0.4, -3], currentPos: [-9, 0.4, -3], targetExit: 'exit-a', originalExit: 'exit-a', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.05, color: '#38bdf8' },
  { id: 'agent-3', name: 'Lab Tech Gamma', startPos: [3, 0.4, -4], currentPos: [3, 0.4, -4], targetExit: 'exit-a', originalExit: 'exit-a', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.25, color: '#818cf8' },
  { id: 'agent-4', name: 'Staff Delta', startPos: [4, 0.4, -6], currentPos: [4, 0.4, -6], targetExit: 'exit-a', originalExit: 'exit-a', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.0, color: '#00f0ff' },
  { id: 'agent-5', name: 'Student Epsilon', startPos: [1, 0.4, -2], currentPos: [1, 0.4, -2], targetExit: 'exit-a', originalExit: 'exit-a', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.1, color: '#38bdf8' },
  { id: 'agent-6', name: 'Professor Zeta', startPos: [7, 0.4, -4], currentPos: [7, 0.4, -4], targetExit: 'exit-a', originalExit: 'exit-a', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 0.95, color: '#818cf8' },
  { id: 'agent-7', name: 'Visitor Eta', startPos: [-8, 0.4, 4], currentPos: [-8, 0.4, 4], targetExit: 'exit-b', originalExit: 'exit-b', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.1, color: '#a855f7' },
  { id: 'agent-8', name: 'Staff Theta', startPos: [-9, 0.4, 2], currentPos: [-9, 0.4, 2], targetExit: 'exit-b', originalExit: 'exit-b', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.2, color: '#a855f7' },
  { id: 'agent-9', name: 'Student Iota', startPos: [3, 0.4, 4], currentPos: [3, 0.4, 4], targetExit: 'exit-c', originalExit: 'exit-c', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.05, color: '#c084fc' },
  { id: 'agent-10', name: 'Research Fellow Kappa', startPos: [-2, 0.4, 1], currentPos: [-2, 0.4, 1], targetExit: 'exit-b', originalExit: 'exit-b', path: [], originalPath: [], status: 'Moving', progress: 0, speed: 1.15, color: '#a855f7' },
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
    position: [0, 0.4, 0], // neutral
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

  const [consequence, setConsequence] = useState<ConsequenceResult>({
    riskLevel: 'Low',
    blockedExits: [],
    affectedPeople: 0,
    totalPeople: 10,
    congestionLevel: 'Low (Optimal Flow)',
    congestionPercent: 12,
    estimatedDelay: 0,
    recommendedExit: 'All Exits Clear',
    bottleneckLocation: 'None',
    evacuationRate: 100,
    timestamp: new Date().toLocaleTimeString(),
  });

  const pathfinderRef = useRef<PathfindingEngine>(new PathfindingEngine(24, 16, 2));

  // Initialize and load default scenario from backend
  const initScenario = useCallback(async () => {
    try {
      setLoading(true);
      const res = await scenarioService.getScenarios();
      if (res.data && res.data.length > 0) {
        const defaultScen = res.data[0];
        setScenario(defaultScen);
        applyScenarioState(defaultScen);
      }
    } catch (err) {
      console.warn('[Simulation] Using fallback local campus scenario:', err);
      // Fallback local layout
      const fallbackWalls: WallSegment[] = [
        { x: 0, z: -8, width: 24, depth: 0.4, label: 'North Wall' },
        { x: 0, z: 8, width: 24, depth: 0.4, label: 'South Wall' },
        { x: -12, z: 0, width: 0.4, depth: 16, label: 'West Wall' },
        { x: 12, z: 0, width: 0.4, depth: 16, label: 'East Wall' },
        { x: -5, z: -4, width: 0.3, depth: 4.5, label: 'Lecture East' },
        { x: -8, z: -1, width: 4.5, depth: 0.3, label: 'Lecture South' },
        { x: 5, z: -4, width: 0.3, depth: 4.5, label: 'Lab East' },
        { x: 2, z: -1, width: 4.5, depth: 0.3, label: 'Lab South' },
        { x: -5, z: 4, width: 0.3, depth: 5, label: 'Offices East' },
        { x: 5, z: 4, width: 0.3, depth: 5, label: 'Robotics East' },
      ];
      const fallbackRooms: RoomZone[] = [
        { id: 'room-1', name: 'Lecture Hall 101', x: -8, z: -4, width: 6, depth: 6, color: '#1e293b' },
        { id: 'room-2', name: 'XR Research Lab', x: 2, z: -4, width: 6, depth: 6, color: '#1e293b' },
        { id: 'room-3', name: 'Faculty Offices', x: -8, z: 3, width: 6, depth: 5, color: '#1e293b' },
        { id: 'room-4', name: 'Server / Robotics Lab', x: 2, z: 3, width: 6, depth: 5, color: '#1e293b' },
      ];
      setWalls(fallbackWalls);
      setRooms(fallbackRooms);
      pathfinderRef.current.bakeWalls(fallbackWalls);
      calculateInitialPaths(DEFAULT_AGENTS, DEFAULT_EXITS);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyScenarioState = (scen: Scenario) => {
    const env = scen.environmentState;
    if (env.walls) {
      setWalls(env.walls);
      pathfinderRef.current.bakeWalls(env.walls);
    }
    if (env.rooms) setRooms(env.rooms);
    if (env.exits) setExits(env.exits);

    calculateInitialPaths(DEFAULT_AGENTS, env.exits || DEFAULT_EXITS);
  };

  const calculateInitialPaths = (agentList: Agent[], exitList: ExitZone[]) => {
    const exitMap = new Map<string, ExitZone>();
    exitList.forEach(e => exitMap.set(e.id, e));

    const updated = agentList.map(agent => {
      const exit = exitMap.get(agent.targetExit) || exitList[0];
      const path = pathfinderRef.current.findPath(
        agent.startPos[0],
        agent.startPos[2],
        exit.position[0],
        exit.position[2]
      );
      return {
        ...agent,
        path,
        originalPath: path,
        currentPos: agent.startPos,
        status: 'Moving' as const,
        progress: 0,
      };
    });

    setAgents(updated);
  };

  useEffect(() => {
    initScenario();
  }, [initScenario]);

  // Action: Block Exit A
  const blockExitA = () => {
    const newPos: [number, number, number] = [8.8, 0.4, -5.5];
    setObstacle({
      id: 'obstacle-cart-1',
      name: 'Heavy Industrial Trolley / Partition Debris',
      position: newPos,
      scale: [1.6, 1.2, 1.2],
      isBlockingExitA: true,
      targetBlock: 'exit-a',
    });

    setExits(prev =>
      prev.map(e => (e.id === 'exit-a' ? { ...e, isBlocked: true } : e))
    );

    setTimelinePhase('ACTION');
  };

  // Action: Block Corridor
  const blockCorridor = () => {
    const newPos: [number, number, number] = [0, 0.4, 0];
    setObstacle({
      id: 'obstacle-cart-1',
      name: 'Hazard Barrier / Corridor Block',
      position: newPos,
      scale: [2.0, 1.2, 1.2],
      isBlockingExitA: false,
      targetBlock: 'corridor',
    });

    setTimelinePhase('ACTION');
  };

  // Action: Clear Obstacle / Move to Neutral
  const clearObstacle = () => {
    const newPos: [number, number, number] = [0, 0.4, -7.0]; // tucked away against wall
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
    const dx = pos[0] - 11.2;
    const dz = pos[2] - (-5.5);
    const nearExitA = Math.sqrt(dx * dx + dz * dz) < 3.2;

    setObstacle(prev => ({
      ...prev,
      position: pos,
      isBlockingExitA: nearExitA,
      targetBlock: nearExitA ? 'exit-a' : 'none',
    }));

    setExits(prev =>
      prev.map(e => (e.id === 'exit-a' ? { ...e, isBlocked: nearExitA } : e))
    );

    setTimelinePhase('ACTION');
  };

  // Main Core Engine Interaction: SIMULATE FUTURE
  const simulateFuture = async () => {
    setIsSimulating(true);

    // 1. Update obstacle collisions in pathfinder
    pathfinderRef.current.updateObstacles([obstacle]);

    // 2. Determine affected exits
    const updatedExits = exits.map(e => {
      const isBlocked =
        e.id === 'exit-a' && obstacle.isBlockingExitA ||
        (Math.sqrt(
          Math.pow(obstacle.position[0] - e.position[0], 2) +
          Math.pow(obstacle.position[2] - e.position[2], 2)
        ) < 3.0);
      return { ...e, isBlocked };
    });
    setExits(updatedExits);

    // 3. Recalculate routes for all agents
    const reroutedAgents = agents.map(agent => {
      const targetExitObj = updatedExits.find(e => e.id === agent.targetExit);
      const isTargetBlocked = targetExitObj?.isBlocked;

      if (isTargetBlocked) {
        // Need to reroute! Pick best alternative exit (Exit B or Exit C)
        const availableExits = updatedExits.filter(e => !e.isBlocked);
        const altExit = availableExits.find(e => e.id === 'exit-b') || availableExits[0] || exits[1];

        // Recalculate new A* path from current position
        const newPath = pathfinderRef.current.findPath(
          agent.currentPos[0],
          agent.currentPos[2],
          altExit.position[0],
          altExit.position[2]
        );

        const origLen = PathfindingEngine.calculatePathLength(agent.originalPath);
        const newLen = PathfindingEngine.calculatePathLength(newPath);
        const rerouteDelta = Math.max(0, newLen - origLen);

        return {
          ...agent,
          targetExit: altExit.id,
          path: newPath,
          status: 'Rerouting' as const,
          rerouteDistanceDelta: rerouteDelta,
          color: '#f59e0b', // warning amber for rerouted
        };
      } else {
        // Path might still be blocked if obstacle is in corridor
        const newPath = pathfinderRef.current.findPath(
          agent.currentPos[0],
          agent.currentPos[2],
          targetExitObj ? targetExitObj.position[0] : 0,
          targetExitObj ? targetExitObj.position[2] : 0
        );

        return {
          ...agent,
          path: newPath,
          status: 'Moving' as const,
        };
      }
    });

    setAgents(reroutedAgents);

    // 4. Compute consequence analysis
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

  // Reset scenario back to original baseline
  const resetScenario = () => {
    setIsPlaying(false);
    setSimulationTime(0);
    clearObstacle();
    calculateInitialPaths(DEFAULT_AGENTS, DEFAULT_EXITS);
    setTimelinePhase('BEFORE');
    setConsequence({
      riskLevel: 'Low',
      blockedExits: [],
      affectedPeople: 0,
      totalPeople: 10,
      congestionLevel: 'Low (Optimal Flow)',
      congestionPercent: 12,
      estimatedDelay: 0,
      recommendedExit: 'All Exits Clear',
      bottleneckLocation: 'None',
      evacuationRate: 100,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const saveSimulationRun = async () => {
    try {
      const runData = {
        scenarioId: scenario?._id || scenario?.id || 'campus-complex-1',
        scenarioTitle: scenario?.title || 'Campus Academic Complex — North Wing',
        actionPerformed: obstacle.isBlockingExitA
          ? 'Hypothetical Action: Block Emergency Exit A with Trolley Debris'
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
