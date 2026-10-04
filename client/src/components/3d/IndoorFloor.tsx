import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { RoomZone } from '../../simulation/types/simulationTypes';
import { useSimulation } from '../../contexts/SimulationContext';

interface IndoorFloorProps {
  rooms: RoomZone[];
  timelinePhase?: string;
}

export const IndoorFloor: React.FC<IndoorFloorProps> = ({ rooms, timelinePhase }) => {
  const { consequence, obstacle, exits } = useSimulation();
  const isAfterSimulation = timelinePhase === 'AFTER';
  const hotspots = consequence?.congestionHotspots || [];

  return (
    <group position={[0, -0.01, 0]}>
      {/* Main Base Floor Slab - Light Clean Architectural Ground #E9EDF2 (Section 27) */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[26, 18]} />
        <meshStandardMaterial
          color="#E9EDF2"
          roughness={0.9}
          metalness={0.02}
        />
      </mesh>

      {/* Ultra Subtle Grid - Architecture Dominates (Section 27, 45) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[24, 16]} />
        <meshBasicMaterial
          color="#CBD5E1"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Circulation Corridors - Distinct Movement Flooring #D8DFE8 (Section 24) */}
      {/* Central East-West Main Circulation Artery */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[20.4, 3.2]} />
        <meshBasicMaterial
          color="#D8DFE8"
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* South Connecting Corridor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 4.3]}>
        <planeGeometry args={[3.0, 5.4]} />
        <meshBasicMaterial
          color="#D8DFE8"
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Exit Area Subtle Floor Accents (Section 23) */}
      {exits.map(ex => (
        <mesh
          key={`exit-floor-${ex.id}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[ex.position[0] > 0 ? ex.position[0] - 0.7 : ex.position[0] < 0 ? ex.position[0] + 0.7 : 0, 0.006, ex.position[2] > 0 ? ex.position[2] - 0.7 : 0]}
        >
          <planeGeometry args={[1.8, 1.4]} />
          <meshBasicMaterial
            color={ex.isBlocked ? '#FEE2E2' : '#DCFCE7'}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}

      {/* Blocked Obstacle Zone Floor Tint (Section 23) */}
      {obstacle.targetBlock !== 'none' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[obstacle.position[0], 0.007, obstacle.position[2]]}>
          <planeGeometry args={[2.2, 1.8]} />
          <meshBasicMaterial color="#FEF2F2" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Architectural Doorway Floor Thresholds with simple frame lines (Section 28) */}
      {[
        { id: 'door-a', x: -4.8, z: -1.6, w: 2.4, d: 0.5 },
        { id: 'door-b', x: 4.8, z: -1.6, w: 2.4, d: 0.5 },
        { id: 'door-c', x: -4.8, z: 1.6, w: 2.4, d: 0.5 },
        { id: 'door-d', x: 4.8, z: 1.6, w: 2.4, d: 0.5 },
      ].map(door => (
        <group key={door.id} position={[door.x, 0.008, door.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[door.w, door.d]} />
            <meshBasicMaterial color="#CBD5E1" transparent opacity={0.8} />
          </mesh>
          <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(door.w, door.d)]} />
            <lineBasicMaterial color="#94A3B8" />
          </lineSegments>
        </group>
      ))}

      {/* Central Corridor Clean Architectural Label (Section 29) */}
      <Html position={[0, 0.04, 0]} center transform rotation={[-Math.PI / 2, 0, 0]}>
        <div className="pointer-events-none select-none px-2.5 py-0.5 rounded bg-white/80 border border-[#CBD5E1] text-[9px] font-sans font-bold text-[#475569] tracking-widest uppercase whitespace-nowrap shadow-2xs">
          CENTRAL CORRIDOR
        </div>
      </Html>

      {/* Subtle Corridor Hotspots - Follows actual high-traffic corridors (Section 42) */}
      {isAfterSimulation && hotspots.length > 0 && (
        <group position={[0, 0.012, 0]}>
          {hotspots.map((spot, idx) => {
            const isHigh = spot.level === 'HIGH';
            const isMed = spot.level === 'MEDIUM';
            const color = isHigh ? '#DC2626' : isMed ? '#F59E0B' : '#2563EB';
            const radius = isHigh ? 1.4 : isMed ? 1.0 : 0.75;
            const opacity = isHigh ? 0.24 : isMed ? 0.16 : 0.10;

            return (
              <mesh key={`hotspot-${idx}`} rotation={[-Math.PI / 2, 0, 0]} position={[spot.x, 0, spot.z]}>
                <circleGeometry args={[radius, 24]} />
                <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Rooms: Very light neutral room floors with clean boundaries (Section 23, 29) */}
      {rooms.map(room => {
        // Enforce strictly: ROOM A, ROOM B, ROOM C, ROOM D (Section 29)
        let shortLabel = 'ROOM A';
        if (room.name.includes('Room B') || room.id.includes('2')) shortLabel = 'ROOM B';
        else if (room.name.includes('Room C') || room.id.includes('3')) shortLabel = 'ROOM C';
        else if (room.name.includes('Room D') || room.id.includes('4')) shortLabel = 'ROOM D';
        else if (room.name.includes('Room A') || room.id.includes('1')) shortLabel = 'ROOM A';
        else shortLabel = room.name.toUpperCase();

        return (
          <group key={room.id} position={[room.x, 0.009, room.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[Math.max(1, room.width - 0.2), Math.max(1, room.depth - 0.2)]} />
              <meshStandardMaterial
                color="#F8FAFC"
                roughness={0.85}
              />
            </mesh>

            {/* Subtle architectural room boundary edge line */}
            <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
              <edgesGeometry args={[new THREE.PlaneGeometry(Math.max(1, room.width - 0.2), Math.max(1, room.depth - 0.2))]} />
              <lineBasicMaterial color="#CBD5E1" />
            </lineSegments>

            {/* Clean Attached Room Label (Section 29) */}
            <Html position={[0, 0.04, 0]} center transform rotation={[-Math.PI / 2, 0, 0]}>
              <div className="pointer-events-none select-none px-2 py-0.5 rounded bg-white/90 border border-[#E2E5E9] text-[10px] font-sans font-bold text-[#334155] tracking-wider uppercase whitespace-nowrap shadow-xs">
                {shortLabel}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
