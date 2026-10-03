import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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
        color={isBlockingExitA ? '#f59e0b' : '#38bdf8'}
        distance={4}
        intensity={2}
        position={[0, 1.2, 0]}
      />

      {/* Cart Lower Base / Chassis */}
      <mesh castShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[1.5, 0.2, 1.1]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* 4 Wheels */}
      <mesh position={[-0.6, 0.06, -0.45]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.6, 0.06, -0.45]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-0.6, 0.06, 0.45]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.6, 0.06, 0.45]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Vertical Support Struts */}
      <mesh position={[-0.65, 0.65, -0.45]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      <mesh position={[0.65, 0.65, -0.45]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      <mesh position={[-0.65, 0.65, 0.45]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      <mesh position={[0.65, 0.65, 0.45]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>

      {/* Heavy Cargo / Debris Box on Cart */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[1.3, 0.7, 0.9]} />
        <meshStandardMaterial
          color={isBlockingExitA ? '#b45309' : '#1e293b'}
          roughness={0.4}
          metalness={0.4}
        />
      </mesh>

      {/* Hazard Warning Stripes Band */}
      <mesh position={[0, 0.6, 0.46]}>
        <planeGeometry args={[1.2, 0.3]} />
        <meshBasicMaterial
          color={isBlockingExitA ? '#ef4444' : '#f59e0b'}
        />
      </mesh>

      {/* Top Warning Strobe Dome */}
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={isBlockingExitA ? '#f59e0b' : '#38bdf8'}
          emissive={isBlockingExitA ? '#f59e0b' : '#38bdf8'}
          emissiveIntensity={isBlockingExitA ? 2 : 1}
        />
      </mesh>

      {/* Interactive Selection Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]}>
        <ringGeometry args={[1.0, 1.15, 32]} />
        <meshBasicMaterial
          color={hovered ? '#00f0ff' : isBlockingExitA ? '#f59e0b' : '#334155'}
          transparent
          opacity={hovered ? 0.8 : 0.4}
        />
      </mesh>

      {/* Floating 3D Interaction Hint */}
      <Html position={[0, 1.6, 0]} center distanceFactor={14}>
        <div className="pointer-events-none select-none flex flex-col items-center">
          <div
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold tracking-wide uppercase border shadow-xl transition-all duration-300 ${
              isBlockingExitA
                ? 'bg-amber-950/90 text-amber-200 border-amber-500/80 shadow-amber-500/30'
                : 'bg-slate-900/90 text-cyan-300 border-cyan-500/60 shadow-cyan-500/20'
            }`}
          >
            {isBlockingExitA ? '⚠️ OBSTACLE BLOCKING EXIT A' : '📦 MOVABLE OBSTACLE'}
          </div>
          <div className="text-[9px] font-sans font-medium text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-full mt-1 border border-white/10 backdrop-blur-sm whitespace-nowrap">
            {isBlockingExitA
              ? 'Click to remove obstacle'
              : 'Click to place at Exit A'}
          </div>
        </div>
      </Html>
    </group>
  );
};
