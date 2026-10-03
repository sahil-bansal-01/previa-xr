import { ScenarioModel } from '../models/Scenario.js';
import { SimulationRunModel } from '../models/SimulationRun.js';
import { UserModel } from '../models/User.js';
import bcrypt from 'bcryptjs';

export const defaultCampusScenario = {
  title: 'Campus Academic Complex — North Wing',
  description: 'Multi-room academic wing with 10 occupants and 3 emergency evacuation exits. Demonstrates route recalculation and corridor congestion when Exit A is obstructed.',
  environmentType: 'Indoor Emergency / Campus Facility',
  environmentState: {
    gridWidth: 24,
    gridHeight: 16,
    cellSize: 1,
    rooms: [
      { id: 'room-1', name: 'Lecture Hall 101', x: -8, z: -4, width: 6, depth: 6, color: '#1e293b' },
      { id: 'room-2', name: 'XR Research Lab', x: 2, z: -4, width: 6, depth: 6, color: '#1e293b' },
      { id: 'room-3', name: 'Faculty Offices', x: -8, z: 3, width: 6, depth: 5, color: '#1e293b' },
      { id: 'room-4', name: 'Server / Robotics Lab', x: 2, z: 3, width: 6, depth: 5, color: '#1e293b' },
    ],
    // Walls as bounding rectangles [x1, z1, x2, z2] or discrete wall segments
    walls: [
      // Outer perimeter
      { x: 0, z: -8, width: 24, depth: 0.4, label: 'North Perimeter Wall' },
      { x: 0, z: 8, width: 24, depth: 0.4, label: 'South Perimeter Wall' },
      { x: -12, z: 0, width: 0.4, depth: 16, label: 'West Perimeter Wall' },
      { x: 12, z: 0, width: 0.4, depth: 16, label: 'East Perimeter Wall' },
      // Interior partition walls with doorways
      { x: -5, z: -4, width: 0.3, depth: 4.5, label: 'Lecture Hall East Wall' },
      { x: -8, z: -1, width: 4.5, depth: 0.3, label: 'Lecture Hall South Wall' },
      { x: 5, z: -4, width: 0.3, depth: 4.5, label: 'XR Lab East Wall' },
      { x: 2, z: -1, width: 4.5, depth: 0.3, label: 'XR Lab South Wall' },
      { x: -5, z: 4, width: 0.3, depth: 5, label: 'Faculty Offices East Wall' },
      { x: 5, z: 4, width: 0.3, depth: 5, label: 'Robotics Lab East Wall' },
    ],
    exits: [
      {
        id: 'exit-a',
        name: 'Emergency Exit A',
        label: 'EXIT A (North Wing)',
        position: [11.2, 0, -5.5],
        color: '#10b981',
        isPrimary: true,
        width: 1.6,
        capacity: 'High Flow',
      },
      {
        id: 'exit-b',
        name: 'Emergency Exit B',
        label: 'EXIT B (West Concourse)',
        position: [-11.2, 0, 5.5],
        color: '#38bdf8',
        isPrimary: false,
        width: 1.6,
        capacity: 'Moderate Flow',
      },
      {
        id: 'exit-c',
        name: 'Emergency Exit C',
        label: 'EXIT C (South Corridor)',
        position: [0, 0, 7.5],
        color: '#a855f7',
        isPrimary: false,
        width: 1.4,
        capacity: 'Secondary Exit',
      },
    ],
    initialObstacles: [
      {
        id: 'obstacle-cart-1',
        name: 'Heavy Industrial Trolley / Partition Debris',
        position: [8.5, 0.4, -5.5],
        scale: [1.6, 1.2, 1.2],
        isBlockingExitA: true,
        type: 'movable',
      }
    ],
    initialAgents: [
      { id: 'agent-1', name: 'Researcher Alpha', startPos: [-8, 0.5, -5], currentExit: 'exit-a', speed: 1.2, status: 'Moving' },
      { id: 'agent-2', name: 'Student Beta', startPos: [-9, 0.5, -3], currentExit: 'exit-a', speed: 1.1, status: 'Moving' },
      { id: 'agent-3', name: 'Lab Tech Gamma', startPos: [3, 0.5, -4], currentExit: 'exit-a', speed: 1.3, status: 'Moving' },
      { id: 'agent-4', name: 'Staff Delta', startPos: [4, 0.5, -6], currentExit: 'exit-a', speed: 1.0, status: 'Moving' },
      { id: 'agent-5', name: 'Student Epsilon', startPos: [1, 0.5, -2], currentExit: 'exit-a', speed: 1.15, status: 'Moving' },
      { id: 'agent-6', name: 'Professor Zeta', startPos: [7, 0.5, -4], currentExit: 'exit-a', speed: 0.95, status: 'Moving' },
      { id: 'agent-7', name: 'Visitor Eta', startPos: [-8, 0.5, 4], currentExit: 'exit-b', speed: 1.1, status: 'Moving' },
      { id: 'agent-8', name: 'Staff Theta', startPos: [-9, 0.5, 2], currentExit: 'exit-b', speed: 1.25, status: 'Moving' },
      { id: 'agent-9', name: 'Student Iota', startPos: [3, 0.5, 4], currentExit: 'exit-c', speed: 1.05, status: 'Moving' },
      { id: 'agent-10', name: 'Research Fellow Kappa', startPos: [-2, 0.5, 1], currentExit: 'exit-b', speed: 1.15, status: 'Moving' },
    ],
  },
  actions: [
    {
      id: 'action-block-exit-a',
      type: 'PLACE_OBSTACLE',
      target: 'Emergency Exit A',
      description: 'Block primary corridor access to Exit A with heavy partition debris',
      obstaclePos: [8.8, 0.4, -5.5],
    },
    {
      id: 'action-block-corridor',
      type: 'BLOCK_CORRIDOR',
      target: 'Central Concourse',
      description: 'Block central intersection connecting North and South wings',
      obstaclePos: [0, 0.4, 0],
    }
  ],
};

