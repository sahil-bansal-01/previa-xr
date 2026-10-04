import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Agent } from '../../simulation/types/simulationTypes';

interface AgentMeshProps {
  agent: Agent;
}

export const AgentMesh: React.FC<AgentMeshProps> = ({ agent }) => {
  const avatarGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const currentAngleRef = useRef<number>(0);

  const [px, , pz] = agent.currentPos;
  const isUnreachable = agent.status === 'Unreachable' || agent.isUnreachable;
  const isRerouting = agent.status === 'Rerouting';
  const isEvacuated = agent.status === 'Reached Exit';
  const isDelayed = agent.status === 'Delayed';

  // Extract short ID (e.g. P1, P2)
  const shortId = agent.name.match(/\((P\d+)\)/)?.[1] || agent.id.replace('agent-', 'P');

  // Architectural color language (Section 33, 46)
  let statusColor = '#2563EB'; // Normal/Moving: Blue
  if (isRerouting) statusColor = '#F59E0B'; // Rerouted: Amber emphasis
  if (isUnreachable || isDelayed) statusColor = '#DC2626'; // Unreachable: Red
  if (isEvacuated) statusColor = '#16A34A'; // Evacuated: Green

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Subtle ground contact ring pulse
    if (ringRef.current) {
      if (isUnreachable || isDelayed) {
        const s = 1 + Math.sin(t * 8) * 0.25;
        ringRef.current.scale.set(s, s, s);
      } else if (isRerouting) {
        const s = 1 + Math.sin(t * 5) * 0.15;
        ringRef.current.scale.set(s, s, s);
      } else {
        const s = 1 + Math.sin(t * 2) * 0.04;
        ringRef.current.scale.set(s, s, s);
      }
    }

    // Section 35: Smoothly rotate toward travel direction
    if (avatarGroupRef.current && typeof agent.heading === 'number') {
      let diff = (agent.heading - currentAngleRef.current) % (Math.PI * 2);
      if (diff < -Math.PI) diff += Math.PI * 2;
      if (diff > Math.PI) diff -= Math.PI * 2;
      currentAngleRef.current += diff * 0.18;
      avatarGroupRef.current.rotation.y = currentAngleRef.current;
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {/* Subtle Ground Contact Halo */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.3, 0.42, 24]} />
        <meshBasicMaterial
          color={statusColor}
          transparent
          opacity={isEvacuated ? 0.25 : 0.65}
        />
      </mesh>

      {/* 3D Lightweight Architectural Human Avatar (Section 32, 35) */}
      <group ref={avatarGroupRef} position={[0, 0, 0]}>
        {/* Two Legs */}
        <mesh castShadow position={[-0.09, 0.24, 0]}>
          <cylinderGeometry args={[0.055, 0.065, 0.48, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0.09, 0.24, 0]}>
          <cylinderGeometry args={[0.055, 0.065, 0.48, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>

        {/* Torso */}
        <mesh castShadow position={[0, 0.72, 0]}>
          <boxGeometry args={[0.34, 0.5, 0.22]} />
          <meshStandardMaterial
            color={statusColor}
            metalness={0.15}
            roughness={0.4}
          />
        </mesh>

        {/* Head */}
        <mesh castShadow position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
        </mesh>

        {/* Directional Visor to visibly indicate facing direction */}
        <mesh position={[0, 1.15, 0.09]}>
          <boxGeometry args={[0.18, 0.05, 0.08]} />
          <meshBasicMaterial color={statusColor} />
        </mesh>
      </group>

      {/* Clean Minimal Architectural Label (Section 33, 45) */}
      <Html position={[0, 1.55, 0]} center distanceFactor={14}>
        <div className="pointer-events-none select-none flex flex-col items-center">
          {isUnreachable ? (
            <div className="px-2 py-0.5 rounded-md text-[9px] font-sans font-extrabold tracking-wider uppercase bg-[#DC2626] text-white border border-[#B91C1C] shadow-sm whitespace-nowrap">
              {shortId} &bull; UNREACHABLE
            </div>
          ) : isRerouting ? (
            <div className="px-1.5 py-0.5 rounded-md text-[9px] font-sans font-bold tracking-wider uppercase bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] shadow-xs whitespace-nowrap">
              {shortId} &bull; REROUTED
            </div>
          ) : isEvacuated ? (
            <div className="px-1.5 py-0.5 rounded-md text-[9px] font-sans font-bold tracking-wider uppercase bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] shadow-xs whitespace-nowrap">
              {shortId} &bull; SAFE
            </div>
          ) : (
            <div className="px-1.5 py-0.2 rounded-full text-[9px] font-sans font-bold text-[#475569] bg-white/90 border border-[#E2E5E9] shadow-2xs whitespace-nowrap">
              {shortId}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};
