import React from 'react';
import * as THREE from 'three';
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
          color="#0c101a"
          roughness={0.65}
          metalness={0.2}
        />
      </mesh>

      {/* Grid Lines on Floor */}
      <gridHelper
        args={[26, 26, '#1e293b', '#131b2c']}
        position={[0, 0.005, 0]}
      />

      {/* Room Floor Decals */}
      {rooms.map(room => (
        <group key={room.id} position={[room.x, 0.01, room.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[room.width - 0.4, room.depth - 0.4]} />
            <meshStandardMaterial
              color="#0e1526"
              roughness={0.8}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Subtle room boundary line */}
          <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
            <edgesGeometry args={[new (THREE as any).PlaneGeometry(room.width - 0.4, room.depth - 0.4)]} />
            <lineBasicMaterial color="#1e293b" />
          </lineSegments>
        </group>
      ))}

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