export async function seedDatabase() {
  try {
    // Seed default demo user if not present
    const existingDemoUser = await UserModel.findOne({ email: 'demo@previa.xr' });
    let demoUserId = 'demo_user';
    if (!existingDemoUser) {
      const passwordHash = await bcrypt.hash('previa2026', 10);
      const user = await UserModel.create({
        name: 'PREVIA Demo Operator',
        email: 'demo@previa.xr',
        passwordHash,
        role: 'operator',
      });
      demoUserId = user._id || user.id;
      console.log('[Seed] Created default demo user: demo@previa.xr');
    } else {
      demoUserId = existingDemoUser._id || existingDemoUser.id;
    }

    // Seed default campus scenario if empty
    const count = await ScenarioModel.count();
    let seededScenarioId = null;
    if (count === 0) {
      const scenario = await ScenarioModel.create({
        ...defaultCampusScenario,
        createdBy: demoUserId,
      });
      seededScenarioId = scenario._id || scenario.id;
      console.log('[Seed] Initialized baseline scenario: Campus Academic Complex — North Wing');

      // Seed baseline simulation run
      await SimulationRunModel.create({
        scenarioId: seededScenarioId,
        scenarioTitle: defaultCampusScenario.title,
        actionPerformed: 'Hypothetical Action: Obstacle Placed Near Exit A',
        initialState: {
          blockedExits: [],
          activeExits: ['Exit A', 'Exit B', 'Exit C'],
          occupants: 10,
        },
        finalState: {
          blockedExits: ['Exit A'],
          activeExits: ['Exit B', 'Exit C'],
          reroutedAgents: ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5', 'agent-6'],
        },
        blockedExits: ['Exit A'],
        affectedPeople: 6,
        congestionLevel: 'Moderate (+42% Density)',
        estimatedDelay: 18,
        recommendedExit: 'Exit B (West Concourse)',
        riskLevel: 'Medium',
        userId: demoUserId,
      });
      console.log('[Seed] Initialized baseline simulation run for Exit A blockage.');
    }
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
  }
}
