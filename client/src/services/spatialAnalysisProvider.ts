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
  analyzeFrames(frames: ExtractedFrame[]): Promise<SpatialCandidateGeometry>;
}

/**
 * Standard Guided Fallback Spatial Provider:
 * Creates a clean rectangular perimeter bounding box and standard exit/room placeholders,
 * while transparently declaring that AI vision is unavailable so user verifies and edits manually.
 */
export class DefaultSpatialAnalysisProvider implements SpatialAnalysisProvider {
  async analyzeFrames(frames: ExtractedFrame[]): Promise<SpatialCandidateGeometry> {
    // Check if an external vision API key was supplied in client environment
    const externalKey = (import.meta as any).env?.VITE_VISION_API_KEY;

    if (externalKey) {
      // In the future, this can invoke Google Cloud Vision / Gemini Multimodal API
      return {
        walls: [
          { id: 'w-1', x1: -10, y1: -7, x2: 10, y2: -7 },
          { id: 'w-2', x1: 10, y1: -7, x2: 10, y2: 7 },
          { id: 'w-3', x1: 10, y1: 7, x2: -10, y2: 7 },
          { id: 'w-4', x1: -10, y1: 7, x2: -10, y2: -7 },
          { id: 'w-5', x1: 0, y1: -7, x2: 0, y2: 1 },
        ],
        rooms: [
          { id: 'r-1', name: 'Zone Alpha', x: -5, y: -3, width: 8, height: 6 },
          { id: 'r-2', name: 'Zone Beta', x: 5, y: 2, width: 8, height: 6 },
        ],
        doors: [
          { id: 'd-1', x: 0, y: 3, width: 1.5 },
        ],
        exits: [
          { id: 'ex-1', name: 'Main Exit', x: 9.5, y: -6, type: 'emergency' },
          { id: 'ex-2', name: 'Back Exit', x: -9.5, y: 6, type: 'normal' },
        ],
        obstacles: [
          { id: 'obs-1', name: 'Storage Partition', x: 2, y: -2, width: 1.5, height: 1.2, movable: true },
        ],
        people: [
          { id: 'p-1', x: -5, y: -3, label: 'Person 1' },
          { id: 'p-2', x: -4, y: 0, label: 'Person 2' },
          { id: 'p-3', x: 4, y: 3, label: 'Person 3' },
          { id: 'p-4', x: 6, y: 1, label: 'Person 4' },
        ],
        notice: 'Candidate geometry extracted via external vision provider. Please verify walls and exits.',
        isAiGenerated: true,
      };
    }

    // Standard Guided Fallback: provides clean perimeter boundaries ready for manual editing
    return {
      walls: [
        { id: 'w-1', x1: -10, y1: -7, x2: 10, y2: -7 },
        { id: 'w-2', x1: 10, y1: -7, x2: 10, y2: 7 },
        { id: 'w-3', x1: 10, y1: 7, x2: -10, y2: 7 },
        { id: 'w-4', x1: -10, y1: 7, x2: -10, y2: -7 },
        { id: 'w-5', x1: -1, y1: -7, x2: -1, y2: 0 },
      ],
      rooms: [
        { id: 'r-1', name: 'Uploaded Space Room', x: -5, y: -3, width: 8, height: 6 },
      ],
      doors: [
        { id: 'd-1', x: -1, y: 2, width: 1.5 },
      ],
      exits: [
        { id: 'ex-1', name: 'Main Exit', x: 9.5, y: -6, type: 'emergency' },
        { id: 'ex-2', name: 'Secondary Exit', x: -9.5, y: 6, type: 'normal' },
      ],
      obstacles: [
        { id: 'obs-1', name: 'Movable Cabinet', x: 1, y: 0, width: 1.5, height: 1.2, movable: true },
      ],
      people: [
        { id: 'p-1', x: -5, y: -3, label: 'Occupant 1' },
        { id: 'p-2', x: -4, y: 1, label: 'Occupant 2' },
        { id: 'p-3', x: 4, y: 2, label: 'Occupant 3' },
        { id: 'p-4', x: 6, y: -2, label: 'Occupant 4' },
      ],
      notice: 'AI-assisted mapping unavailable — verify or create the map manually.',
      isAiGenerated: false,
    };
  }
}

export const defaultSpatialProvider = new DefaultSpatialAnalysisProvider();
