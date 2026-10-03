import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
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
    obstacle,
    simulateFuture,
    blockExitA,
  } = useSimulation();

  const formattedTime = `00:${Math.floor(simulationTime).toString().padStart(2, '0')}s`;

  return (
    <footer className="h-20 w-full glass-panel border-t border-slate-800/80 bg-slate-950/85 z-20 px-6 flex items-center justify-between">
      {/* Left: Playback & Reset Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={togglePlayPause}
          className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-all shadow-md shadow-cyan-500/20"
          title={isPlaying ? 'Pause Simulation' : 'Play Movement'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <button
          onClick={resetScenario}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono font-medium text-slate-300 transition-colors"
          title="Reset to baseline"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>RESET SCENARIO</span>
        </button>

        {/* Speed Toggles */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
          <button
            onClick={() => setPlaybackSpeed(1)}
            className={`px-2 py-1 rounded transition-colors ${
              playbackSpeed === 1 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1x
          </button>
          <button
            onClick={() => setPlaybackSpeed(2)}
            className={`px-2 py-1 rounded transition-colors ${
              playbackSpeed === 2 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2x
          </button>
        </div>

        {/* Elapsed Time */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Time: <strong className="text-slate-100">{formattedTime}</strong></span>
        </div>
      </div>

      {/* Center: Visual BEFORE → ACTION → AFTER Phase Stepper */}
      <div className="flex items-center space-x-2">
        {/* Stage 1: BEFORE */}
        <button
          onClick={resetScenario}
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
            timelinePhase === 'BEFORE'
              ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-500'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div className="text-left">
            <span className="block text-[9px] text-slate-400 font-normal">STEP 1</span>
            <span>BEFORE (Baseline)</span>
          </div>
        </button>

        <ArrowRight className="w-4 h-4 text-slate-600" />

        {/* Stage 2: ACTION */}
        <button
          onClick={blockExitA}
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
            timelinePhase === 'ACTION'
              ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <div className="text-left">
            <span className="block text-[9px] text-slate-400 font-normal">STEP 2</span>
            <span>ACTION (Exit A Blocked)</span>
          </div>
        </button>

        <ArrowRight className="w-4 h-4 text-slate-600" />

        {/* Stage 3: AFTER */}
        <button
          onClick={simulateFuture}
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
            timelinePhase === 'AFTER'
              ? 'bg-violet-950/80 border-violet-500/80 text-violet-300 shadow-lg shadow-violet-500/20 ring-1 ring-violet-500'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <Users className="w-4 h-4 text-violet-400" />
          <div className="text-left">
            <span className="block text-[9px] text-slate-400 font-normal">STEP 3</span>
            <span>AFTER (Rerouted Future)</span>
          </div>
        </button>
      </div>

      {/* Right: Quick Action Hint / Status Indicator */}
      <div className="hidden lg:flex items-center space-x-3">
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Engine State</span>
          <span className="text-xs font-mono font-semibold text-cyan-400">
            {timelinePhase === 'AFTER' ? 'FUTURE SIMULATED' : isPlaying ? 'RUNNING REALTIME' : 'STANDBY READY'}
          </span>
        </div>
        <div className="h-8 w-px bg-slate-800"></div>
        <div className="text-xs font-mono text-slate-400">
          Mode: <strong className="text-slate-200">A* Pathfinding V1.0</strong>
        </div>
      </div>
    </footer>
  );
};
