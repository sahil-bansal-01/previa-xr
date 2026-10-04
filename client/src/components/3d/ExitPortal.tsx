import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ExitZone } from '../../simulation/types/simulationTypes';

interface ExitPortalProps {
  exit: ExitZone;
  onSelect?: () => void;
  isRecommended?: boolean;
}

export const ExitPortal: React.FC<ExitPortalProps> = ({ exit, onSelect, isRecommended = false }) => {
  const beaconRef = useRef<THREE.Mesh>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);

  const isBlocked = exit.isBlocked;
  const activeColor = isBlocked ? '#DC2626' : isRecommended ? '#16A34A' : '#16A34A';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (beaconRef.current) {
      if (isBlocked) {
        // Fast alert pulsing
        const scale = 1 + Math.sin(t * 6) * 0.15;
        beaconRef.current.scale.set(scale, scale, scale);
      } else if (isRecommended) {
        // Smooth emphasis breathing
        const scale = 1 + Math.sin(t * 3.5) * 0.12;
        beaconRef.current.scale.set(scale, scale, scale);
      } else {
        const scale = 1 + Math.sin(t * 2) * 0.05;
        beaconRef.current.scale.set(scale, scale, scale);
      }
    }
    if (glowLightRef.current) {
      glowLightRef.current.intensity = isBlocked
        ? 1.5 + Math.sin(t * 8) * 0.8
        : isRecommended
        ? 1.8 + Math.sin(t * 4) * 0.5
        : 1.0 + Math.sin(t * 3) * 0.2;
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
          opacity={isBlocked ? 0.35 : isRecommended ? 0.38 : 0.2}
        />
      </mesh>

      {/* Alternative Exit Pulse Ring on Floor */}
      {isRecommended && !isBlocked && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
          <ringGeometry args={[1.2, 1.6, 32]} />
          <meshBasicMaterial color="#16A34A" transparent opacity={0.4} />
        </mesh>
      )}

      {/* Point Light Illuminating Entrance */}
      <pointLight
        ref={glowLightRef}
        color={activeColor}
        distance={5}
        intensity={isRecommended ? 1.6 : 1.2}
        position={[0, 1.8, 0]}
      />

      {/* Door Archway Frame */}
      {/* Left Pillar */}
      <mesh position={[-0.8, 1.2, 0]}>
        <boxGeometry args={[0.15, 2.4, 0.3]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Right Pillar */}
      <mesh position={[0.8, 1.2, 0]}>
        <boxGeometry args={[0.15, 2.4, 0.3]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Top Header Beam */}
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[1.75, 0.2, 0.3]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Illuminated Sign Plate */}
      <mesh ref={beaconRef} position={[0, 2.55, 0]}>
        <boxGeometry args={[1.5, 0.28, 0.1]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={isBlocked ? 0.8 : isRecommended ? 0.7 : 0.4}
          roughness={0.3}
        />
      </mesh>

      {/* 3D Physical Exit Name Embossed for XR Immersion */}
      <Text
        position={[0, 2.55, 0.056]}
        fontSize={0.11}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {isBlocked
          ? 'BLOCKED'
          : (exit.label || exit.name || 'EXIT').toUpperCase().replace(' (EAST)', '').replace(' (WEST)', '')}
      </Text>
      <Text
        position={[0, 2.55, -0.056]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.11}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {isBlocked
          ? 'BLOCKED'
          : (exit.label || exit.name || 'EXIT').toUpperCase().replace(' (EAST)', '').replace(' (WEST)', '')}
      </Text>

      {/* Hazard Warning Barricade tape when blocked */}
      {isBlocked && (
        <group position={[0, 1.0, 0]}>
          <mesh rotation={[0, 0, 0.1]}>
            <boxGeometry args={[1.6, 0.12, 0.05]} />
            <meshStandardMaterial color="#DC2626" />
          </mesh>
          <mesh rotation={[0, 0, -0.1]} position={[0, -0.3, 0]}>
            <boxGeometry args={[1.6, 0.12, 0.05]} />
            <meshStandardMaterial color="#F59E0B" />
          </mesh>
        </group>
      )}

      {/* Clean Architectural Exit Label (Section 30, 31, 45) */}
      <Html position={[0, 2.9, 0]} center distanceFactor={14}>
        <div className="pointer-events-none select-none flex flex-col items-center">
          <div
            className={`px-3 py-1 rounded-lg text-xs font-sans font-bold tracking-wider uppercase border shadow-md whitespace-nowrap transition-all duration-300 ${
              isBlocked
                ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]'
                : isRecommended
                ? 'bg-[#F0FDF4] text-[#16A34A] border-[#86EFAC] ring-2 ring-[#16A34A]/20'
                : 'bg-white/95 text-[#172033] border-[#E2E5E9]'
            }`}
          >
            {isBlocked
              ? `${(exit.label || exit.name || 'EXIT').toUpperCase().replace(' (EAST)', '').replace(' (WEST)', '')} (BLOCKED)`
              : isRecommended
              ? `✓ ${(exit.label || exit.name || 'EXIT').toUpperCase().replace(' (EAST)', '').replace(' (WEST)', '')}`
              : (exit.label || exit.name || 'EXIT').toUpperCase().replace(' (EAST)', '').replace(' (WEST)', '')}
          </div>
        </div>
      </Html>
    </group>
  );
};
