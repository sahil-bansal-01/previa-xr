import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSimulation } from '../../contexts/SimulationContext';
import { IndoorFloor } from './IndoorFloor';
import { WallSegments } from './WallSegments';
import { ExitPortal } from './ExitPortal';
import { ObstacleMesh } from './ObstacleMesh';
import { AgentMesh } from './AgentMesh';
import { CameraController } from './CameraController';
import { Eye, Layers, Compass, AlertTriangle, ShieldCheck } from 'lucide-react';

export const SpatialScene: React.FC = () => {
  const {
    walls,
    rooms,
    exits,
    obstacle,
    agents,
    cameraView,
    setCameraView,
    blockExitA,
    blockCorridor,
    clearObstacle,
    timelinePhase,
  } = useSimulation();

  return (
    <div className="relative w-full h-full bg-[#07090e] select-none overflow-hidden">
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 18, 16], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full"
      >
        <color attach="background" args={['#07090e']} />
        <fog attach="fog" args={['#07090e', 22, 45]} />

        {/* Ambient & Directional Lights */}
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[12, 22, 10]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-bias={-0.0005}
        />
        <pointLight position={[-8, 6, -6]} intensity={0.5} color="#38bdf8" />
        <pointLight position={[8, 6, 6]} intensity={0.5} color="#818cf8" />

        <Suspense fallback={null}>
          <CameraController viewMode={cameraView} />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2.15}
            minDistance={8}
            maxDistance={35}
          />

          {/* Floor & Architectural Elements */}
          <IndoorFloor rooms={rooms} />
          <WallSegments walls={walls} />

          {/* Emergency Exit Portals */}
          {exits.map(exit => (
            <ExitPortal
              key={exit.id}
              exit={exit}
              onSelect={() => {
                if (exit.id === 'exit-a') {
                  if (obstacle.isBlockingExitA) {
                    clearObstacle();
                  } else {
                    blockExitA();
                  }
                }
              }}
            />
          ))}

          {/* Movable Obstacle Cart */}
          <ObstacleMesh
            obstacle={obstacle}
            onMoveToExitA={blockExitA}
            onMoveToCorridor={blockCorridor}
            onMoveToNeutral={clearObstacle}
          />

          {/* 10 Simulated People Agents */}
          {agents.map(agent => (
            <AgentMesh key={agent.id} agent={agent} />
          ))}
        </Suspense>
      </Canvas>

      {/* Viewport Floating HUD - Camera & State Tools */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <div className="flex bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-lg p-1 shadow-lg">
          <button
            onClick={() => setCameraView('perspective')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              cameraView === 'perspective'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Perspective 3D Orbit View"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Perspective</span>
          </button>
          <button
            onClick={() => setCameraView('topdown')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              cameraView === 'topdown'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Top-down Tactical Grid View"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tactical 2D</span>
          </button>
          <button
            onClick={() => setCameraView('isometric')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              cameraView === 'isometric'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Isometric Angled View"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Isometric</span>
          </button>
        </div>
      </div>

      {/* Viewport Top Right Status Pill */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg text-xs font-mono font-medium ${
            obstacle.isBlockingExitA
              ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-amber-500/20'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-emerald-500/20'
          }`}
        >
          {obstacle.isBlockingExitA ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>HYPOTHETICAL ACTION: EXIT A BLOCKED</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>BASELINE ENVIRONMENT (CLEAR)</span>
            </>
          )}
        </div>
      </div>

      {/* Floating Center Interaction Hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-slate-300 px-4 py-1.5 rounded-full text-xs font-medium shadow-xl flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Click obstacle or toggle controls to test "What if Exit A becomes blocked?"</span>
        </div>
      </div>
    </div>
  );
};
