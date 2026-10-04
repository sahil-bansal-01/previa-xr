import React, { Suspense, useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { XR, XROrigin, useXR } from '@react-three/xr';
import { useSimulation } from '../../contexts/SimulationContext';
import { IndoorFloor } from './IndoorFloor';
import { WallSegments } from './WallSegments';
import { ExitPortal } from './ExitPortal';
import { ObstacleMesh } from './ObstacleMesh';
import { AgentMesh } from './AgentMesh';
import { PathRibbon } from './PathRibbon';
import { WallSegment, ExitZone, Agent } from '../../simulation/types/simulationTypes';
import { xrStore } from '../../simulation/xr/xrStore';
import { XRSpatialPanel } from './xr/XRSpatialPanel';
import { XREntityInspector, XRSelectableEntity } from './xr/XREntityInspector';

// Section 18, 19, 20: Automatic Camera Fit & Architectural Isometric Framing for Desktop
const AutoFrameCamera: React.FC<{
  walls: WallSegment[];
  exits: ExitZone[];
  orbitRef: React.RefObject<any>;
}> = ({ walls, exits, orbitRef }) => {
  const { camera } = useThree();

  const bounds = useMemo(() => {
    let minX = -10, maxX = 10, minZ = -7, maxZ = 7;
    if (walls && walls.length > 0) {
      minX = Math.min(...walls.map(w => w.x - w.width / 2));
      maxX = Math.max(...walls.map(w => w.x + w.width / 2));
      minZ = Math.min(...walls.map(w => w.z - w.depth / 2));
      maxZ = Math.max(...walls.map(w => w.z + w.depth / 2));
    }
    if (exits && exits.length > 0) {
      exits.forEach(e => {
        minX = Math.min(minX, e.position[0] - 1.2);
        maxX = Math.max(maxX, e.position[0] + 1.2);
        minZ = Math.min(minZ, e.position[2] - 1.2);
        maxZ = Math.max(maxZ, e.position[2] + 1.2);
      });
    }

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const width = Math.max(12, maxX - minX);
    const depth = Math.max(10, maxZ - minZ);
    const largestDimension = Math.max(width, depth * 1.25);

    return { centerX, centerZ, width, depth, largestDimension };
  }, [walls, exits]);

  useEffect(() => {
    const { centerX, centerZ, largestDimension } = bounds;
    const dist = largestDimension * 0.78;
    const downwardRad = (40 * Math.PI) / 180;
    const posY = dist * Math.sin(downwardRad) * 1.6;
    const posZ = centerZ + dist * Math.cos(downwardRad) * 1.35;

    camera.position.set(centerX, posY, posZ);
    camera.lookAt(centerX, 0.4, centerZ);

    if (orbitRef.current) {
      orbitRef.current.target.set(centerX, 0.4, centerZ);
      orbitRef.current.update();
    }
  }, [bounds, camera, orbitRef]);

  return null;
};

// Development-only Navigation Debug Overlay
const NavigationDebugOverlay: React.FC<{ exits: ExitZone[]; agents: Agent[] }> = ({ exits, agents }) => {
  const isDebug =
    typeof window !== 'undefined' &&
    (window.location.search.includes('debug=nav') || (window as any).__PREVIA_DEBUG__);

  if (!isDebug) return null;

  return (
    <group position={[0, 0.03, 0]}>
      {exits.map(ex => {
        const entry = ex.walkableEntryCell || ex.position;
        return (
          <group key={`debug-entry-${ex.id}`} position={[entry[0], 0, entry[2]]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.3, 0.5, 16]} />
              <meshBasicMaterial color="#0284C7" transparent opacity={0.8} />
            </mesh>
            <Html center position={[0, 0.4, 0]}>
              <div className="bg-[#0284C7] text-white font-mono text-[9px] px-1 py-0.5 rounded shadow-xs pointer-events-none whitespace-nowrap">
                ENTRY: {ex.name}
              </div>
            </Html>
          </group>
        );
      })}

      {agents.map(ag => (
        <group key={`debug-agent-${ag.id}`} position={[ag.startPos[0], 0, ag.startPos[2]]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.25, 16]} />
            <meshBasicMaterial color="#EAB308" transparent opacity={0.6} />
          </mesh>
          <Html center position={[0, 0.35, 0]}>
            <div className="bg-[#EAB308] text-black font-mono text-[8px] font-bold px-1 rounded shadow-xs pointer-events-none whitespace-nowrap">
              START {ag.id}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};

/**
 * Inner Scene Content connected to WebXR context and SimulationContext.
 */
const SceneContent: React.FC = () => {
  const {
    walls,
    rooms,
    exits,
    obstacle,
    agents,
    timelinePhase,
    consequence,
    blockExitA,
    blockExitById,
    blockCorridor,
    clearObstacle,
  } = useSimulation();

  const orbitRef = useRef<any>(null);
  const { mode } = useXR();
  const isInXR = mode !== null;

  // Selected entity for XR spatial inspection card
  const [selectedEntity, setSelectedEntity] = useState<XRSelectableEntity | null>(null);

  // Compute safe spawn point inside the digital twin at human scale
  const safeSpawnPos = useMemo<[number, number, number]>(() => {
    const isSafe = (x: number, z: number) => {
      return !walls.some(w => {
        const minX = w.x - w.width / 2 - 0.7;
        const maxX = w.x + w.width / 2 + 0.7;
        const minZ = w.z - w.depth / 2 - 0.7;
        const maxZ = w.z + w.depth / 2 + 0.7;
        return x >= minX && x <= maxX && z >= minZ && z <= maxZ;
      });
    };

    if (isSafe(0, 0)) return [0, 0, 0];
    if (isSafe(0, 1.0)) return [0, 0, 1.0];
    if (isSafe(0, -1.0)) return [0, 0, -1.0];

    for (const r of rooms) {
      if (isSafe(r.x, r.z)) return [r.x, 0, r.z];
    }

    if (exits.length > 0) {
      const avgX = exits.reduce((acc, e) => acc + e.position[0], 0) / exits.length;
      const avgZ = exits.reduce((acc, e) => acc + e.position[2], 0) / exits.length;
      if (isSafe(avgX, avgZ)) return [avgX, 0, avgZ];
    }

    return [0, 0, 0];
  }, [walls, rooms, exits]);

  // Handler to exit WebXR cleanly
  const handleExitXR = useCallback(() => {
    try {
      xrStore.getState().session?.end();
    } catch (e) {
      console.warn('[WebXR] End session error:', e);
    }
  }, []);

  return (
    <>
      {/* Light Architectural Digital Twin Studio */}
      <color attach="background" args={['#F1F5F9']} />
      <fog attach="fog" args={['#F1F5F9', 24, 60]} />

      {/* Ambient & Directional Lights */}
      <ambientLight intensity={isInXR ? 1.0 : 0.8} />
      <directionalLight
        position={[14, 25, 14]}
        intensity={1.25}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-10, 8, -6]} intensity={0.4} color="#94A3B8" />
      <pointLight position={[10, 8, 6]} intensity={0.4} color="#94A3B8" />
      <pointLight position={[0, 9, 0]} intensity={0.3} color="#CBD5E1" />

      {/* Desktop Orbit Controls & Camera Auto-Framing (Disabled when in XR to avoid overriding VR headset tracking) */}
      {!isInXR ? (
        <>
          <OrbitControls
            ref={orbitRef}
            enableDamping
            dampingFactor={0.06}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.25}
            minAzimuthAngle={-Math.PI / 3.5}
            maxAzimuthAngle={Math.PI / 3.5}
            minDistance={6}
            maxDistance={38}
          />
          <AutoFrameCamera walls={walls} exits={exits} orbitRef={orbitRef} />
        </>
      ) : (
        <>
          {/* Human-scale Player Origin: feet at safe floor location (y=0), eye level at ~1.65m driven by 6DOF VR headset */}
          <XROrigin position={safeSpawnPos} />

          {/* Minimal Floating Spatial Information Panel for XR (Section 12, 25) */}
          <XRSpatialPanel
            consequence={consequence}
            obstacle={obstacle}
            exits={exits}
            agents={agents}
            position={[safeSpawnPos[0] - 1.5, 1.45, safeSpawnPos[2] - 1.6]}
            onExitXR={handleExitXR}
          />

          {/* Selected Entity 3D Inspection Card (Section 13) */}
          <XREntityInspector
            entity={selectedEntity}
            agents={agents}
            onClose={() => setSelectedEntity(null)}
          />
        </>
      )}

      {/* Floor & Architectural Elements */}
      <IndoorFloor rooms={rooms} timelinePhase={timelinePhase} />
      <WallSegments walls={walls} />

      {/* Emergency Exit Portals */}
      {exits.map(exit => {
        const recStr = (consequence.recommendedExit || '').toLowerCase();
        const isRec =
          timelinePhase === 'AFTER' &&
          !exit.isBlocked &&
          recStr !== '—' &&
          (recStr.includes(exit.name.toLowerCase()) ||
            recStr.includes(exit.id.toLowerCase()) ||
            (recStr.includes('secondary') && exit.name.toLowerCase().includes('secondary')) ||
            (recStr.includes('south') && exit.name.toLowerCase().includes('south')) ||
            (recStr.includes('west') && exit.name.toLowerCase().includes('west')) ||
            (recStr.includes('main') && exit.name.toLowerCase().includes('main')));

        return (
          <ExitPortal
            key={exit.id}
            exit={exit}
            isRecommended={isRec}
            onSelect={() => {
              setSelectedEntity({ type: 'exit', exit });
              if (exit.isBlocked) {
                clearObstacle();
              } else if (exit.id === 'exit-main' || exit.id === 'exit-a') {
                blockExitA();
              } else {
                blockExitById(exit.id);
              }
            }}
          />
        );
      })}

      {/* Movable Obstacle Cart */}
      <ObstacleMesh
        obstacle={obstacle}
        onMoveToExitA={() => {
          setSelectedEntity({ type: 'obstacle', obstacle });
          blockExitA();
        }}
        onMoveToCorridor={() => {
          setSelectedEntity({ type: 'obstacle', obstacle });
          blockCorridor();
        }}
        onMoveToNeutral={() => {
          setSelectedEntity({ type: 'obstacle', obstacle });
          clearObstacle();
        }}
      />

      {/* Dynamic Path Ribbons rendered in world space */}
      {agents.map((agent, idx) => {
        if (agent.status === 'Reached Exit') return null;
        return (
          <PathRibbon
            key={`ribbon-${agent.id}`}
            waypoints={agent.path}
            baselineWaypoints={timelinePhase === 'AFTER' ? agent.originalPath : undefined}
            color={agent.status === 'Rerouting' ? '#2563EB' : agent.status === 'Unreachable' ? '#DC2626' : '#2563EB'}
            isRerouted={agent.status === 'Rerouting'}
            isUnreachable={agent.status === 'Unreachable' || agent.isUnreachable}
            agentIndex={idx}
          />
        );
      })}

      {/* Simulated People Agents */}
      {agents.map(agent => (
        <AgentMesh key={agent.id} agent={agent} />
      ))}

      {/* Development-only Navigation Debug Overlay */}
      <NavigationDebugOverlay exits={exits} agents={agents} />
    </>
  );
};

export const SpatialScene: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#F1F5F9] select-none overflow-hidden">
      {/* 3D WebGL Canvas with WebXR Store Integration */}
      <Canvas
        shadows
        camera={{ position: [0, 22, 22], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <XR store={xrStore}>
            <SceneContent />
          </XR>
        </Suspense>
      </Canvas>
    </div>
  );
};
