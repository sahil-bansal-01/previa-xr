import { ScenarioModel } from '../models/Scenario.js';
import { SimulationRunModel } from '../models/SimulationRun.js';
import { UserModel } from '../models/User.js';
import bcrypt from 'bcryptjs';

export const defaultCampusScenario = {
  title: 'Campus Academic Complex — North Wing',
  description: 'Multi-room academic wing with 10 occupants and 3 emergency evacuation exits. Demonstrates route recalculation and corridor congestion when Main Exit is obstructed.',
  environmentType: 'Indoor Emergency / Campus Facility',
  environmentState: {
    gridWidth: 24,
    gridHeight: 16,
    cellSize: 1,
    rooms: [
      { id: 'room-1', name: 'Lecture Hall (Room A)', x: -5.0, z: -4.3, width: 9.6, depth: 5.0, color: '#FFFFFF' },
      { id: 'room-2', name: 'Research Lab (Room B)', x: 5.0, z: -4.3, width: 9.6, depth: 5.0, color: '#FFFFFF' },
      { id: 'room-3', name: 'Faculty Commons (Room C)', x: -5.75, z: 4.3, width: 8.1, depth: 5.0, color: '#FFFFFF' },
      { id: 'room-4', name: 'Seminar Hall (Room D)', x: 5.75, z: 4.3, width: 8.1, depth: 5.0, color: '#FFFFFF' },
    ],
    walls: [
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
    ],
    exits: [
      {
        id: 'exit-main',
        name: 'East Exit',
        label: 'EAST EXIT',
        position: [10.0, 0, 0],
        walkableEntryCell: [8.8, 0, 0],
        color: '#16a34a',
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
        isPrimary: false,
        width: 2.4,
        capacity: 'Secondary Exit',
        type: 'normal',
      },
    ],
    initialObstacles: [
      {
        id: 'obstacle-cart-1',
        name: 'Heavy Industrial Trolley / Partition Debris',
        position: [0, 0.4, -6.0],
        scale: [1.6, 1.2, 1.2],
        isBlockingExitA: false,
        type: 'movable',
      }
    ],
    initialAgents: [
      { id: 'agent-1', name: 'Researcher Alpha (P1)', startPos: [-6.0, 0.4, -4.5], currentExit: 'exit-secondary', speed: 1.15, status: 'Moving' },
      { id: 'agent-2', name: 'Student Beta (P2)', startPos: [-4.8, 0.4, -3.0], currentExit: 'exit-secondary', speed: 1.05, status: 'Moving' },
      { id: 'agent-3', name: 'Lab Tech Gamma (P3)', startPos: [6.0, 0.4, -4.5], currentExit: 'exit-main', speed: 1.25, status: 'Moving' },
      { id: 'agent-4', name: 'Staff Delta (P4)', startPos: [4.8, 0.4, -3.0], currentExit: 'exit-main', speed: 1.0, status: 'Moving' },
      { id: 'agent-5', name: 'Professor Zeta (P5)', startPos: [7.5, 0.4, -4.0], currentExit: 'exit-main', speed: 0.95, status: 'Moving' },
      { id: 'agent-6', name: 'Student Epsilon (P6)', startPos: [6.5, 0.4, 0.0], currentExit: 'exit-main', speed: 1.1, status: 'Moving' },
      { id: 'agent-7', name: 'Visitor Eta (P7)', startPos: [-6.0, 0.4, 4.5], currentExit: 'exit-secondary', speed: 1.1, status: 'Moving' },
      { id: 'agent-8', name: 'Staff Theta (P8)', startPos: [-4.8, 0.4, 3.0], currentExit: 'exit-secondary', speed: 1.2, status: 'Moving' },
      { id: 'agent-9', name: 'Student Iota (P9)', startPos: [6.0, 0.4, 4.5], currentExit: 'exit-main', speed: 1.05, status: 'Moving' },
      { id: 'agent-10', name: 'Research Fellow Kappa (P10)', startPos: [0.0, 0.4, 3.5], currentExit: 'exit-south', speed: 1.15, status: 'Moving' },
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
