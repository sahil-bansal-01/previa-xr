import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import {
  Play,
  RotateCcw,
  AlertOctagon,
  Sparkles,
  MapPin,
  Move,
  Layers,
  CheckCircle2,
  Sliders,
  Save,
} from 'lucide-react';

interface ScenarioControlsProps {
  onOpenSaveModal: () => void;
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({ onOpenSaveModal }) => {
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

  return (
    <aside className="w-80 h-full flex flex-col glass-panel border-r border-slate-800/80 bg-slate-950/70 z-20 overflow-y-auto">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
            Spatial Scenario Controller
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
        </div>
        <h2 className="text-base font-bold text-slate-100 tracking-tight leading-snug">
          {scenario?.title || 'Campus Academic Complex — North Wing'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
          Indoor emergency simulation with 10 occupants and 3 emergency evacuation portals.
        </p>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* Core Primary Action Button: SIMULATE FUTURE */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>Simulation Execution</span>
            <span className="text-cyan-400">Step 2: Preview</span>
          </label>
          <button
            onClick={simulateFuture}
            disabled={isSimulating}
            className={`w-full group relative overflow-hidden py-3.5 px-4 rounded-xl font-bold tracking-wide text-sm flex items-center justify-center space-x-2.5 transition-all duration-300 shadow-xl ${
              isSimulating
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 cursor-wait'
                : obstacle.isBlockingExitA
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/30 scale-[1.02] border border-cyan-300'
                : 'bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-100 border border-slate-600'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isSimulating ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
            <span className="font-mono uppercase font-extrabold tracking-wider">
              {isSimulating ? 'Calculating Future...' : 'SIMULATE FUTURE'}
            </span>
          </button>
          <p className="text-[10px] text-slate-400 text-center font-mono">
            {timelinePhase === 'ACTION'
              ? '⚡ Obstacle placed. Ready to simulate rerouting.'
              : timelinePhase === 'AFTER'
              ? '✓ Future outcome simulated. Check consequence metrics.'
              : 'Select a hypothetical action below to begin.'}
          </p>
        </div>

        {/* Hypothetical Decisions Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Hypothetical Decisions
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              Interactive
            </span>
          </div>

          {/* Decision Option 1: Block Exit A (Core Demo) */}
          <button
            onClick={blockExitA}
            className={`w-full p-3 rounded-lg border text-left transition-all ${
              obstacle.isBlockingExitA
                ? 'bg-amber-950/40 border-amber-500/70 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <AlertOctagon className={`w-4 h-4 ${obstacle.isBlockingExitA ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className={`text-xs font-semibold ${obstacle.isBlockingExitA ? 'text-amber-200' : 'text-slate-200'}`}>
                  Block Emergency Exit A
                </span>
              </div>
              <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-bold">
                DEMO PRESET
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 pl-6">
              Places heavy debris trolley blocking primary access to Exit A.
            </p>
          </button>

          {/* Decision Option 2: Block Central Concourse */}
          <button
            onClick={blockCorridor}
            className={`w-full p-3 rounded-lg border text-left transition-all ${
              obstacle.targetBlock === 'corridor'
                ? 'bg-amber-950/40 border-amber-500/70 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Move className={`w-4 h-4 ${obstacle.targetBlock === 'corridor' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className={`text-xs font-semibold ${obstacle.targetBlock === 'corridor' ? 'text-amber-200' : 'text-slate-200'}`}>
                Block Central Concourse
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 pl-6">
              Blocks main interior crossway connecting east and west halls.
            </p>
          </button>

          {/* Decision Option 3: Reset to Baseline */}
          <button
            onClick={clearObstacle}
            className={`w-full p-2.5 rounded-lg border text-left transition-all ${
              !obstacle.isBlockingExitA && obstacle.targetBlock === 'none'
                ? 'bg-emerald-950/40 border-emerald-500/50'
                : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className={`w-4 h-4 ${!obstacle.isBlockingExitA && obstacle.targetBlock === 'none' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-xs font-medium text-slate-300">
                Clear All Obstacles (Baseline)
              </span>
            </div>
          </button>
        </div>

        {/* Spatial Environment Stats */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Spatial Environment
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-mono">SIMULATED PEOPLE</span>
              <span className="text-sm font-bold text-slate-100 font-mono">10 Occupants</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-mono">AVAILABLE EXITS</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {obstacle.isBlockingExitA ? '2 of 3 Active' : '3 of 3 Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Scenario Controls & Actions */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
            Management
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={resetScenario}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
              title="Reset environment to original baseline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>RESET SCENARIO</span>
            </button>
            <button
              onClick={onOpenSaveModal}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
              title="Save current state as persistent scenario"
            >
              <Save className="w-3.5 h-3.5 text-cyan-400" />
              <span>Save Scenario</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
