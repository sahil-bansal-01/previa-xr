import React from 'react';
import { WallSegment } from '../../simulation/types/simulationTypes';

interface WallSegmentsProps {
  walls: WallSegment[];
}

export const WallSegments: React.FC<WallSegmentsProps> = ({ walls }) => {
  const wallHeight = 1.8;

  return (
    <group>
      {walls.map((wall, index) => {
        return (
          <group key={index} position={[wall.x, wallHeight / 2, wall.z]}>
            {/* Main Wall Solid */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[wall.width, wallHeight, wall.depth]} />
              <meshStandardMaterial
                color="#182234"
                roughness={0.7}
                metalness={0.2}
              />
            </mesh>

            {/* Top Accent Trim Cap */}
            <mesh position={[0, wallHeight / 2 + 0.02, 0]}>
              <boxGeometry args={[wall.width + 0.04, 0.05, wall.depth + 0.04]} />
              <meshStandardMaterial
                color="#334155"
                roughness={0.4}
                metalness={0.5}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
