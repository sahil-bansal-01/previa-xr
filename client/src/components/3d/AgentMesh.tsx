import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Agent } from '../../simulation/types/simulationTypes';
import { PathRibbon } from './PathRibbon';

interface AgentMeshProps {
  agent: Agent;
}

export const AgentMesh: React.FC<AgentMeshProps> = ({ agent }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const [px, , pz] = agent.currentPos;
  const isRerouting = agent.status === 'Rerouting';
  const isEvacuated = agent.status === 'Reached Exit';
  const isDelayed = agent.status === 'Delayed';

  // Determine accent color
  let statusColor = '#00f0ff';
  if (isRerouting) statusColor = '#f59e0b';
  if (isDelayed) statusColor = '#ef4444';
  if (isEvacuated) statusColor = '#10b981';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      if (isRerouting || isDelayed) {
        const s = 1 + Math.sin(t * 6) * 0.2;
        ringRef.current.scale.set(s, s, s);
      } else {
        const s = 1 + Math.sin(t * 2) * 0.05;
        ringRef.current.scale.set(s, s, s);
      }
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {/* Path Ribbon Projected on Floor */}
      {!isEvacuated && (
        <PathRibbon
          waypoints={agent.path}
          color={statusColor}
          isRerouted={isRerouting}
        />
      )}

      {/* Ground Glowing Halo Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.35, 0.45, 24]} />
        <meshBasicMaterial
          color={statusColor}
          transparent
          opacity={isEvacuated ? 0.4 : 0.85}
        />
      </mesh>

      {/* 3D Human Avatar Model */}
      <group position={[0, 0, 0]}>
        {/* Legs / Lower Body */}
        <mesh castShadow position={[-0.1, 0.3, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.5, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0.1, 0.3, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.5, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>

        {/* Torso */}
        <mesh castShadow position={[0, 0.8, 0]}>
          <boxGeometry args={[0.38, 0.55, 0.24]} />
          <meshStandardMaterial
            color={statusColor}
            metalness={0.2}
            roughness={0.4}
          />
        </mesh>

        {/* Head */}
        <mesh castShadow position={[0, 1.25, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>

        {/* Tactical Visor / Holographic HUD Ring */}
        <mesh position={[0, 1.25, 0.08]}>
          <boxGeometry args={[0.22, 0.06, 0.12]} />
          <meshBasicMaterial color={statusColor} />
        </mesh>
      </group>

      {/* Floating 3D HUD Tag */}
      <Html position={[0, 1.65, 0]} center distanceFactor={14}>
        <div className="pointer-events-none select-none flex flex-col items-center">
          <div
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight whitespace-nowrap border shadow-md transition-colors ${
              isRerouting
                ? 'bg-amber-950/90 text-amber-200 border-amber-500/80 animate-pulse'
                : isEvacuated
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80'
                : isDelayed
                ? 'bg-red-950/90 text-red-200 border-red-500/80'
                : 'bg-slate-900/90 text-cyan-200 border-cyan-500/50'
            }`}
          >
            {agent.name.split(' ')[0]} • {agent.status}
          </div>
        </div>
      </Html>
    </group>
  );
};
