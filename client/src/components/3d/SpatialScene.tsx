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
    blockExitById,
    blockCorridor,
    clearObstacle,
  } = useSimulation();

  return (
    <div className="relative w-full h-full bg-[#07090e] select-none overflow-hidden">
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 16, 17], fov: 48 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full"
      >
        <color attach="background" args={['#07090e']} />
        <fog attach="fog" args={['#07090e', 24, 50]} />

        {/* Ambient & Directional Lights for crisp architectural visibility */}
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[12, 24, 12]}
          intensity={1.35}
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
        <pointLight position={[-9, 7, -6]} intensity={0.7} color="#38bdf8" />
        <pointLight position={[9, 7, 6]} intensity={0.7} color="#818cf8" />
        <pointLight position={[0, 8, 0]} intensity={0.5} color="#00f0ff" />

        <Suspense fallback={null}>
          <CameraController viewMode={cameraView} />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2.12}
            minDistance={8}
            maxDistance={38}
          />

          {/* Floor & Architectural Elements */}
          <IndoorFloor rooms={rooms} />
          <WallSegments walls={walls} />

          {/* Emergency Exit Portals (Exit A, Exit B, Exit C or user space exits) */}
          {exits.map(exit => (
            <ExitPortal
              key={exit.id}
              exit={exit}
              onSelect={() => {
                if (exit.isBlocked) {
                  clearObstacle();
                } else if (exit.id === 'exit-a') {
                  blockExitA();
                } else {
                  blockExitById(exit.id);
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

          {/* 10 Simulated People Agents with Dynamic Glowing Path Ribbons */}
          {agents.map(agent => (
            <AgentMesh key={agent.id} agent={agent} />
          ))}
        </Suspense>
      </Canvas>

      {/* Viewport Floating HUD - Camera Controls (Bottom Left of Canvas) */}
      <div className="absolute bottom-24 left-4 z-20 flex items-center space-x-2">
        <div className="flex bg-slate-950/85 backdrop-blur-md border border-slate-700/70 rounded-xl p-1 shadow-2xl">
          <button
            onClick={() => setCameraView('perspective')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all ${
              cameraView === 'perspective'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Perspective 3D Orbit View"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D Orbit</span>
          </button>
          <button
            onClick={() => setCameraView('topdown')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all ${
              cameraView === 'topdown'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Top-down Tactical Grid View"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tactical 2D</span>
          </button>
          <button
            onClick={() => setCameraView('isometric')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all ${
              cameraView === 'isometric'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Isometric Angled View"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Isometric</span>
          </button>
        </div>
      </div>

      {/* Floating Center Interaction Hint */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden md:block">
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-slate-300 px-4 py-1.5 rounded-full text-[11px] font-mono shadow-xl flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Click obstacle or use Step 1 to test: "What if Exit A becomes blocked?"</span>
        </div>
      </div>
    </div>
  );
};
