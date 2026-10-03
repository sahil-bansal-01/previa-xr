import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import {
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Activity,
  Users,
} from 'lucide-react';

export const SimulatorWorkflowBar: React.FC = () => {
  const {
    obstacle,
    timelinePhase,
    isSimulating,
    blockExitA,
    clearObstacle,
    simulateFuture,
    resetScenario,
    consequence,
  } = useSimulation();

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4 pointer-events-none">
      <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 flex items-center justify-between gap-3 pointer-events-auto ring-1 ring-cyan-500/20">
        {/* STEP 1: CHOOSE ACTION */}
        <div
          className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all ${
            timelinePhase === 'BEFORE' || !obstacle.isBlockingExitA
              ? 'bg-slate-900 border border-slate-700/80 shadow-md'
              : 'bg-amber-950/40 border border-amber-500/60 shadow-amber-500/10'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-black ${
              obstacle.isBlockingExitA
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            1
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              STEP 1: CHOOSE ACTION
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <button
                onClick={blockExitA}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                  obstacle.isBlockingExitA
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
                }`}
                title="Place obstacle to block Emergency Exit A"
              >
                Block Exit A
              </button>
              <button
                onClick={clearObstacle}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                  !obstacle.isBlockingExitA && obstacle.targetBlock === 'none'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400'
                }`}
                title="Reset to unobstructed baseline"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-600 shrink-0 hidden sm:block" />

        {/* STEP 2: SIMULATE FUTURE */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={simulateFuture}
            disabled={isSimulating}
            className={`group relative px-4 py-2.5 rounded-xl font-mono font-extrabold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-xl ${
              isSimulating
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-500 cursor-wait'
                : obstacle.isBlockingExitA
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-cyan-500/30 scale-105 ring-2 ring-cyan-400/50 animate-pulse'
                : 'bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-100 border border-slate-600'
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-slate-950/30 flex items-center justify-center text-[10px] font-black">
              2
            </div>
            <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
            <span>{isSimulating ? 'Computing A*...' : 'SIMULATE FUTURE'}</span>
          </button>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-600 shrink-0 hidden sm:block" />

        {/* STEP 3: OBSERVE & ANALYZE */}
        <div
          className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all ${
            timelinePhase === 'AFTER'
              ? 'bg-violet-950/40 border border-violet-500/60 shadow-violet-500/10'
              : 'bg-slate-900/60 border border-slate-800 text-slate-400'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-black ${
              timelinePhase === 'AFTER'
                ? 'bg-violet-500 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            3
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              STEP 3: CONSEQUENCES
            </span>
            <div className="flex items-center space-x-2 mt-0.5 font-mono text-[11px]">
              {timelinePhase === 'AFTER' ? (
                <>
                  <span className="text-amber-300 font-bold">+{consequence.estimatedDelay}s Delay</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-cyan-300 font-bold">{consequence.affectedPeople} Rerouted</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-bold">{consequence.recommendedExit.split(' ')[0]}</span>
                </>
              ) : (
                <span className="text-slate-500">Awaiting Simulation</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Reset Button */}
        <button
          onClick={resetScenario}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-colors shrink-0"
          title="Reset back to baseline"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
