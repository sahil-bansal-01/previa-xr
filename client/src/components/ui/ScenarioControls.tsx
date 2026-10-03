import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import {
  RotateCcw,
  AlertOctagon,
  Sparkles,
  Move,
  CheckCircle2,
  Save,
  ChevronLeft,
  ChevronRight,
  Sliders,
} from 'lucide-react';

interface ScenarioControlsProps {
  onOpenSaveModal: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  onOpenSaveModal,
  isOpen,
  onToggle,
}) => {
  const {
    scenario,
    obstacle,
    blockExitA,
    blockCorridor,
    clearObstacle,
    simulateFuture,
    resetScenario,
    isSimulating,
    timelinePhase,
  } = useSimulation();

  if (!isOpen) {
    return (
      <div className="absolute top-20 left-4 z-20">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 text-cyan-300 hover:text-cyan-200 font-mono text-xs font-bold shadow-2xl transition-all hover:scale-105"
          title="Open Step 1: Decision Controls"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>STEP 1: CONTROLS</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
    );
  }

  return (
    <aside className="absolute top-20 left-4 z-20 w-80 max-h-[calc(100vh-12rem)] flex flex-col bg-slate-950/85 backdrop-blur-2xl border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-left-4 duration-200">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs font-black">
            1
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold block">
              STEP 1: CHOOSE ACTION
            </span>
            <span className="text-xs font-bold text-slate-200 font-mono">
              Hypothetical Decisions
            </span>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Collapse Panel for Full 3D View"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
        {/* Step 1 Instructions */}
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
          Select a hypothetical decision below or drag/click the obstacle directly in the 3D scene to modify navigation paths.
        </div>

        {/* Hypothetical Decision Choices */}
        <div className="space-y-2">
          {/* Decision 1: Block Emergency Exit A */}
          <button
            onClick={blockExitA}
            className={`w-full p-2.5 rounded-xl border text-left transition-all ${
              obstacle.isBlockingExitA
                ? 'bg-amber-950/50 border-amber-500/80 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertOctagon className={`w-4 h-4 ${obstacle.isBlockingExitA ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold font-mono ${obstacle.isBlockingExitA ? 'text-amber-200' : 'text-slate-200'}`}>
                  Block Emergency Exit A
                </span>
              </div>
              <span className="text-[8px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-1 py-0.5 rounded font-bold">
                RECOMMENDED
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 pl-6">
              Places heavy debris trolley blocking corridor access to Exit A.
            </p>
          </button>

          {/* Decision 2: Block Central Concourse */}
          <button
            onClick={blockCorridor}
            className={`w-full p-2.5 rounded-xl border text-left transition-all ${
              obstacle.targetBlock === 'corridor'
                ? 'bg-amber-950/50 border-amber-500/80 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Move className={`w-4 h-4 ${obstacle.targetBlock === 'corridor' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className={`text-xs font-bold font-mono ${obstacle.targetBlock === 'corridor' ? 'text-amber-200' : 'text-slate-200'}`}>
                Block Central Concourse
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 pl-6">
              Blocks central junction connecting north and south campus wings.
            </p>
          </button>

          {/* Decision 3: Clear to Baseline */}
          <button
            onClick={clearObstacle}
            className={`w-full p-2 rounded-xl border text-left transition-all ${
              !obstacle.isBlockingExitA && obstacle.targetBlock === 'none'
                ? 'bg-emerald-950/40 border-emerald-500/60'
                : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className={`w-3.5 h-3.5 ${!obstacle.isBlockingExitA && obstacle.targetBlock === 'none' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[11px] font-medium text-slate-300 font-mono">
                Clear Obstacles (Baseline)
              </span>
            </div>
          </button>
        </div>

        {/* Primary Step 2 Trigger */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
            STEP 2: RUN SIMULATION
          </span>
          <button
            onClick={simulateFuture}
            disabled={isSimulating}
            className={`w-full py-2.5 px-3 rounded-xl font-mono font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-xl ${
              isSimulating
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 cursor-wait'
                : obstacle.isBlockingExitA
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-cyan-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSimulating ? 'Simulating...' : 'SIMULATE FUTURE'}</span>
          </button>
        </div>

        {/* Scenario Controls & Actions */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2">
          <button
            onClick={resetScenario}
            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center justify-center space-x-1.5"
            title="Reset environment"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset</span>
          </button>
          <button
            onClick={onOpenSaveModal}
            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-300 flex items-center justify-center space-x-1.5"
            title="Save scenario"
          >
            <Save className="w-3 h-3 text-cyan-400" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
