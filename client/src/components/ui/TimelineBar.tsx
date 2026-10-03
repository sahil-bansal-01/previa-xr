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
      <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 flex items-center justify-between gap-3 pointer-events-auto ring-1 ring-cyan-500/20">
        {/* Left: Playback & Speed */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={togglePlayPause}
            className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-all shadow-md shadow-cyan-500/20 shrink-0"
            title={isPlaying ? 'Pause Simulation' : 'Play Movement'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {/* Speed Toggles */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setPlaybackSpeed(1)}
              className={`px-2 py-0.5 rounded transition-colors ${
                playbackSpeed === 1 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setPlaybackSpeed(2)}
              className={`px-2 py-0.5 rounded transition-colors ${
                playbackSpeed === 2 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2x
            </button>
          </div>

          {/* Elapsed Time */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Time: <strong className="text-slate-100">{formattedTime}</strong></span>
          </div>
        </div>

        {/* Center: Visual Stepper Phases */}
        <div className="hidden sm:flex items-center space-x-1.5 font-mono text-xs">
          {/* Stage 1: BEFORE */}
          <button
            onClick={resetScenario}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all ${
              timelinePhase === 'BEFORE'
                ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300 font-bold'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>1. Baseline</span>
          </button>

          <ArrowRight className="w-3 h-3 text-slate-600" />

          {/* Stage 2: ACTION */}
          <button
            onClick={blockExitA}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all ${
              timelinePhase === 'ACTION'
                ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Exit A Blocked</span>
          </button>

          <ArrowRight className="w-3 h-3 text-slate-600" />

          {/* Stage 3: AFTER */}
          <button
            onClick={simulateFuture}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all ${
              timelinePhase === 'AFTER'
                ? 'bg-violet-950/80 border-violet-500/80 text-violet-300 font-bold shadow-md shadow-violet-500/20'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-violet-400" />
            <span>3. Rerouted Future</span>
          </button>
        </div>

        {/* Right: Reset Action */}
        <button
          onClick={resetScenario}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-medium text-slate-300 transition-colors shrink-0"
          title="Reset scenario environment"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>RESET SCENARIO</span>
        </button>
      </div>
    </div>
  );
};
