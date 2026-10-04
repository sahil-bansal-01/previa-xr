import React from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';

export type AnalysisStage = 'upload' | 'extracting' | 'preparing' | 'ready';

interface AnalysisProgressProps {
  currentStage: AnalysisStage;
  progressPercent: number;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  currentStage,
  progressPercent,
}) => {
  const steps: Array<{ id: AnalysisStage; num: string; label: string }> = [
    { id: 'upload', num: '01', label: 'Uploading...' },
    { id: 'extracting', num: '02', label: 'Extracting frames...' },
    { id: 'preparing', num: '03', label: 'Preparing map...' },
    { id: 'ready', num: '04', label: 'Ready.' },
  ];

  const getStageIndex = (stage: AnalysisStage) => {
    return steps.findIndex(s => s.id === stage);
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="bg-white border border-[#E2E5E9] rounded-2xl p-6 md:p-8 space-y-6 shadow-subtle">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold tracking-wider text-[#2563EB] uppercase">
            Step 1 &bull; Spatial Analysis
          </span>
          <h2 className="text-xl font-bold text-[#172033] flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#2563EB]" />
            <span>Analyzing Your Space</span>
          </h2>
        </div>
        <span className="text-xl font-bold text-[#2563EB] font-mono">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#F1F3F5] rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 4 Steps Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex || (currentStage === 'ready' && idx === 3);
          const isCurrent = idx === currentIndex && currentStage !== 'ready';

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border text-xs transition-all flex items-center space-x-3 ${
                isDone
                  ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]'
                  : isCurrent
                  ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB] shadow-xs'
                  : 'bg-[#F8FAFC] border-[#E2E5E9] text-[#98A2B3]'
              }`}
            >
              {/* Stepper Indicator */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  isDone
                    ? 'bg-[#16A34A] text-white'
                    : isCurrent
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#E2E5E9] text-[#667085]'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  step.num
                )}
              </div>

              <div className="flex flex-col truncate">
                <span className="text-[10px] text-[#98A2B3] font-medium uppercase tracking-wider">
                  Step {step.num}
                </span>
                <span className="font-semibold truncate text-[#172033]">
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
