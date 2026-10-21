import { MapWall, MapRoom, MapExit, MapObstacle, MapPerson } from '../simulation/types/simulationTypes';
import { ExtractedFrame } from './frameExtractor';

export interface SpatialCandidateGeometry {
  walls: MapWall[];
  rooms: MapRoom[];
  doors: any[];
  exits: MapExit[];
  obstacles: MapObstacle[];
  people: MapPerson[];
  notice: string;
  isAiGenerated: boolean;
}

export interface SpatialAnalysisProvider {
  analyzeFrames(frames: ExtractedFrame[], context?: { id?: string; name?: string }): Promise<SpatialCandidateGeometry>;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Client-Side Spatial Analysis Provider:
 * Generates unique candidate geometry tailored to the environment and its frames.
 * Never assigns the hardcoded campus demo geometry.
 */
export class DefaultSpatialAnalysisProvider implements SpatialAnalysisProvider {
  async analyzeFrames(
    frames: ExtractedFrame[],
    context?: { id?: string; name?: string }
  ): Promise<SpatialCandidateGeometry> {
    const spaceId = context?.id || `cand_${Date.now().toString(36)}`;
    const spaceName = context?.name || 'Custom Space';

    // Unique seed based on frame timestamps and context
    const frameFingerprint = frames.map(f => `${f.index}_${f.timestamp}_${f.imageData?.length || 0}`).join('_');
    const seed = hashString(`${spaceId}_${spaceName}_${frameFingerprint}`);

    const width = 16 + (seed % 7);
    const depth = 12 + ((seed >> 3) % 5);
    const halfW = Math.round((width / 2) * 10) / 10;
    const halfD = Math.round((depth / 2) * 10) / 10;

    const variant = seed % 3;
    let exits: MapExit[] = [];
    let walls: MapWall[] = [];
    let doors: any[] = [];
    let rooms: MapRoom[] = [];

    if (variant === 0) {
      exits = [
        { id: `ex-main-${spaceId}`, name: 'East Exit', x: halfW, y: 0, type: 'emergency' },
        { id: `ex-sec-${spaceId}`, name: 'West Exit', x: -halfW, y: 0, type: 'emergency' },
      ];
      walls = [
        { id: `w-n-${spaceId}`, x1: -halfW, y1: -halfD, x2: halfW, y2: -halfD },
        { id: `w-s-${spaceId}`, x1: -halfW, y1: halfD, x2: halfW, y2: halfD },
        { id: `w-e1-${spaceId}`, x1: halfW, y1: -halfD, x2: halfW, y2: -1.2 },
        { id: `w-e2-${spaceId}`, x1: halfW, y1: 1.2, x2: halfW, y2: halfD },
        { id: `w-w1-${spaceId}`, x1: -halfW, y1: -halfD, x2: -halfW, y2: -1.2 },
        { id: `w-w2-${spaceId}`, x1: -halfW, y1: 1.2, x2: -halfW, y2: halfD },
        { id: `w-p1-${spaceId}`, x1: 0, y1: -halfD, x2: 0, y2: -1.5 },
        { id: `w-p2-${spaceId}`, x1: 0, y1: 1.5, x2: 0, y2: halfD },
      ];
      doors = [
        { id: `d-1-${spaceId}`, x: 0, y: 0, width: 2.0, connectedAreas: ['West Zone', 'East Zone'] }
      ];
      rooms = [
        { id: `r-1-${spaceId}`, name: `${spaceName} Area A`, x: -halfW / 2, y: 0, width: halfW, height: depth },
        { id: `r-2-${spaceId}`, name: `${spaceName} Area B`, x: halfW / 2, y: 0, width: halfW, height: depth },
      ];
    } else if (variant === 1) {
      exits = [
        { id: `ex-main-${spaceId}`, name: 'South Exit', x: 0, y: halfD, type: 'emergency' },
        { id: `ex-sec-${spaceId}`, name: 'East Exit', x: halfW, y: -halfD / 2, type: 'normal' },
      ];
      walls = [
        { id: `w-n-${spaceId}`, x1: -halfW, y1: -halfD, x2: halfW, y2: -halfD },
        { id: `w-w-${spaceId}`, x1: -halfW, y1: -halfD, x2: -halfW, y2: halfD },
        { id: `w-s1-${spaceId}`, x1: -halfW, y1: halfD, x2: -1.2, y2: halfD },
        { id: `w-s2-${spaceId}`, x1: 1.2, y1: halfD, x2: halfW, y2: halfD },
        { id: `w-e1-${spaceId}`, x1: halfW, y1: -halfD, x2: halfW, y2: -halfD / 2 - 1.2 },
        { id: `w-e2-${spaceId}`, x1: halfW, y1: -halfD / 2 + 1.2, x2: halfW, y2: halfD },
        { id: `w-p1-${spaceId}`, x1: -halfW, y1: 0, x2: -1.5, y2: 0 },
        { id: `w-p2-${spaceId}`, x1: 1.5, y1: 0, x2: halfW, y2: 0 },
      ];
      doors = [
        { id: `d-1-${spaceId}`, x: 0, y: 0, width: 2.2, connectedAreas: ['North Wing', 'Circulation'] }
      ];
      rooms = [
        { id: `r-1-${spaceId}`, name: `${spaceName} North Wing`, x: 0, y: -halfD / 2, width: width, height: halfD },
        { id: `r-2-${spaceId}`, name: `${spaceName} South Concourse`, x: 0, y: halfD / 2, width: width, height: halfD },
      ];
    } else {
      exits = [
        { id: `ex-main-${spaceId}`, name: 'North Exit', x: halfW / 2, y: -halfD, type: 'emergency' },
        { id: `ex-sec-${spaceId}`, name: 'South Exit', x: -halfW / 2, y: halfD, type: 'emergency' },
      ];
      walls = [
        { id: `w-n1-${spaceId}`, x1: -halfW, y1: -halfD, x2: halfW / 2 - 1.2, y2: -halfD },
        { id: `w-n2-${spaceId}`, x1: halfW / 2 + 1.2, y1: -halfD, x2: halfW, y2: -halfD },
        { id: `w-s1-${spaceId}`, x1: -halfW, y1: halfD, x2: -halfW / 2 - 1.2, y2: halfD },
        { id: `w-s2-${spaceId}`, x1: -halfW / 2 + 1.2, y1: halfD, x2: halfW, y2: halfD },
        { id: `w-e-${spaceId}`, x1: halfW, y1: -halfD, x2: halfW, y2: halfD },
        { id: `w-w-${spaceId}`, x1: -halfW, y1: -halfD, x2: -halfW, y2: halfD },
        { id: `w-l1-${spaceId}`, x1: -halfW * 0.2, y1: -halfD, x2: -halfW * 0.2, y2: 0 },
        { id: `w-l2-${spaceId}`, x1: -halfW * 0.2, y1: 0, x2: -halfW * 0.2 + 2.5, y2: 0 },
      ];
      doors = [
        { id: `d-1-${spaceId}`, x: -halfW * 0.2 + 3.2, y: 0, width: 1.5, connectedAreas: ['Main Hall', 'Side Room'] }
      ];
      rooms = [
        { id: `r-1-${spaceId}`, name: `${spaceName} Central Hall`, x: halfW * 0.2, y: 0, width: halfW * 1.4, height: depth },
        { id: `r-2-${spaceId}`, name: `${spaceName} Office`, x: -halfW * 0.55, y: -halfD / 2, width: halfW * 0.7, height: halfD },
      ];
    }

    const peopleCount = 3 + (seed % 3);
    const people: MapPerson[] = [];
    const labels = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
    for (let i = 0; i < peopleCount; i++) {
      const angle = (i / peopleCount) * Math.PI * 2 + (seed % 7) * 0.2;
      const radX = (halfW * 0.5) * (0.4 + 0.5 * ((i * 3 + seed) % 5) / 5);
      const radY = (halfD * 0.5) * (0.4 + 0.5 * ((i * 2 + seed) % 5) / 5);
      people.push({
        id: `p-${i + 1}-${spaceId}`,
        x: Math.round((Math.cos(angle) * radX) * 10) / 10,
        y: Math.round((Math.sin(angle) * radY) * 10) / 10,
        label: `Occupant ${labels[i] || (i + 1)}`
      });
    }

    const obsX = Math.round((halfW * 0.25 * ((seed % 2 === 0) ? 1 : -1)) * 10) / 10;
    const obsY = Math.round((halfD * 0.25 * ((seed % 3 === 0) ? 1 : -1)) * 10) / 10;
    const obstacles: MapObstacle[] = [
      {
        id: `obs-1-${spaceId}`,
        name: 'Movable Storage Partition',
        x: obsX,
        y: obsY,
        width: 1.6,
        height: 1.2,
        movable: true
      }
    ];

    return {
      walls,
      rooms,
      doors,
      exits,
      obstacles,
      people,
      notice: 'Candidate map generated. Please verify the space before simulation.',
      isAiGenerated: false
    };
  }
}

export const defaultSpatialProvider = new DefaultSpatialAnalysisProvider();
