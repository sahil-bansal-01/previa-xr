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
      <div className="bg-white/95 backdrop-blur-md border border-[#E2E5E9] rounded-2xl shadow-md p-2.5 flex items-center justify-between gap-3 pointer-events-auto">
        {/* STEP 1: CHOOSE ACTION */}
        <div
          className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all ${
            obstacle.isBlockingExitA
              ? 'bg-[#FEF2F2] border border-[#FCA5A5]'
              : 'bg-[#F7F8FA] border border-[#E2E5E9]'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-sans font-bold ${
              obstacle.isBlockingExitA
                ? 'bg-[#DC2626] text-white'
                : 'bg-white text-[#172033] border border-[#E2E5E9]'
            }`}
          >
            1
          </div>
          <div>
            <span className="text-[10px] font-sans uppercase tracking-wider text-[#667085] block font-bold">
              STEP 1: CHOOSE ACTION
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <button
                onClick={blockExitA}
                className={`px-2.5 py-1 rounded-lg text-xs font-sans font-semibold transition-all ${
                  obstacle.isBlockingExitA
                    ? 'bg-[#DC2626] text-white shadow-xs'
                    : 'bg-white hover:bg-[#F1F3F5] text-[#DC2626] border border-[#FCA5A5]'
                }`}
                title="Place obstacle to block Emergency Exit A"
              >
                Block Exit A
              </button>
              <button
                onClick={clearObstacle}
                className={`px-2.5 py-1 rounded-lg text-xs font-sans font-medium transition-all ${
                  !obstacle.isBlockingExitA && obstacle.targetBlock === 'none'
                    ? 'bg-[#16A34A] text-white font-semibold'
                    : 'bg-white hover:bg-[#F1F3F5] text-[#667085] border border-[#E2E5E9]'
                }`}
                title="Reset to unobstructed baseline"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-[#98A2B3] shrink-0 hidden sm:block" />

        {/* STEP 2: SIMULATE FUTURE */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={simulateFuture}
            disabled={isSimulating}
            className={`group px-5 py-2.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md hover:shadow-lg ${
              isSimulating
                ? 'bg-[#2563EB]/80 text-white cursor-wait'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white hover:-translate-y-0.5'
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-bold">
              2
            </div>
            <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Computing A*...' : 'SIMULATE FUTURE →'}</span>
          </button>
        </div>

        <ArrowRight className="w-4 h-4 text-[#98A2B3] shrink-0 hidden sm:block" />

        {/* STEP 3: OBSERVE & ANALYZE */}
        <div
          className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all ${
            timelinePhase === 'AFTER'
              ? 'bg-[#EFF6FF] border border-[#BFDBFE]'
              : 'bg-[#F7F8FA] border border-[#E2E5E9]'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-sans font-bold ${
              timelinePhase === 'AFTER'
                ? 'bg-[#2563EB] text-white'
                : 'bg-white text-[#667085] border border-[#E2E5E9]'
            }`}
          >
            3
          </div>
          <div>
            <span className="text-[10px] font-sans uppercase tracking-wider text-[#667085] block font-bold">
              STEP 3: CONSEQUENCES
            </span>
            <div className="flex items-center space-x-2 mt-0.5 font-sans text-xs">
              {timelinePhase === 'AFTER' ? (
                <>
                  <span className="text-[#DC2626] font-bold">+{consequence.estimatedDelay}s Delay</span>
                  <span className="text-[#98A2B3]">&bull;</span>
                  <span className="text-[#2563EB] font-bold">{consequence.affectedPeople} Rerouted</span>
                  <span className="text-[#98A2B3]">&bull;</span>
                  <span className="text-[#16A34A] font-bold">{consequence.recommendedExit.split(' ')[0]}</span>
                </>
              ) : (
                <span className="text-[#98A2B3] font-medium">Awaiting Simulation</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Reset Button */}
        <button
          onClick={resetScenario}
          className="p-2 rounded-xl bg-white hover:bg-[#F1F3F5] text-[#667085] hover:text-[#172033] border border-[#E2E5E9] transition-colors shrink-0 shadow-xs"
          title="Reset back to baseline"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
