import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { RoomZone } from '../../simulation/types/simulationTypes';

interface IndoorFloorProps {
  rooms: RoomZone[];
}

export const IndoorFloor: React.FC<IndoorFloorProps> = ({ rooms }) => {
  return (
    <group position={[0, -0.01, 0]}>
      {/* Main Base Floor Slab */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[26, 18]} />
        <meshStandardMaterial
          color="#0b0f19"
          roughness={0.6}
          metalness={0.25}
        />
      </mesh>

      {/* Grid Lines on Floor */}
      <gridHelper
        args={[26, 26, '#334155', '#1e293b']}
        position={[0, 0.005, 0]}
      />

      {/* Central Concourse Corridor Floor Marking */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <planeGeometry args={[22, 2.5]} />
        <meshBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.06}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <planeGeometry args={[2.5, 14]} />
        <meshBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.06}
        />
      </mesh>

      {/* Room Floor Decals & 3D Spatial Zone Labels */}
      {rooms.map(room => (
        <group key={room.id} position={[room.x, 0.01, room.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[room.width - 0.4, room.depth - 0.4]} />
            <meshStandardMaterial
              color="#111827"
              roughness={0.8}
              transparent
              opacity={0.85}
            />
          </mesh>

          {/* Subtle room boundary line */}
          <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(room.width - 0.4, room.depth - 0.4)]} />
            <lineBasicMaterial color="#334155" />
          </lineSegments>

          {/* Floating Room Label */}
          <Html position={[0, 0.1, 0]} center transform rotation={[-Math.PI / 2, 0, 0]}>
            <div className="pointer-events-none select-none px-2 py-1 rounded bg-slate-950/70 border border-slate-700/40 text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase whitespace-nowrap">
              {room.name}
            </div>
          </Html>
        </group>
      ))}

      {/* Central Corridor Floor Marker */}
      <Html position={[0, 0.05, 0]} center transform rotation={[-Math.PI / 2, 0, 0]}>
        <div className="pointer-events-none select-none px-2.5 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-800/40 text-[9px] font-mono font-bold text-cyan-400 tracking-widest uppercase">
          MAIN CENTRAL CONCOURSE
        </div>
      </Html>

      {/* Outer Raised Facility Perimeter Curb */}
      <mesh position={[0, 0.1, -9]}>
        <boxGeometry args={[26.4, 0.25, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 9]}>
        <boxGeometry args={[26.4, 0.25, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      <mesh position={[-13, 0.1, 0]}>
        <boxGeometry args={[0.4, 0.25, 18.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      <mesh position={[13, 0.1, 0]}>
        <boxGeometry args={[0.4, 0.25, 18.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
    </group>
  );
};
