import React from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export type AnalysisStage = 'upload' | 'extracting' | 'preparing' | 'ready';

interface AnalysisProgressProps {
  currentStage: AnalysisStage;
  progressPercent: number;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  currentStage,
  progressPercent,
}) => {
  const stages: Array<{ id: AnalysisStage; label: string }> = [
    { id: 'upload', label: '1. Upload received' },
    { id: 'extracting', label: '2. Extracting frames' },
    { id: 'preparing', label: '3. Preparing spatial map' },
    { id: 'ready', label: '4. Ready for verification' },
  ];

  const getStageIndex = (stage: AnalysisStage) => {
    return stages.findIndex(s => s.id === stage);
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
            Analysis In Progress
          </span>
          <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
            <span>STEP 1 — ANALYZING YOUR SPACE</span>
          </h2>
        </div>
        <span className="text-xl font-mono font-extrabold text-cyan-300">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stages Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((stage, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : isCurrent
                  ? 'bg-cyan-950/50 border-cyan-500/80 text-cyan-200 ring-1 ring-cyan-500/40 shadow-lg'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-2">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className="font-semibold truncate">{stage.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
