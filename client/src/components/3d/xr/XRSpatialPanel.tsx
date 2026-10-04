import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { ConsequenceResult, ObstacleState, ExitZone, Agent } from '../../../simulation/types/simulationTypes';

interface XRSpatialPanelProps {
  consequence: ConsequenceResult;
  obstacle: ObstacleState;
  exits: ExitZone[];
  agents: Agent[];
  position?: [number, number, number];
  onExitXR: () => void;
}

/**
 * Minimal Floating Spatial Information Panel for WebXR.
 * Placed at human standing eye-level (~1.45m).
 * Displays live What-If scenario telemetry, A* rerouting impact,
 * dynamic WHY consequence explanation, and an interactive EXIT XR button.
 */
export const XRSpatialPanel: React.FC<XRSpatialPanelProps> = ({
  consequence,
  obstacle,
  exits,
  agents,
  position = [-1.6, 1.45, -1.8],
  onExitXR,
}) => {
  const [btnHovered, setBtnHovered] = useState(false);

  // Cached edge geometries
  const panelEdgesGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.35, 1.7)), []);
  const btnEdgesGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.15, 0.16)), []);

  // Derive active What-If scenario title
  let whatIfTitle = 'BASELINE (ALL EXITS OPEN)';
  const blockedEx = exits.find(e => e.isBlocked);
  if (blockedEx) {
    whatIfTitle = `${(blockedEx.label || blockedEx.name || 'EXIT').toUpperCase().replace(' (EAST)', '').replace(' (WEST)', '')} BLOCKED`;
  } else if (obstacle.targetBlock === 'corridor') {
    whatIfTitle = 'WEST CORRIDOR BLOCKED';
  } else if (obstacle.isBlockingExitA) {
    whatIfTitle = 'EAST EXIT BLOCKED';
  }

  // Derive Alternative Exit
  let alternativeExit = '—';
  if (consequence.recommendedExit && consequence.recommendedExit !== '—') {
    alternativeExit = consequence.recommendedExit.toUpperCase().replace('✓ ', '');
  } else {
    const openExits = exits.filter(e => !e.isBlocked);
    if (openExits.length > 0) {
      alternativeExit = (openExits[0].label || openExits[0].name).toUpperCase();
    }
  }

  const affectedCount = consequence.affectedPeople || 0;
  const reroutedCount = consequence.reroutedPeople || 0;
  const delaySec = consequence.estimatedDelay || 0;
  const whySentence = consequence.whySentence || 'Baseline active. Run what-if simulation to inspect consequences.';

  return (
    <group position={position} rotation={[0, Math.PI / 4, 0]}>
      {/* Background Panel - Architectural Clean Dark Card */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1.35, 1.7]} />
        <meshStandardMaterial
          color="#0F172A"
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.94}
        />
      </mesh>

      {/* Subtle Architectural Border Rim */}
      <lineSegments geometry={panelEdgesGeo} position={[0, 0, 0.005]}>
        <lineBasicMaterial color="#38BDF8" transparent opacity={0.65} />
      </lineSegments>

      {/* Top Banner Accent */}
      <mesh position={[0, 0.76, 0.006]}>
        <planeGeometry args={[1.33, 0.15]} />
        <meshBasicMaterial color="#1E293B" />
      </mesh>

      {/* Brand Header */}
      <Text
        position={[-0.58, 0.76, 0.012]}
        fontSize={0.065}
        color="#F8FAFC"
        anchorX="left"
        anchorY="middle"
      >
        PREVIA XR
      </Text>

      <Text
        position={[0.58, 0.76, 0.012]}
        fontSize={0.036}
        color="#38BDF8"
        anchorX="right"
        anchorY="middle"
      >
        SPATIAL TWIN
      </Text>

      {/* WHAT-IF Section Header */}
      <Text
        position={[-0.58, 0.58, 0.01]}
        fontSize={0.034}
        color="#94A3B8"
        anchorX="left"
        anchorY="middle"
      >
        WHAT-IF ACTION
      </Text>

      {/* WHAT-IF Value */}
      <Text
        position={[-0.58, 0.51, 0.01]}
        fontSize={0.052}
        color={blockedEx ? '#EF4444' : '#F8FAFC'}
        anchorX="left"
        anchorY="middle"
        maxWidth={1.15}
      >
        {whatIfTitle}
      </Text>

      {/* Divider */}
      <mesh position={[0, 0.44, 0.006]}>
        <planeGeometry args={[1.18, 0.003]} />
        <meshBasicMaterial color="#334155" />
      </mesh>

      {/* Metrics Row 1: AFFECTED & REROUTED */}
      <group position={[0, 0.34, 0.01]}>
        {/* Affected */}
        <Text position={[-0.58, 0.04, 0]} fontSize={0.032} color="#94A3B8" anchorX="left" anchorY="middle">
          AFFECTED
        </Text>
        <Text position={[-0.58, -0.04, 0]} fontSize={0.052} color="#F59E0B" anchorX="left" anchorY="middle">
          {affectedCount} OCCUPANTS
        </Text>

        {/* Rerouted */}
        <Text position={[0.08, 0.04, 0]} fontSize={0.032} color="#94A3B8" anchorX="left" anchorY="middle">
          REROUTED
        </Text>
        <Text position={[0.08, -0.04, 0]} fontSize={0.052} color="#38BDF8" anchorX="left" anchorY="middle">
          {reroutedCount} OCCUPANTS
        </Text>
      </group>

      {/* Metrics Row 2: EST. DELAY & ALTERNATIVE */}
      <group position={[0, 0.18, 0.01]}>
        {/* Estimated Delay */}
        <Text position={[-0.58, 0.04, 0]} fontSize={0.032} color="#94A3B8" anchorX="left" anchorY="middle">
          EST. DELAY
        </Text>
        <Text
          position={[-0.58, -0.04, 0]}
          fontSize={0.052}
          color={delaySec > 0 ? '#EF4444' : '#10B981'}
          anchorX="left"
          anchorY="middle"
        >
          {delaySec > 0 ? `+${delaySec} sec` : '0 sec'}
        </Text>

        {/* Alternative Exit */}
        <Text position={[0.08, 0.04, 0]} fontSize={0.032} color="#94A3B8" anchorX="left" anchorY="middle">
          ALTERNATIVE EXIT
        </Text>
        <Text position={[0.08, -0.04, 0]} fontSize={0.05} color="#10B981" anchorX="left" anchorY="middle" maxWidth={0.55}>
          {alternativeExit}
        </Text>
      </group>

      {/* Divider */}
      <mesh position={[0, 0.08, 0.006]}>
        <planeGeometry args={[1.18, 0.003]} />
        <meshBasicMaterial color="#334155" />
      </mesh>

      {/* WHY Section */}
      <group position={[0, -0.04, 0.01]}>
        <Text position={[-0.58, 0.04, 0]} fontSize={0.032} color="#94A3B8" anchorX="left" anchorY="middle">
          WHY (DYNAMIC CONSEQUENCE)
        </Text>
        <Text
          position={[-0.58, -0.04, 0]}
          fontSize={0.035}
          color="#E2E8F0"
          anchorX="left"
          anchorY="top"
          maxWidth={1.16}
          lineHeight={1.3}
        >
          {whySentence}
        </Text>
      </group>

      {/* EXIT XR Button */}
      <group
        position={[0, -0.62, 0.02]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setBtnHovered(true);
        }}
        onPointerOut={() => setBtnHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onExitXR();
        }}
      >
        <mesh>
          <planeGeometry args={[1.15, 0.16]} />
          <meshStandardMaterial
            color={btnHovered ? '#DC2626' : '#1E293B'}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        <lineSegments geometry={btnEdgesGeo} position={[0, 0, 0.003]}>
          <lineBasicMaterial color={btnHovered ? '#FCA5A5' : '#475569'} />
        </lineSegments>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.048}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          EXIT XR
        </Text>
      </group>
    </group>
  );
};
