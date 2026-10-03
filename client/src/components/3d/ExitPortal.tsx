import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ExitZone } from '../../simulation/types/simulationTypes';

interface ExitPortalProps {
  exit: ExitZone;
  onSelect?: () => void;
}

export const ExitPortal: React.FC<ExitPortalProps> = ({ exit, onSelect }) => {
  const beaconRef = useRef<THREE.Mesh>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);

  const isBlocked = exit.isBlocked;
  const activeColor = isBlocked ? '#ef4444' : exit.color;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (beaconRef.current) {
      if (isBlocked) {
        // Fast alert pulsing
        const scale = 1 + Math.sin(t * 6) * 0.15;
        beaconRef.current.scale.set(scale, scale, scale);
      } else {
        const scale = 1 + Math.sin(t * 2) * 0.05;
        beaconRef.current.scale.set(scale, scale, scale);
      }
    }
    if (glowLightRef.current) {
      glowLightRef.current.intensity = isBlocked
        ? 2.5 + Math.sin(t * 8) * 1.5
        : 1.8 + Math.sin(t * 3) * 0.4;
    }
  });

  const [x, , z] = exit.position;

  return (
    <group position={[x, 0, z]} onClick={onSelect}>
      {/* Floor Entrance Zone Decal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[exit.width || 1.8, 1.4]} />
        <meshBasicMaterial
          color={activeColor}
          transparent
          opacity={isBlocked ? 0.35 : 0.25}
        />
      </mesh>

      {/* Point Light Illuminating Entrance */}
      <pointLight
        ref={glowLightRef}
        color={activeColor}
        distance={6}
        intensity={2}
        position={[0, 1.8, 0]}
      />

      {/* Door Archway Frame */}
      {/* Left Pillar */}
      <mesh position={[-0.8, 1.2, 0]}>
        <boxGeometry args={[0.15, 2.4, 0.3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Right Pillar */}
      <mesh position={[0.8, 1.2, 0]}>
        <boxGeometry args={[0.15, 2.4, 0.3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Top Header Beam */}
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[1.75, 0.2, 0.3]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Illuminated LED Sign Plate */}
      <mesh ref={beaconRef} position={[0, 2.55, 0]}>
        <boxGeometry args={[1.5, 0.28, 0.1]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={isBlocked ? 1.8 : 1.2}
          roughness={0.2}
        />
      </mesh>

      {/* Hazard Warning Barricade tape when blocked */}
      {isBlocked && (
        <group position={[0, 1.0, 0]}>
          <mesh rotation={[0, 0, 0.1]}>
            <boxGeometry args={[1.6, 0.12, 0.05]} />
            <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.8} />
          </mesh>
          <mesh rotation={[0, 0, -0.1]} position={[0, -0.3, 0]}>
            <boxGeometry args={[1.6, 0.12, 0.05]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}

      {/* Floating 3D HUD Badge */}
      <Html position={[0, 3.1, 0]} center distanceFactor={14}>
        <div className="pointer-events-none select-none flex flex-col items-center">
          <div
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold tracking-wider uppercase border shadow-lg whitespace-nowrap transition-all duration-300 ${
              isBlocked
                ? 'bg-red-950/90 text-red-300 border-red-500 shadow-red-500/30 animate-pulse'
                : 'bg-slate-900/90 text-slate-100 border-cyan-500/50 shadow-cyan-500/20'
            }`}
          >
            {isBlocked ? `⚠️ ${exit.name} BLOCKED` : exit.label}
          </div>
          <div
            className={`text-[9px] font-mono mt-0.5 px-1.5 py-0.5 rounded ${
              isBlocked ? 'text-red-400 bg-red-950/70' : 'text-slate-400 bg-slate-900/60'
            }`}
          >
            {isBlocked ? 'Rerouting Required' : exit.capacity}
          </div>
        </div>
      </Html>
    </group>
  );
};
