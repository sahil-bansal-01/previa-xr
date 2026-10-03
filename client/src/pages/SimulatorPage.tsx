import React, { useState } from 'react';
import { SpatialScene } from '../components/3d/SpatialScene';
import { ScenarioControls } from '../components/ui/ScenarioControls';
import { ConsequencePanel } from '../components/ui/ConsequencePanel';
import { TimelineBar } from '../components/ui/TimelineBar';
import { SimulatorWorkflowBar } from '../components/ui/SimulatorWorkflowBar';
import { SaveScenarioModal } from '../components/modals/SaveScenarioModal';
import { useSimulation } from '../contexts/SimulationContext';
import { Loader2 } from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const { loading } = useSimulation();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#07090e] text-slate-300">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <span className="font-mono text-xs uppercase tracking-widest text-cyan-300">
          Loading 3D Campus Environment & Pathfinding Grid...
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-[#07090e]">
      {/* Primary Visual Element: Full Viewport 3D Canvas */}
      <main className="absolute inset-0 w-full h-full z-0">
        <SpatialScene />
      </main>

      {/* Top Floating Workflow Bar: STEP 1 → STEP 2 → STEP 3 */}
      <SimulatorWorkflowBar />

      {/* Left Floating HUD: Step 1 Decision Controls */}
      <ScenarioControls
        isOpen={isLeftOpen}
        onToggle={() => setIsLeftOpen(!isLeftOpen)}
        onOpenSaveModal={() => setSaveModalOpen(true)}
      />

      {/* Right Floating HUD: Step 3 Consequence Analysis */}
      <ConsequencePanel
        isOpen={isRightOpen}
        onToggle={() => setIsRightOpen(!isRightOpen)}
      />

      {/* Bottom Floating HUD: Timeline & Action States */}
      <TimelineBar />

      {/* Save Scenario Modal */}
      <SaveScenarioModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
      />
    </div>
  );
};
