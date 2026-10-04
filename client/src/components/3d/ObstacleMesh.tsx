import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ObstacleState } from '../../simulation/types/simulationTypes';

interface ObstacleMeshProps {
  obstacle: ObstacleState;
  onMoveToExitA: () => void;
  onMoveToCorridor: () => void;
  onMoveToNeutral: () => void;
}

export const ObstacleMesh: React.FC<ObstacleMeshProps> = ({
  obstacle,
  onMoveToExitA,
  onMoveToNeutral,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const strobeRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);

  const isBlockingExitA = obstacle.isBlockingExitA;
  const [ox, oy, oz] = obstacle.position;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (strobeRef.current) {
      strobeRef.current.intensity = isBlockingExitA
        ? 2.5 + Math.sin(t * 10) * 1.5
        : 0.5 + Math.sin(t * 3) * 0.3;
    }
  });

  return (
    <group
      ref={meshRef}
      position={[ox, oy, oz]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (isBlockingExitA) {
          onMoveToNeutral();
        } else {
          onMoveToExitA();
        }
      }}
    >
      {/* Dynamic Strobe Beacon Light */}
      <pointLight
        ref={strobeRef}
        color={isBlockingExitA ? '#F59E0B' : '#2563EB'}
        distance={4}
        intensity={1.2}
        position={[0, 1.2, 0]}
      />

      {/* Cart Lower Base / Chassis */}
      <mesh castShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[1.5, 0.2, 1.1]} />
        <meshStandardMaterial
          color="#64748B"
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* 4 Wheels */}
      <mesh position={[-0.6, 0.06, -0.45]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 12]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0.6, 0.06, -0.45]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 12]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[-0.6, 0.06, 0.45]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 12]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0.6, 0.06, 0.45]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 12]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Vertical Support Struts */}
      <mesh position={[-0.65, 0.65, -0.45]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.7} />
      </mesh>
      <mesh position={[0.65, 0.65, -0.45]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.7} />
      </mesh>
      <mesh position={[-0.65, 0.65, 0.45]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.7} />
      </mesh>
      <mesh position={[0.65, 0.65, 0.45]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.7} />
      </mesh>

      {/* Tubular Push Handle on Cart End (Section 40) */}
      <mesh position={[-0.72, 0.8, -0.42]}>
        <cylinderGeometry args={[0.022, 0.022, 0.7, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.72, 0.8, 0.42]}>
        <cylinderGeometry args={[0.022, 0.022, 0.7, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.72, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.86, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Cargo Box on Cart */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[1.3, 0.7, 0.9]} />
        <meshStandardMaterial
          color={isBlockingExitA ? '#F59E0B' : '#E2E8F0'}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* Hazard Warning Stripes Band */}
      <mesh position={[0, 0.6, 0.46]}>
        <planeGeometry args={[1.2, 0.3]} />
        <meshBasicMaterial
          color={isBlockingExitA ? '#DC2626' : '#F59E0B'}
        />
      </mesh>

      {/* 3D Physical Obstacle Text for VR visibility */}
      <Text
        position={[0, 0.6, 0.465]}
        fontSize={0.075}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {isBlockingExitA ? 'HAZARD OBSTACLE' : 'MOVABLE CART'}
      </Text>

      {/* Top Warning Strobe Dome */}
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={isBlockingExitA ? '#F59E0B' : '#2563EB'}
          emissive={isBlockingExitA ? '#F59E0B' : '#2563EB'}
          emissiveIntensity={isBlockingExitA ? 1.2 : 0.6}
        />
      </mesh>

      {/* Interactive Selection Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]}>
        <ringGeometry args={[1.0, 1.15, 32]} />
        <meshBasicMaterial
          color={hovered ? '#2563EB' : isBlockingExitA ? '#F59E0B' : '#CBD5E1'}
          transparent
          opacity={hovered ? 0.9 : 0.4}
        />
      </mesh>

      {/* Clean Architectural Obstacle Label (Section 40, 45) */}
      <Html position={[0, 1.55, 0]} center distanceFactor={14}>
        <div className="pointer-events-none select-none flex flex-col items-center">
          <div
            className={`px-3 py-1 rounded-lg text-xs font-sans font-bold tracking-wide uppercase border shadow-md transition-all duration-300 ${
              isBlockingExitA
                ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]'
                : 'bg-white/95 text-[#172033] border-[#E2E5E9]'
            }`}
          >
            {isBlockingExitA ? '⚠️ MOVABLE OBSTACLE (ACTIVE)' : 'MOVABLE OBSTACLE'}
          </div>
        </div>
      </Html>
    </group>
  );
};
