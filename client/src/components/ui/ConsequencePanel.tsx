import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import {
  Navigation,
  ChevronRight,
  ChevronLeft,
  BarChart2,
  HelpCircle,
} from 'lucide-react';

interface ConsequencePanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ConsequencePanel: React.FC<ConsequencePanelProps> = ({ isOpen, onToggle }) => {
  const { consequence, timelinePhase } = useSimulation();

  const isSimulated = timelinePhase === 'AFTER';
  const alternativeExit = isSimulated ? consequence.recommendedExit || '—' : '—';
  const congestionDisplay = isSimulated ? consequence.congestionLevel : '—';

  const whyText = isSimulated
    ? consequence.whySentence || 'Main Exit was blocked, so occupants split across the nearest reachable exits.'
    : 'Run the simulation to see what changes.';

  if (!isOpen) {
    return (
      <div className="absolute top-16 right-4 z-20">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2E5E9] text-[#172033] hover:text-[#2563EB] font-sans text-xs font-bold shadow-sm transition-all"
          title="Open CONSEQUENCES panel"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#667085]" />
          <BarChart2 className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>CONSEQUENCES</span>
          {isSimulated && (
            <span className="text-[10px] bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] px-1.5 py-0.5 rounded font-bold">
              +{consequence.estimatedDelay}s
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <aside className="absolute top-16 right-4 z-20 w-80 bg-white border border-[#E2E5E9] rounded-2xl shadow-lg overflow-hidden font-sans">
      {/* Header */}
      <div className="p-3.5 border-b border-[#E2E5E9] flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-xs">
            2
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#172033] tracking-wide uppercase">
              CONSEQUENCES
            </h2>
            <span className="text-[10px] text-[#667085] uppercase tracking-wider">
              CONSEQUENCES
            </span>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="p-1 rounded-lg text-[#667085] hover:text-[#172033] hover:bg-[#F1F3F5] transition-colors"
          title="Collapse Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 space-y-3.5 text-xs">
        {/* Core Metrics Grid: Affected, Rerouted, Congestion, Delay */}
        <div className="grid grid-cols-2 gap-2">
          {/* Affected */}
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E5E9]">
            <div className="text-[10px] text-[#667085] uppercase font-bold tracking-wide">
              Affected
            </div>
            <div className="text-xl font-extrabold text-[#172033] font-mono mt-0.5">
              {isSimulated ? (
                <>
                  {consequence.affectedPeople}{' '}
                  <span className="text-xs text-[#98A2B3] font-normal">/ {consequence.totalPeople}</span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>

          {/* Rerouted */}
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E5E9]">
            <div className="text-[10px] text-[#667085] uppercase font-bold tracking-wide">
              Rerouted
            </div>
            <div className="text-xl font-extrabold text-[#2563EB] font-mono mt-0.5">
              {isSimulated ? consequence.reroutedPeople ?? consequence.affectedPeople : '—'}
            </div>
          </div>

          {/* Congestion */}
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E5E9]">
            <div className="text-[10px] text-[#667085] uppercase font-bold tracking-wide">
              Congestion
            </div>
            <div
              className={`text-base font-extrabold mt-0.5 ${
                !isSimulated
                  ? 'text-[#667085]'
                  : congestionDisplay === 'HIGH' || congestionDisplay === 'CRITICAL'
                  ? 'text-[#DC2626]'
                  : congestionDisplay === 'MODERATE' || congestionDisplay === 'MEDIUM'
                  ? 'text-[#D97706]'
                  : 'text-[#16A34A]'
              }`}
            >
              {congestionDisplay}
            </div>
          </div>

          {/* Delay */}
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E5E9]">
            <div className="text-[10px] text-[#667085] uppercase font-bold tracking-wide">
              Delay
            </div>
            <div className="text-xl font-extrabold text-[#DC2626] font-mono mt-0.5">
              {isSimulated ? (consequence.estimatedDelay > 0 ? `+${consequence.estimatedDelay} sec` : '0 sec') : '—'}
            </div>
          </div>
        </div>

        {/* Alternative Exit */}
        <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-[#16A34A]" />
            <div>
              <span className="text-[10px] text-[#16A34A] font-bold uppercase block">
                Alternative Exit
              </span>
              <span className="text-xs font-bold text-[#172033]">
                {alternativeExit}
              </span>
            </div>
          </div>
          {isSimulated && alternativeExit !== '—' && (
            <span className="text-[9px] bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded-full font-bold">
              SAFE
            </span>
          )}
        </div>

        {/* WHY? Explanation */}
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E5E9]">
          <div className="flex items-center space-x-1.5 text-[#2563EB] mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">WHY?</span>
          </div>
          <p className="text-[11px] text-[#475467] leading-relaxed">
            “{whyText}”
          </p>
        </div>
      </div>
    </aside>
  );
};
