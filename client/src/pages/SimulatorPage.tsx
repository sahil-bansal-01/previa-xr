import React, { useState } from 'react';
import { SpatialScene } from '../components/3d/SpatialScene';
import { ScenarioControls } from '../components/ui/ScenarioControls';
import { ConsequencePanel } from '../components/ui/ConsequencePanel';
import { TimelineBar } from '../components/ui/TimelineBar';
import { SaveScenarioModal } from '../components/modals/SaveScenarioModal';
import { useSimulation } from '../contexts/SimulationContext';
import { Loader2 } from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const { loading } = useSimulation();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#07090e] text-slate-300">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <span className="font-mono text-xs uppercase tracking-widest text-cyan-300">
          Loading Spatial Environment & Pathfinding Grid...
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#07090e]">
      {/* Main Simulation Viewport & Sidebars */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Scenario Controls */}
        <ScenarioControls onOpenSaveModal={() => setSaveModalOpen(true)} />

        {/* Center: Large 3D Spatial Environment */}
        <main className="flex-1 h-full relative overflow-hidden">
          <SpatialScene />
        </main>

        {/* Right: Live Consequence Analysis */}
        <ConsequencePanel />
      </div>

      {/* Bottom: Simulation Timeline & Action State */}
      <TimelineBar />

      {/* Save Scenario Modal */}
      <SaveScenarioModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
      />
    </div>
  );
};
