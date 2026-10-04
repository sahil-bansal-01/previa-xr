import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';
import { ExitZone, ObstacleState, Agent } from '../../../simulation/types/simulationTypes';

export type XRSelectableEntity =
  | { type: 'exit'; exit: ExitZone }
  | { type: 'obstacle'; obstacle: ObstacleState };

interface XREntityInspectorProps {
  entity: XRSelectableEntity | null;
  agents: Agent[];
  onClose: () => void;
}

/**
 * 3D Spatial Information Card for XR interaction.
 * Displays when a user selects an exit portal or movable obstacle in XR.
 * Uses Billboard orientation so it smoothly faces the user in 3D space.
 */
export const XREntityInspector: React.FC<XREntityInspectorProps> = ({
  entity,
  agents,
  onClose,
}) => {
  const panelEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.85, 0.6)), []);

  if (!entity) return null;

  if (entity.type === 'exit') {
    const { exit } = entity;
    const isBlocked = exit.isBlocked;
    const exitName = (exit.label || exit.name || 'EXIT').toUpperCase().replace(' (EAST)', '').replace(' (WEST)', '');
    
    // Count occupants assigned to or affected by this exit
    const assignedAgents = agents.filter(
      a => a.targetExit === exit.id || a.originalExit === exit.id || a.baselineExit === exit.id
    );
    const affectedAgents = isBlocked ? assignedAgents.length : 0;

    const pos: [number, number, number] = [
      exit.position[0] > 0 ? exit.position[0] - 0.5 : exit.position[0] < 0 ? exit.position[0] + 0.5 : exit.position[0],
      2.9,
      exit.position[2] > 0 ? exit.position[2] - 0.5 : exit.position[2] < 0 ? exit.position[2] + 0.5 : exit.position[2],
    ];

    return (
      <group position={pos}>
        <Billboard follow lockX={false} lockY={false} lockZ={false}>
          {/* Card Background */}
          <mesh onClick={(e) => e.stopPropagation()}>
            <planeGeometry args={[0.85, 0.6]} />
            <meshStandardMaterial
              color="#0F172A"
              roughness={0.25}
              metalness={0.1}
              transparent
              opacity={0.95}
            />
          </mesh>

          {/* Border */}
          <lineSegments geometry={panelEdges} position={[0, 0, 0.004]}>
            <lineBasicMaterial color={isBlocked ? '#EF4444' : '#10B981'} transparent opacity={0.8} />
          </lineSegments>

          {/* Top Title */}
          <Text
            position={[-0.38, 0.22, 0.01]}
            fontSize={0.045}
            color="#F8FAFC"
            anchorX="left"
            anchorY="middle"
          >
            {exitName}
          </Text>

          {/* Close button X */}
          <group
            position={[0.36, 0.22, 0.01]}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <mesh>
              <planeGeometry args={[0.07, 0.07]} />
              <meshBasicMaterial color="#334155" />
            </mesh>
            <Text position={[0, 0, 0.01]} fontSize={0.04} color="#94A3B8" anchorX="center" anchorY="middle">
              ✕
            </Text>
          </group>

          {/* Divider */}
          <mesh position={[0, 0.16, 0.005]}>
            <planeGeometry args={[0.76, 0.002]} />
            <meshBasicMaterial color="#334155" />
          </mesh>

          {/* STATUS */}
          <Text position={[-0.38, 0.1, 0.01]} fontSize={0.026} color="#94A3B8" anchorX="left" anchorY="middle">
            STATUS
          </Text>
          <Text
            position={[-0.38, 0.04, 0.01]}
            fontSize={0.04}
            color={isBlocked ? '#EF4444' : '#10B981'}
            anchorX="left"
            anchorY="middle"
          >
            {isBlocked ? 'BLOCKED' : 'OPERATIONAL'}
          </Text>

          {/* AFFECTED */}
          <Text position={[-0.38, -0.05, 0.01]} fontSize={0.026} color="#94A3B8" anchorX="left" anchorY="middle">
            AFFECTED OCCUPANTS
          </Text>
          <Text
            position={[-0.38, -0.11, 0.01]}
            fontSize={0.038}
            color={affectedAgents > 0 ? '#F59E0B' : '#38BDF8'}
            anchorX="left"
            anchorY="middle"
          >
            {affectedAgents > 0 ? `${affectedAgents} OCCUPANTS` : `${assignedAgents.length} ON ROUTE`}
          </Text>

          {/* Bottom dismiss hint */}
          <Text position={[0, -0.22, 0.01]} fontSize={0.022} color="#64748B" anchorX="center" anchorY="middle">
            SELECT AGAIN TO TOGGLE STATE
          </Text>
        </Billboard>
      </group>
    );
  }

  // Obstacle Entity Card
  const { obstacle } = entity;
  const isBlocking = obstacle.isBlockingExitA || obstacle.targetBlock !== 'none';
  const pos: [number, number, number] = [
    obstacle.position[0],
    obstacle.position[1] + 1.8,
    obstacle.position[2],
  ];

  return (
    <group position={pos}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Card Background */}
        <mesh onClick={(e) => e.stopPropagation()}>
          <planeGeometry args={[0.85, 0.55]} />
          <meshStandardMaterial
            color="#0F172A"
            roughness={0.25}
            metalness={0.1}
            transparent
            opacity={0.95}
          />
        </mesh>

        {/* Border */}
        <lineSegments geometry={panelEdges} position={[0, 0, 0.004]}>
          <lineBasicMaterial color={isBlocking ? '#F59E0B' : '#38BDF8'} transparent opacity={0.8} />
        </lineSegments>

        {/* Top Title */}
        <Text
          position={[-0.38, 0.2, 0.01]}
          fontSize={0.042}
          color="#F8FAFC"
          anchorX="left"
          anchorY="middle"
        >
          MOVABLE OBSTACLE
        </Text>

        {/* Close button X */}
        <group
          position={[0.36, 0.2, 0.01]}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <mesh>
            <planeGeometry args={[0.07, 0.07]} />
            <meshBasicMaterial color="#334155" />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.04} color="#94A3B8" anchorX="center" anchorY="middle">
            ✕
          </Text>
        </group>

        {/* Divider */}
        <mesh position={[0, 0.14, 0.005]}>
          <planeGeometry args={[0.76, 0.002]} />
          <meshBasicMaterial color="#334155" />
        </mesh>

        {/* STATUS */}
        <Text position={[-0.38, 0.07, 0.01]} fontSize={0.026} color="#94A3B8" anchorX="left" anchorY="middle">
          STATUS
        </Text>
        <Text
          position={[-0.38, 0.01, 0.01]}
          fontSize={0.038}
          color={isBlocking ? '#F59E0B' : '#94A3B8'}
          anchorX="left"
          anchorY="middle"
        >
          {isBlocking ? 'ACTIVE (BLOCKING)' : 'IN STORAGE ALCOVE'}
        </Text>

        {/* TARGET LOCATION */}
        <Text position={[-0.38, -0.07, 0.01]} fontSize={0.026} color="#94A3B8" anchorX="left" anchorY="middle">
          CURRENT HAZARD
        </Text>
        <Text position={[-0.38, -0.13, 0.01]} fontSize={0.034} color="#E2E8F0" anchorX="left" anchorY="middle">
          {obstacle.name || 'Industrial Cart'}
        </Text>

        {/* Bottom hint */}
        <Text position={[0, -0.21, 0.01]} fontSize={0.022} color="#64748B" anchorX="center" anchorY="middle">
          CLICK OBSTACLE TO MOVE
        </Text>
      </Billboard>
    </group>
  );
};
