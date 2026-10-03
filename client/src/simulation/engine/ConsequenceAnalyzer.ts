import { Agent, ExitZone, ObstacleState, ConsequenceResult, RiskLevel } from '../types/simulationTypes';
import { PathfindingEngine } from './PathfindingEngine';

export class ConsequenceAnalyzer {
  public static analyze(
    agents: Agent[],
    exits: ExitZone[],
    obstacles: ObstacleState[],
    pathfinder: PathfindingEngine
  ): ConsequenceResult {
    const totalPeople = agents.length;
    const blockedExits: string[] = [];

    // Detect blocked exits by checking obstacle proximity to exit zones
    exits.forEach(exit => {
      const isBlocked = obstacles.some(obs => {
        if (!obs.position) return false;
        const dx = obs.position[0] - exit.position[0];
        const dz = obs.position[2] - exit.position[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        return dist < 3.2 || obs.isBlockingExitA && exit.id === 'exit-a';
      });

      if (isBlocked || exit.isBlocked) {
        blockedExits.push(exit.name || exit.label);
      }
    });

    // Detect affected people: agents whose original target was blocked or whose path intersected the obstacle
    let affectedCount = 0;
    let totalDeltaDistance = 0;
    let reroutedAgents: Agent[] = [];

    agents.forEach(agent => {
      const isTargetBlocked = blockedExits.some(b => 
        (agent.originalExit === 'exit-a' && b.includes('Exit A')) ||
        (agent.originalExit === 'exit-b' && b.includes('Exit B')) ||
        (agent.originalExit === 'exit-c' && b.includes('Exit C'))
      );

      if (isTargetBlocked) {
        affectedCount++;
        reroutedAgents.push(agent);
        if (agent.rerouteDistanceDelta) {
          totalDeltaDistance += agent.rerouteDistanceDelta;
        } else {
          totalDeltaDistance += 14.5; // average detour in campus layout
        }
      }
    });

    // Calculate congestion and queuing bottleneck
    let congestionPercent = 0;
    let congestionLevel = 'Low';
    let bottleneckLocation = 'None (Standard Flow)';
    let estimatedDelay = 0;
    let riskLevel: RiskLevel = 'Low';
    let recommendedExit = 'Exit A (North Wing)';

    if (blockedExits.length > 0) {
      // If Exit A is blocked:
      if (blockedExits.some(e => e.includes('Exit A'))) {
        congestionPercent = Math.min(88, 30 + (affectedCount * 6.5)); // ~42% to 68%
        congestionLevel = affectedCount > 7 ? 'High' : 'Moderate';
        bottleneckLocation = 'Central Concourse Junction & Corridor B';
        // Delay is walking time of detour + bottleneck wait
        const walkDelay = Math.round(totalDeltaDistance / (Math.max(1, affectedCount) * 1.1));
        const queuePenalty = Math.round(affectedCount * 1.8);
        estimatedDelay = Math.max(14, walkDelay + queuePenalty); // approx 18 sec
        riskLevel = affectedCount > 8 ? 'High' : 'Medium';
        recommendedExit = 'Exit B (West Concourse)';
      } else if (blockedExits.some(e => e.includes('Exit B'))) {
        congestionPercent = 55;
        congestionLevel = 'Moderate';
        bottleneckLocation = 'West Wing Access Hallway';
        estimatedDelay = 15;
        riskLevel = 'Medium';
        recommendedExit = 'Exit A (North Wing)';
      }

      if (blockedExits.length >= 2) {
        congestionPercent = 92;
        congestionLevel = 'Severe Bottleneck';
        bottleneckLocation = 'Single Remaining Corridor Chokepoint';
        estimatedDelay = 35;
        riskLevel = 'Critical';
        recommendedExit = exits.find(e => !blockedExits.some(b => b.includes(e.name)))?.name || 'Exit C';
      }
    } else {
      // Baseline
      congestionPercent = 12;
      congestionLevel = 'Low (Optimal)';
      bottleneckLocation = 'None';
      estimatedDelay = 0;
      riskLevel = 'Low';
      recommendedExit = 'All Exits Operational';
    }

    return {
      riskLevel,
      blockedExits,
      affectedPeople: affectedCount,
      totalPeople,
      congestionLevel: `${congestionLevel} (+${Math.round(congestionPercent)}% Density)`,
      congestionPercent,
      estimatedDelay,
      recommendedExit,
      bottleneckLocation,
      evacuationRate: blockedExits.length === 0 ? 100 : Math.max(45, 100 - congestionPercent),
      timestamp: new Date().toLocaleTimeString(),
      actionSummary: blockedExits.length > 0 ? `Obstacle blocking ${blockedExits.join(', ')}` : 'Baseline: All corridors clear',
    };
  }
}
