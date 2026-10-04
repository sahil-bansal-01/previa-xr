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

    // Identify blocked exits
    exits.forEach(exit => {
      if (exit.isBlocked) {
        blockedExits.push(exit.name || exit.label);
      }
    });

    let affectedCount = 0;
    let reroutedCount = 0;
    let unreachableCount = 0;
    let totalDelayDistance = 0;
    const reroutedExitsSet = new Set<string>();
    const allUsedExitsSet = new Set<string>();

    agents.forEach(agent => {
      const baseCost = agent.baselineCost ?? PathfindingEngine.calculatePathLength(agent.baselinePath || agent.originalPath || []);
      const futCost = agent.futureCost ?? PathfindingEngine.calculatePathLength(agent.path || agent.futurePath || []);
      const isUnreachable = agent.isUnreachable || agent.status === 'Unreachable';
      const exitChanged = Boolean(agent.futureExit && agent.baselineExit && agent.futureExit !== agent.baselineExit);
      const isRerouted = Boolean(agent.isRerouted || agent.status === 'Rerouting' || exitChanged);

      if (isUnreachable) {
        unreachableCount++;
        affectedCount++;
      } else if (isRerouted) {
        affectedCount++;
        reroutedCount++;
        totalDelayDistance += Math.max(0, futCost - baseCost);

        // Record target exit name for rerouted agents
        const destExit = exits.find(e => e.id === agent.targetExit || e.id === agent.futureExit);
        if (destExit) {
          const name = destExit.name || destExit.label;
          reroutedExitsSet.add(name);
          allUsedExitsSet.add(name);
        }
      } else {
        const destExit = exits.find(e => e.id === agent.targetExit || e.id === agent.futureExit || e.id === agent.baselineExit);
        if (destExit && !destExit.isBlocked) {
          allUsedExitsSet.add(destExit.name || destExit.label);
        }
      }
    });

    // Compute realistic path overlap hotspots across all active agent paths
    const activePaths = agents
      .filter(a => a.status !== 'Unreachable' && a.path && a.path.length >= 2)
      .map(a => a.path);
    const hotspots = PathfindingEngine.calculatePathOverlapHotspots(activePaths);

    // Determine congestion rating
    let maxOverlap = 0;
    let hasHigh = false;
    let hasMedium = false;
    hotspots.forEach(h => {
      if (h.count > maxOverlap) maxOverlap = h.count;
      if (h.level === 'HIGH') hasHigh = true;
      if (h.level === 'MEDIUM') hasMedium = true;
    });

    let congestionLevel = 'LOW';
    let congestionPercent = 12;
    if (hasHigh || maxOverlap >= 4) {
      congestionLevel = 'HIGH';
      congestionPercent = Math.min(88, 45 + maxOverlap * 8);
    } else if (hasMedium || maxOverlap >= 2) {
      congestionLevel = 'MEDIUM';
      congestionPercent = Math.min(58, 25 + maxOverlap * 6);
    } else {
      congestionLevel = 'LOW';
      congestionPercent = 15;
    }

    // Delay in seconds (average walking speed ~1.15 m/s)
    const avgDelta = reroutedCount > 0 ? totalDelayDistance / reroutedCount : 0;
    const bottleneckWait = hasHigh ? 6 : hasMedium ? 3 : 0;
    const rawDelay = Math.round(avgDelta / 1.15) + bottleneckWait;
    const estimatedDelay = affectedCount > 0 ? Math.max(1, rawDelay) : 0;

    // Alternative exit formatting:
    // If occupants were rerouted, show the alternative exit(s) they rerouted to
    let recommendedExit = '—';
    const displayExitsList = reroutedExitsSet.size > 0
      ? Array.from(reroutedExitsSet)
      : Array.from(allUsedExitsSet);

    if (displayExitsList.length === 0) {
      recommendedExit = unreachableCount > 0 ? 'None Reachable' : '—';
    } else if (displayExitsList.length === 1) {
      recommendedExit = displayExitsList[0].toUpperCase();
    } else if (displayExitsList.length === 2) {
      const name1 = displayExitsList[0].toUpperCase().replace('EMERGENCY ', '');
      const name2 = displayExitsList[1].toUpperCase().replace('EMERGENCY ', '');
      recommendedExit = `${name1} & ${name2}`;
    } else {
      recommendedExit = `${displayExitsList.length} Exits Used`;
    }

    // Specific WHY text derived directly from actual simulation events (Section 51)
    let whySentence = 'All corridors clear; occupants follow standard evacuation routes.';
    if (unreachableCount > 0) {
      if (unreachableCount === totalPeople) {
        whySentence = 'No reachable exit remains for any occupants.';
      } else {
        whySentence = `No reachable exit remains for ${unreachableCount} occupant${unreachableCount > 1 ? 's' : ''}.`;
      }
    } else if (blockedExits.length > 0) {
      const bName = blockedExits[0].toUpperCase();
      if (reroutedCount > 0) {
        const reroutedNames = Array.from(reroutedExitsSet).map(e => e.toUpperCase());
        if (reroutedNames.length > 1) {
          whySentence = `${bName} was blocked, so ${reroutedCount} occupants rerouted through ${reroutedNames.join(' and ')}.`;
        } else if (reroutedNames.length === 1) {
          whySentence = `${bName} was blocked, so ${reroutedCount} occupant${reroutedCount > 1 ? 's' : ''} rerouted through ${reroutedNames[0]}.`;
        } else {
          whySentence = `${bName} was blocked, affecting ${affectedCount} occupants.`;
        }
      } else {
        whySentence = `${bName} was blocked; all active occupants already use operational exits.`;
      }
    } else if (affectedCount > 0) {
      whySentence = `Central corridor was blocked, so ${reroutedCount} occupant${reroutedCount > 1 ? 's' : ''} used ${recommendedExit}.`;
    }

    // Risk level
    let riskLevel: RiskLevel = 'Low';
    if (unreachableCount > 0 || congestionLevel === 'HIGH') {
      riskLevel = unreachableCount > 2 ? 'Critical' : 'High';
    } else if (affectedCount > 3 || congestionLevel === 'MEDIUM') {
      riskLevel = 'Medium';
    }

    return {
      riskLevel,
      blockedExits,
      affectedPeople: affectedCount,
      reroutedPeople: reroutedCount,
      totalPeople,
      congestionLevel,
      congestionPercent,
      estimatedDelay,
      recommendedExit,
      bottleneckLocation: hasHigh ? 'Corridor Junction Chokepoint' : 'Standard Flow',
      evacuationRate: totalPeople > 0 ? Math.round(((totalPeople - unreachableCount) / totalPeople) * 100) : 100,
      unreachablePeople: unreachableCount,
      congestionHotspots: hotspots,
      whySentence,
      timestamp: new Date().toLocaleTimeString(),
      actionSummary: blockedExits.length > 0 ? `Obstacle blocking ${blockedExits.join(', ')}` : 'Baseline: All corridors clear',
    };
  }
}
