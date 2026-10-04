import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Users,
} from 'lucide-react';

export const TimelineBar: React.FC = () => {
  const {
    timelinePhase,
    isPlaying,
    togglePlayPause,
    playbackSpeed,
    setPlaybackSpeed,
    simulationTime,
    resetScenario,
    simulateFuture,
    blockExitA,
  } = useSimulation();

  const formattedTime = `00:${Math.floor(simulationTime).toString().padStart(2, '0')}s`;

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-4 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-md border border-[#E2E5E9] rounded-2xl shadow-md p-2.5 flex items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Playback & Speed */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={togglePlayPause}
            className="w-9 h-9 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center transition-all shadow-sm shrink-0"
            title={isPlaying ? 'Pause Simulation' : 'Play Movement'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {/* Speed Toggles */}
          <div className="flex items-center bg-[#F1F3F5] border border-[#E2E5E9] rounded-lg p-0.5 text-xs font-sans">
            <button
              onClick={() => setPlaybackSpeed(1)}
              className={`px-2.5 py-0.5 rounded-md transition-colors font-medium ${
                playbackSpeed === 1 ? 'bg-white text-[#2563EB] font-bold shadow-xs' : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setPlaybackSpeed(2)}
              className={`px-2.5 py-0.5 rounded-md transition-colors font-medium ${
                playbackSpeed === 2 ? 'bg-white text-[#2563EB] font-bold shadow-xs' : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              2x
            </button>
          </div>

          {/* Elapsed Time */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white border border-[#E2E5E9] text-[#172033] font-sans text-xs shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Time: <strong className="text-[#172033] font-bold">{formattedTime}</strong></span>
          </div>
        </div>

        {/* Center: Visual Stepper Timeline */}
        <div className="hidden sm:flex items-center space-x-2 font-sans text-xs">
          {/* Stage 1: NOW / Baseline */}
          <button
            onClick={resetScenario}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${
              timelinePhase === 'BEFORE'
                ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB] font-bold shadow-xs'
                : 'bg-white border-[#E2E5E9] text-[#667085] hover:bg-[#F1F3F5]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>NOW &bull; Baseline</span>
          </button>

          <div className="w-4 h-0.5 bg-[#CBD5E1]"></div>

          {/* Stage 2: ACTION / Exit Blocked */}
          <button
            onClick={blockExitA}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${
              timelinePhase === 'ACTION'
                ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626] font-bold shadow-xs'
                : 'bg-white border-[#E2E5E9] text-[#667085] hover:bg-[#F1F3F5]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>ACTION &bull; Exit Blocked</span>
          </button>

          <div className="w-4 h-0.5 bg-[#CBD5E1]"></div>

          {/* Stage 3: FUTURE / Rerouted */}
          <button
            onClick={simulateFuture}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${
              timelinePhase === 'AFTER'
                ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB] font-bold shadow-xs'
                : 'bg-white border-[#E2E5E9] text-[#667085] hover:bg-[#F1F3F5]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>FUTURE &bull; Rerouted</span>
          </button>
        </div>

        {/* Right: Reset Action */}
        <button
          onClick={resetScenario}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F1F3F5] border border-[#E2E5E9] text-xs font-sans font-semibold text-[#172033] transition-colors shrink-0 shadow-xs"
          title="Reset scenario environment"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#667085]" />
          <span>RESET</span>
        </button>
      </div>
    </div>
  );
};
